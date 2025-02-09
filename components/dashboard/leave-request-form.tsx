"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, isWithinInterval, parseISO } from "date-fns"

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
import { Leave, LeaveType, LeaveRequestFormProps, leaveRequestSchema, LeaveRequestValues } from "@/lib/types/leave"

export function LeaveRequestForm({ open, onOpenChange, onSuccess }: LeaveRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const [existingLeaves, setExistingLeaves] = useState<Leave[]>([])
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD")

  // Get user ID and existing leaves on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, leavesResponse] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/leaves")
        ]);
        const userData = await userResponse.json();
        const leavesData = await leavesResponse.json();
        
        if (userData.id) {
          setUserId(userData.id);
          if (userData.companies?.date_format) {
            setDateFormat(userData.companies.date_format);
          }
        }
        setExistingLeaves(leavesData);
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    }
    fetchUserData()
  }, [])

  // Initialize form
  const form = useForm<LeaveRequestValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveTypeId: "",
      dateStart: format(new Date(2025, 1, 8), dateFormat.toLowerCase()),
      dateEnd: format(new Date(2025, 1, 8), dateFormat.toLowerCase()),
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

  // Check for any overlapping leaves regardless of type
  const checkOverlap = (startDate: string, endDate: string) => {
    const newStart = parseISO(startDate);
    const newEnd = parseISO(endDate);

    // Check against all existing leaves
    return existingLeaves.some(leave => {
      const leaveStart = parseISO(leave.date_start);
      const leaveEnd = parseISO(leave.date_end);

      // Check if any part of the new leave overlaps with existing leave
      const hasOverlap = (
        isWithinInterval(newStart, { start: leaveStart, end: leaveEnd }) ||
        isWithinInterval(newEnd, { start: leaveStart, end: leaveEnd }) ||
        isWithinInterval(leaveStart, { start: newStart, end: newEnd })
      );

      return hasOverlap;
    });
  };

  async function onSubmit(data: LeaveRequestValues) {
    try {
      // Check for overlapping dates
      if (checkOverlap(data.dateStart, data.dateEnd)) {
        form.setError("dateStart", {
          type: "manual",
          message: "You already have leave scheduled during this period"
        });
        return;
      }

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

      // Close modal and refresh data
      onOpenChange(false)
      if (onSuccess) {
        await onSuccess()
      }
      
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
                        <SelectItem 
                          key={type.id} 
                          value={type.id.toString()}
                          className="flex items-center justify-between"
                        >
                          <span>{type.name}</span>
                          <span className={`ml-2 text-xs font-medium ${
                            type.use_personal 
                              ? 'text-amber-500'
                              : type.use_allowance 
                                ? 'text-green-600' 
                                : 'text-red-500'
                          }`}>
                            {type.use_allowance 
                              ? type.use_personal 
                                ? "(Paid - Personal)" 
                                : "(Paid)"
                              : "(Unpaid)"}
                          </span>
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
                      <Input type="date" required {...field} />
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
                      <Input type="date" required {...field} />
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
