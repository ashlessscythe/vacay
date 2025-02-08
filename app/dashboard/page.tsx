"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Users, Briefcase, Plus } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { LeaveBalance } from "@/components/dashboard/leave-balance"
import { LeaveRequestForm } from "@/components/dashboard/leave-request-form"
import { Button } from "@/components/ui/button"

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

  // Calculate upcoming absences (future leaves)
  const upcomingAbsences = leaves.filter(leave => new Date(leave.date_start) > new Date())

  return (
    <div className="space-y-6 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-cyan-50/50 to-teal-50/50 dark:from-blue-950/50 dark:via-cyan-950/50 dark:to-teal-950/50 animate-gradient-slow -z-10 rounded-3xl" />
      <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent animate-gradient">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Leave</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                "..."
              ) : (
                <LeaveBalance compact />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Your current leave balance
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? (
                "..."
              ) : (
                <div className="flex flex-col">
                  <span>{pendingRequests} requests</span>
                  <span className="text-sm font-normal text-gray-500">
                    <LeaveBalance compact pendingOnly />
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              In your department
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Types</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : leaveTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Available categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <LeaveBalance />
          <Button 
            onClick={() => setShowLeaveRequest(true)}
            className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Request Leave
          </Button>
        </div>
      </div>

      <LeaveRequestForm 
        open={showLeaveRequest} 
        onOpenChange={setShowLeaveRequest}
        onSuccess={fetchDashboardData}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentLeaves.length > 0 ? (
              <div className="space-y-2">
                {recentLeaves.map(leave => (
                  <div key={leave.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: leave.leave_types.color }} 
                      />
                      <span>{leave.leave_types.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(leave.date_start).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent leave requests to display.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming Team Absences</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : upcomingAbsences.length > 0 ? (
              <div className="space-y-2">
                {upcomingAbsences.map(leave => (
                  <div key={leave.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: leave.leave_types.color }} 
                      />
                      <span>{leave.leave_types.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(leave.date_start).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming team absences to display.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
