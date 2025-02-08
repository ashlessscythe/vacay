"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Validation schema
const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  dateStart: z.string().min(1, "Start date is required"),
  dateEnd: z.string().min(1, "End date is required"),
  dayPartStart: z.string().min(1, "Start day part is required"),
  dayPartEnd: z.string().min(1, "End day part is required"),
  employeeComment: z.string().optional(),
})

type LeaveRequestValues = z.infer<typeof leaveRequestSchema>

interface LeaveType {
  id: number
  name: string
  color: string
  use_allowance: boolean
}

interface LeaveRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeaveRequestForm({ open, onOpenChange }: LeaveRequestFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [userId, setUserId] = useState<number | null>(null)

  // Get user ID on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user")
        const data = await response.json()
        if (data.id) {
          setUserId(data.id)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }
    fetchUser()
  }, [])

  // Initialize form
  const form = useForm<LeaveRequestValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveTypeId: "",
      dateStart: format(new Date(), "yyyy-MM-dd"),
      dateEnd: format(new Date(), "yyyy-MM-dd"),
      dayPartStart: "1", // Full day
      dayPartEnd: "1", // Full day
      employeeComment: "",
    },
  })

  // Load leave types on component mount
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await fetch("/api/leave-types")
        const data = await response.json()
        setLeaveTypes(data)
      } catch (error) {
        console.error("Failed to fetch leave types:", error)
      }
    }
    fetchLeaveTypes()
  }, [])

  async function onSubmit(data: LeaveRequestValues) {
    try {
      setIsLoading(true)
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: userId,
          status: 1, // Pending approval
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit leave request")
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error submitting leave request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dayPartStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Day Part</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day part" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Full Day</SelectItem>
                        <SelectItem value="2">Morning</SelectItem>
                        <SelectItem value="3">Afternoon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dayPartEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Day Part</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day part" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Full Day</SelectItem>
                        <SelectItem value="2">Morning</SelectItem>
                        <SelectItem value="3">Afternoon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="employeeComment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Leave Request"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
