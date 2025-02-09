"use client"

import { Card } from "@/components/ui/card"

interface LeaveType {
  name: string
  color: string
}

interface TeamCalendarLegendProps {
  leaveTypes: LeaveType[]
}

export function TeamCalendarLegend({ leaveTypes }: TeamCalendarLegendProps) {
  return (
    <Card className="p-4">
      <div className="text-sm font-medium mb-3">Legend</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Status indicators */}
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-sm bg-yellow-100 dark:bg-yellow-900/30" />
          <span className="text-sm text-muted-foreground">Pending</span>
        </div>

        {/* Leave type indicators */}
        {leaveTypes.map((type) => (
          <div key={type.name} className="flex items-center space-x-2">
            <div 
              className="h-3 w-3 rounded-sm" 
              style={{ 
                backgroundColor: type.color,
                opacity: 0.2
              }} 
            />
            <span className="text-sm text-muted-foreground">{type.name}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
