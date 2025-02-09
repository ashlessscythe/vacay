"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LeaveApprovalProps {
  leaveId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => Promise<void>
}

export function LeaveApproval({ leaveId, open, onOpenChange, onSuccess }: LeaveApprovalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [comment, setComment] = useState("")

  const handleAction = async (approved: boolean) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/leaves/${leaveId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved,
          comment
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update leave request")
      }

      onOpenChange(false)
      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      console.error("Error updating leave request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave Request Action</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => handleAction(false)}
              disabled={isLoading}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleAction(true)}
              disabled={isLoading}
            >
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
