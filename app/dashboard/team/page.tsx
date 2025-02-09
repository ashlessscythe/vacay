import { TeamCalendarGrid } from "@/components/dashboard/team-calendar-grid"

export default function TeamPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Team Calendar</h2>
      </div>
      <TeamCalendarGrid />
    </div>
  )
}
