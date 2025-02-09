"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "@/lib/types/user"

interface TeamMemberManagementProps {
  members: User[]
  departments: { id: number; name: string }[]
  onAddMember: (data: { email: string; department_id: number; role: "admin" | "manager" | "employee" }) => Promise<void>
  onUpdateMember: (userId: number, data: { department_id?: number; role?: "admin" | "manager" | "employee" }) => Promise<void>
  onRemoveMember: (userId: number) => Promise<void>
}

export function TeamMemberManagement({
  members,
  departments,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}: TeamMemberManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null)
  const [selectedRole, setSelectedRole] = useState<"admin" | "manager" | "employee">("employee")

  const handleAddMember = async () => {
    try {
      await onAddMember({
        email: newMemberEmail,
        department_id: selectedDepartment!,
        role: selectedRole,
      })
      setIsAddDialogOpen(false)
      setNewMemberEmail("")
      setSelectedDepartment(null)
      setSelectedRole("employee")
    } catch (error) {
      console.error("Failed to add team member:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="member@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={selectedDepartment?.toString() || ""} 
                  onValueChange={(value) => setSelectedDepartment(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={selectedRole} 
                  onValueChange={(value: string) => 
                    setSelectedRole(value as "admin" | "manager" | "employee")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddMember} className="w-full">
                Add Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id} className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveMember(member.id)}
                >
                  Remove
                </Button>
              </div>
              <div className="space-y-2">
                <Select
                  value={member.department_id?.toString() || ""}
                  onValueChange={(value) => onUpdateMember(member.id, { department_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department">
                      {member.departments?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={member.admin ? "admin" : member.manager ? "manager" : "employee"}
                  onValueChange={(value: "admin" | "manager" | "employee") => 
                    onUpdateMember(member.id, { role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
