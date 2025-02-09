import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDays } from "@/lib/utils";

interface Leave {
  id: number;
  date_start: string;
  date_end: string;
  day_part_start: number;
  day_part_end: number;
  status: number;
  leave_types: {
    name: string;
    color: string;
  };
}

const getStatusDetails = (status: number): { text: string; classes: string } => {
  switch (status) {
    case 2:
      return {
        text: "Approved",
        classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      };
    case 3:
      return {
        text: "Rejected",
        classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      };
    default:
      return {
        text: "Pending",
        classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      };
  }
};

interface RecentLeavesProps {
  loading: boolean;
  leaves: Leave[];
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
            {leaves.map((leave) => {
              const dayCount = calculateDays(
                new Date(leave.date_start),
                new Date(leave.date_end),
                leave.day_part_start,
                leave.day_part_end
              );

              return (
                <div
                  key={leave.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: leave.leave_types.color }}
                    />
                    <span>{leave.leave_types.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{new Date(leave.date_start).toLocaleDateString()}</span>
                      <span>({dayCount} day{dayCount !== 1 ? "s" : ""})</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusDetails(leave.status).classes}`}>
                      {getStatusDetails(leave.status).text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recent leave requests to display.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
