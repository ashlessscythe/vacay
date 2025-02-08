import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Users, Briefcase } from "lucide-react"

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">15 days</div>
            <p className="text-xs text-muted-foreground">
              +2.5 days next month
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
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
            <div className="text-2xl font-bold">12</div>
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
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              Available categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent leave requests to display.
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-3 backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming Team Absences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No upcoming team absences to display.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
