"use client"

import { useState, useEffect } from "react"
import { TeamMemberManagement } from "@/components/dashboard/team-member-management"
import { User } from "@/lib/types/user"
import { toast } from "@/hooks/use-toast"

export default function MembersPage() {
  const [members, setMembers] = useState<User[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetchDepartments()
    fetchMembers()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/team/departments")
      if (!response.ok) throw new Error("Failed to fetch departments")
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      })
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/team/members")
      if (!response.ok) throw new Error("Failed to fetch members")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      })
    }
  }

  const handleAddMember = async (data: { email: string; department_id: number; role: "admin" | "manager" | "employee" }) => {
    try {
      const response = await fetch("/api/team/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to add member")
      await fetchMembers()
      toast({
        title: "Success",
        description: "Team member added successfully",
      })
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleUpdateMember = async (userId: number, data: { department_id?: number; role?: "admin" | "manager" | "employee" }) => {
    try {
      const response = await fetch("/api/team/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      })
      if (!response.ok) throw new Error("Failed to update member")
      await fetchMembers()
      toast({
        title: "Success",
        description: "Team member updated successfully",
      })
    } catch (error) {
      console.error("Error updating member:", error)
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (userId: number) => {
    try {
      const response = await fetch(`/api/team/members?userId=${userId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to remove member")
      await fetchMembers()
      toast({
        title: "Success",
        description: "Team member removed successfully",
      })
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      })
    }
  }

  return (
    <TeamMemberManagement
      members={members}
      departments={departments.map(d => ({ id: parseInt(d.id), name: d.name }))}
      onAddMember={handleAddMember}
      onUpdateMember={handleUpdateMember}
      onRemoveMember={handleRemoveMember}
    />
  )
}
