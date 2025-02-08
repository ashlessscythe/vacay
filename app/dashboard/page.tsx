"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeaveRequestForm } from "@/components/dashboard/leave-request-form"
import { TeamCalendar } from "@/components/dashboard/calendar"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { LeaveBalanceSection } from "@/components/dashboard/leave-balance-section"
import { RecentLeaves } from "@/components/dashboard/recent-leaves"

interface LeaveType {
  id: number
  name: string
  color: string
  use_allowance: boolean
  limit: number
  auto_approve: boolean
}

interface Leave {
  id: number
  status: number
  date_start: string
  date_end: string
  employee_comment: string | null
  leave_types: {
    name: string
    color: string
  }
}

interface User {
  id: number
  name: string
  lastname: string
  email: string
  department_id: number
}

type FetchDashboardData = () => Promise<void>;

export default function DashboardPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showLeaveRequest, setShowLeaveRequest] = useState(false)

  const fetchDashboardData: FetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [leaveTypesRes, leavesRes, teamRes] = await Promise.all([
        fetch('/api/leave-types'),
        fetch('/api/leaves'),
        fetch('/api/team')
      ])

      const [leaveTypesData, leavesData, teamData] = await Promise.all([
        leaveTypesRes.json(),
        leavesRes.json(),
        teamRes.json()
      ])

      setLeaveTypes(leaveTypesData)
      setLeaves(leavesData)
      setTeamMembers(teamData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    window.dashboardRefresh = fetchDashboardData
    return () => {
      delete window.dashboardRefresh
    }
  }, [fetchDashboardData])

  // Calculate pending requests
  const pendingRequests = leaves.filter(leave => leave.status === 1).length

  // Get recent leave requests
  const recentLeaves = leaves.slice(0, 5)

  return (
    <div className="space-y-6 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-cyan-50/50 to-teal-50/50 dark:from-blue-950/50 dark:via-cyan-950/50 dark:to-teal-950/50 animate-gradient-slow -z-10 rounded-3xl" />
      <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent animate-gradient">Dashboard</h2>
      
      <StatsOverview 
        loading={loading}
        pendingRequests={pendingRequests}
        teamMembersCount={teamMembers.length}
        leaveTypesCount={leaveTypes.length}
      />

      <LeaveBalanceSection onRequestLeave={() => setShowLeaveRequest(true)} />

      <LeaveRequestForm 
        open={showLeaveRequest} 
        onOpenChange={setShowLeaveRequest}
        onSuccess={fetchDashboardData}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <RecentLeaves loading={loading} leaves={recentLeaves} />
        
        <Card className="col-span-3 backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Team Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamCalendar />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
