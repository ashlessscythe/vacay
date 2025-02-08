import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Leave {
  id: number
  date_start: string
  leave_types: {
    name: string
    color: string
  }
}

interface RecentLeavesProps {
  loading: boolean
  leaves: Leave[]
}

export function RecentLeaves({ loading, leaves }: RecentLeavesProps) {
  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-950/50 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Recent Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : leaves.length > 0 ? (
          <div className="space-y-2">
            {leaves.map(leave => (
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
  )
}
