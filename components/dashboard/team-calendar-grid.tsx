"use client"

import * as React from "react"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { addDays, format, startOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns"
import { cn } from "@/lib/utils"
import { ViewMode, TeamCalendarControls } from "./team-calendar-controls"
import { TeamCalendarLegend } from "./team-calendar-legend"
import { LeaveApproval } from "./leave-approval"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface LeaveType {
  name: string
  color: string
}

interface Leave {
  id: number
  dateStart: string
  dateEnd: string
  status: "approved" | "pending"
  leaveType?: LeaveType
}

interface TeamMemberLeave {
  id: number
  name: string
  leaves: Leave[]
}

interface DayLeave {
  date: string
  status: "approved" | "pending" | "none"
  leaveType?: LeaveType
  originalLeave?: Leave
}

interface CellPopoverProps {
  dayLeave: DayLeave;
  member: TeamMemberLeave;
  onRefresh: () => Promise<void>;
  isManager: boolean;
}

const CellPopover = React.memo(({ dayLeave, member, onRefresh, isManager }: CellPopoverProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [showApproval, setShowApproval] = useState<boolean>(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 500);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div 
          ref={triggerRef}
          className="h-full w-full cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-2">
          <div className="space-y-1">
            <div className="font-medium leading-none">{member.name}</div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(dayLeave.date), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="grid gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <span className={cn(
                "capitalize",
                dayLeave.status === "approved" ? "text-green-600" : "text-yellow-600"
              )}>
                {dayLeave.status}
              </span>
            </div>
            {dayLeave.leaveType && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Type:</span>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: dayLeave.leaveType.color }}
                  />
                  <span>{dayLeave.leaveType.name}</span>
                </div>
              </div>
            )}
            {dayLeave.originalLeave && (
              <>
                <div className="text-xs text-muted-foreground mt-2">
                  {format(new Date(dayLeave.originalLeave.dateStart), "MMM d")} - {format(new Date(dayLeave.originalLeave.dateEnd), "MMM d, yyyy")}
                </div>
                {isManager && dayLeave.status === "pending" && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        setShowApproval(true)
                      }}
                    >
                      Review Request
                    </Button>
                  </div>
                )}
                {showApproval && (
                  <LeaveApproval
                    leaveId={dayLeave.originalLeave.id}
                    open={showApproval}
                    onOpenChange={setShowApproval}
                    onSuccess={onRefresh}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

CellPopover.displayName = 'CellPopover';

export function TeamCalendarGrid() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [monthData, setMonthData] = useState<TeamMemberLeave[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isManager, setIsManager] = useState<boolean>(false)

  // Check if user is a manager once on mount
  useEffect(() => {
    const checkManager = async () => {
      try {
        const response = await fetch("/api/user")
        const data = await response.json()
        setIsManager(data.manager || false)
      } catch (error) {
        console.error("Error checking manager status:", error)
      }
    }
    checkManager()
  }, [])

  // Get full month range
  const { monthStart, monthEnd, allDates } = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return {
      monthStart: start,
      monthEnd: end,
      allDates: Array.from(
        { length: end.getDate() },
        (_, i) => addDays(start, i)
      )
    }
  }, [currentDate])

  // Get visible dates based on view mode
  const visibleDates = useMemo(() => {
    switch (viewMode) {
      case "3day":
        return Array.from(
          { length: 3 },
          (_, i) => addDays(subDays(currentDate, 1), i)
        )
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        return Array.from(
          { length: 7 },
          (_, i) => addDays(weekStart, i)
        )
      case "month":
        return allDates
    }
  }, [viewMode, currentDate, allDates])

  // Function to get cell style based on status and leave type
  const getCellStyle = useCallback((leave: DayLeave) => {
    if (leave.status === "none") return {}
    
    if (leave.status === "pending") {
      return { className: "bg-yellow-100 dark:bg-yellow-900/30" }
    }
    
    if (leave.leaveType) {
      return {
        style: {
          backgroundColor: leave.leaveType.color,
          opacity: 0.2
        }
      }
    }

    return { className: "bg-green-100 dark:bg-green-900/30" }
  }, [])

  // Get unique leave types for legend
  const leaveTypes = useMemo(() => {
    const typesMap = new Map<string, LeaveType>()
    monthData.forEach(member => {
      member.leaves.forEach(leave => {
        if (leave.leaveType) {
          typesMap.set(leave.leaveType.name, leave.leaveType)
        }
      })
    })
    return Array.from(typesMap.values())
  }, [monthData])

  // Cache key for month data
  const monthCacheKey = useMemo(() => 
    format(monthStart, "yyyy-MM"), [monthStart]
  )

  // Fetch month data
  const fetchMonthData = useCallback(async () => {
    const startDateStr = format(monthStart, "yyyy-MM-dd")
    const endDateStr = format(monthEnd, "yyyy-MM-dd")
    const cacheKey = `team-leaves-${monthCacheKey}`
    const cachedData = sessionStorage.getItem(cacheKey)

    try {
      setLoading(true)

      if (cachedData) {
        setMonthData(JSON.parse(cachedData))
        return
      }

      const response = await fetch(
        `/api/team/leaves?startDate=${startDateStr}&endDate=${endDateStr}`,
        { cache: 'no-store' }
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch team data")
      }

      const data = await response.json()
      sessionStorage.setItem(cacheKey, JSON.stringify(data))
      setMonthData(data)
    } catch (error) {
      console.error("Error fetching team data:", error)
    } finally {
      setLoading(false)
    }
  }, [monthStart, monthEnd, monthCacheKey])

  // Fetch data when month changes
  useEffect(() => {
    fetchMonthData()
  }, [fetchMonthData])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <TeamCalendarControls
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
      />
      <div className="rounded-lg border p-2 sm:p-4">
        <div className="overflow-x-auto">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-background">
              <tr>
                <th className="sticky left-0 z-30 bg-muted/80 backdrop-blur-sm border-r px-4 py-2 text-left font-medium shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                  Team Member
                </th>
                {visibleDates.map((date) => (
                  <th
                    key={date.toISOString()}
                    className="border-b border-r px-2 py-1 text-center font-medium min-w-[80px]"
                  >
                    {viewMode === "month" ? (
                      format(date, "d")
                    ) : (
                      <>
                        {format(date, "EEE")}
                        <div className="text-xs text-muted-foreground">
                          {format(date, "MMM d")}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthData.map((member) => (
                <tr 
                  key={member.id}
                  className={cn(
                    "even:bg-muted/50",
                    "hover:bg-muted/70 transition-colors"
                  )}
                >
                  <td className="sticky left-0 z-10 border-r px-4 py-2 whitespace-nowrap bg-background/80 backdrop-blur-sm shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                    {member.name}
                  </td>
                  {visibleDates.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd")
                    const leave = member.leaves.find(l => 
                      dateStr >= l.dateStart && dateStr <= l.dateEnd
                    )
                    
                    const dayLeave: DayLeave = leave ? {
                      date: dateStr,
                      status: leave.status,
                      leaveType: leave.leaveType,
                      originalLeave: leave
                    } : {
                      date: dateStr,
                      status: "none"
                    }

                    return (
                      <td
                        key={`${member.id}-${dayLeave.date}`}
                        className={cn(
                          "border-r border-b h-10 relative",
                          getCellStyle(dayLeave).className
                        )}
                        style={getCellStyle(dayLeave).style}
                      >
                        {dayLeave.status !== "none" && (
                          <CellPopover 
                            dayLeave={dayLeave} 
                            member={member} 
                            onRefresh={fetchMonthData}
                            isManager={isManager}
                          />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <TeamCalendarLegend leaveTypes={leaveTypes} />
      </div>
    </div>
  )
}
