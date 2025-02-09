"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { LeaveApproval } from "./leave-approval"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface User {
  name: string
  lastname: string
  email: string
}

interface LeaveType {
  name: string
  color: string
}

interface Leave {
  id: number
  date_start: string
  date_end: string
  employee_comment: string | null
  users_leaves_user_idTousers: User
  leave_types: LeaveType
}

interface LeaveApprovalListProps {
  leaves: Leave[]
}

export function LeaveApprovalList({ leaves }: LeaveApprovalListProps) {
  const [selectedLeave, setSelectedLeave] = useState<number | null>(null)
  const [updatedLeaves, setUpdatedLeaves] = useState<Leave[]>([])

  // Update state when leaves prop changes
  useEffect(() => {
    setUpdatedLeaves(leaves || [])
  }, [leaves])

  const handleSuccess = async () => {
    // Remove approved/rejected leave from list
    setUpdatedLeaves(updatedLeaves.filter(leave => leave.id !== selectedLeave))
    setSelectedLeave(null)
  }

  if (updatedLeaves.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Pending Requests</CardTitle>
          <CardDescription>
            All leave requests have been processed
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {updatedLeaves.map((leave) => (
        <Card key={leave.id}>
          <CardHeader>
            <CardTitle>
              {leave.users_leaves_user_idTousers.name}{" "}
              {leave.users_leaves_user_idTousers.lastname}
            </CardTitle>
            <CardDescription>
              {leave.leave_types.name} Leave Request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Duration: </span>
                  {format(new Date(leave.date_start), "MMM d, yyyy")} -{" "}
                  {format(new Date(leave.date_end), "MMM d, yyyy")}
                </div>
                <Button
                  onClick={() => setSelectedLeave(leave.id)}
                >
                  Review Request
                </Button>
              </div>
              {leave.employee_comment && (
                <div className="text-sm">
                  <span className="font-medium">Comment: </span>
                  {leave.employee_comment}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {selectedLeave && (
        <LeaveApproval
          leaveId={selectedLeave}
          open={selectedLeave !== null}
          onOpenChange={() => setSelectedLeave(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
