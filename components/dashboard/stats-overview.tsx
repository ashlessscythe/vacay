import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Users, Briefcase } from "lucide-react"
import { LeaveBalance } from "@/components/dashboard/leave-balance"

interface StatsOverviewProps {
  loading: boolean
  pendingRequests: number
  teamMembersCount: number
  leaveTypesCount: number
}

export function StatsOverview({
  loading,
  pendingRequests,
  teamMembersCount,
  leaveTypesCount,
}: StatsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Leave</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : <LeaveBalance compact />}
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
          <div className="text-2xl font-bold">{loading ? "..." : teamMembersCount}</div>
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
          <div className="text-2xl font-bold">{loading ? "..." : leaveTypesCount}</div>
          <p className="text-xs text-muted-foreground">
            Available categories
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
