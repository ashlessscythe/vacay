"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { toast } from "@/hooks/use-toast"

const companySettingsSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Company name is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  date_format: z.string().min(1, "Date format is required"),
  last_name_first: z.boolean(),
  
  // Leave Management
  start_of_new_year: z.number().min(1).max(12),
  carry_over: z.number().min(0),
  payroll_close_time: z.number().min(0).max(23),
  
  // Display Settings
  share_all_absences: z.boolean(),
  is_team_view_hidden: z.boolean(),
  company_wide_message: z.string().optional(),
  company_wide_message_text_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  company_wide_message_bg_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
})

const departmentSettingsSchema = z.object({
  departmentId: z.number(),
  allowance: z.number().min(0),
  personal: z.number().min(0),
  include_public_holidays: z.boolean(),
  is_accrued_allowance: z.boolean(),
})

type CompanySettingsValues = z.infer<typeof companySettingsSchema>

interface CompanySettingsProps {
  initialSettings: CompanySettingsValues
}

export function CompanySettings({ initialSettings }: CompanySettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Array<{
    id: number
    name: string
    allowance: number
    personal: number
    include_public_holidays: boolean
    is_accrued_allowance: boolean
  }>>([])
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments/settings")
        if (!response.ok) throw new Error("Failed to fetch departments")
        const data = await response.json()
        setDepartments(data)
        if (data.length > 0) {
          setSelectedDepartment(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching departments:", error)
        toast({
          title: "Error",
          description: "Failed to load departments. Please try again.",
          variant: "destructive",
        })
      }
    }
    fetchDepartments()
  }, [])

  const handleDepartmentSettingsSubmit = async (departmentId: number, settings: any) => {
    try {
      const response = await fetch("/api/departments/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departmentId,
          ...settings,
        }),
      })

      if (!response.ok) throw new Error("Failed to update department settings")

      toast({
        title: "Settings updated",
        description: "Department settings have been successfully updated.",
      })

      // Refresh departments list
      const depsResponse = await fetch("/api/departments/settings")
      if (!depsResponse.ok) throw new Error("Failed to refresh departments")
      const data = await depsResponse.json()
      setDepartments(data)
    } catch (error) {
      console.error("Error updating department settings:", error)
      toast({
        title: "Error",
        description: "Failed to update department settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const form = useForm<CompanySettingsValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: initialSettings,
  })

  async function onSubmit(data: CompanySettingsValues) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/companies/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      toast({
        title: "Settings updated",
        description: "Company settings have been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating company settings:", error)
      toast({
        title: "Error",
        description: "Failed to update company settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Manage your company's basic information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name_first"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-x-2">
                  <FormLabel>Display Last Name First</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Department Settings</CardTitle>
              <CardDescription>
                Configure department-specific settings and policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Select Department</FormLabel>
                  <Select
                    value={selectedDepartment?.toString()}
                    onValueChange={(value) => setSelectedDepartment(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>

                {selectedDepartment && (
                  <>
                    {departments.filter(d => d.id === selectedDepartment).map(dept => (
                      <div key={dept.id} className="space-y-4">
                        <FormItem>
                          <FormLabel>Annual Leave Allowance</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              value={dept.allowance}
                              onChange={e => {
                                const newDepts = departments.map(d => 
                                  d.id === dept.id 
                                    ? {...d, allowance: parseFloat(e.target.value)} 
                                    : d
                                )
                                setDepartments(newDepts)
                              }}
                            />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Personal Days</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              value={dept.personal}
                              onChange={e => {
                                const newDepts = departments.map(d => 
                                  d.id === dept.id 
                                    ? {...d, personal: parseFloat(e.target.value)} 
                                    : d
                                )
                                setDepartments(newDepts)
                              }}
                            />
                          </FormControl>
                        </FormItem>

                        <FormItem className="flex items-center justify-between space-x-2">
                          <FormLabel>Include Public Holidays</FormLabel>
                          <Switch
                            checked={dept.include_public_holidays}
                            onCheckedChange={checked => {
                              const newDepts = departments.map(d => 
                                d.id === dept.id 
                                  ? {...d, include_public_holidays: checked} 
                                  : d
                              )
                              setDepartments(newDepts)
                            }}
                          />
                        </FormItem>

                        <FormItem className="flex items-center justify-between space-x-2">
                          <FormLabel>Accrue Leave Allowance</FormLabel>
                          <Switch
                            checked={dept.is_accrued_allowance}
                            onCheckedChange={checked => {
                              const newDepts = departments.map(d => 
                                d.id === dept.id 
                                  ? {...d, is_accrued_allowance: checked} 
                                  : d
                              )
                              setDepartments(newDepts)
                            }}
                          />
                        </FormItem>

                        <Button
                          type="button"
                          onClick={() => handleDepartmentSettingsSubmit(dept.id, {
                            allowance: dept.allowance,
                            personal: dept.personal,
                            include_public_holidays: dept.include_public_holidays,
                            is_accrued_allowance: dept.is_accrued_allowance,
                          })}
                          className="mt-4"
                        >
                          Save Department Settings
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Leave Management</CardTitle>
            <CardDescription>
              Configure how leave years and balances are managed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="start_of_new_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start of New Year (Month)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carry_over"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Days to Carry Over</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payroll_close_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payroll Close Time (24h)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="23" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormDescription>
                    Hour of the day when payroll closes (0-23)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Configure visibility and appearance settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="share_all_absences"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-x-2">
                  <FormLabel>Share All Absences</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_team_view_hidden"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-x-2">
                  <FormLabel>Hide Team View for Non-Privileged Users</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_wide_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company-Wide Message</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_wide_message_text_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Text Color</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_wide_message_bg_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Background Color</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
