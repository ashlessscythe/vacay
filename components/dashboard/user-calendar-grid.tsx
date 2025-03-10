"use client";

import * as React from "react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  addDays,
  format,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewMode } from "./team-calendar-controls";
import { TeamCalendarLegend } from "./team-calendar-legend";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaveType {
  name: string;
  color: string;
}

interface Leave {
  id: number;
  date_start: string;
  date_end: string;
  day_part_start: number;
  day_part_end: number;
  status: number;
  employee_comment: string | null;
  leave_types: {
    name: string;
    color: string;
  };
}

interface DayLeave {
  date: string;
  status: "approved" | "pending" | "rejected" | "none";
  leaveType?: LeaveType;
  originalLeave?: Leave;
}

interface CellPopoverProps {
  dayLeave: DayLeave;
  onRefresh: () => Promise<void>;
}

const CellPopover = React.memo(
  ({ dayLeave }: CellPopoverProps): React.ReactElement => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined
    );
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined
    );

    const handleMouseEnter = useCallback(() => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      openTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 200);
    }, []);

    const handleMouseLeave = useCallback(() => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }, []);

    const handleContentMouseEnter = useCallback(() => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    }, []);

    const handleContentMouseLeave = useCallback(() => {
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }, []);

    useEffect(() => {
      return () => {
        if (openTimeoutRef.current) {
          clearTimeout(openTimeoutRef.current);
        }
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
      };
    }, []);

    // Convert status number to text
    const getStatusText = (
      status: "approved" | "pending" | "rejected" | "none"
    ) => {
      switch (status) {
        case "approved":
          return { text: "Approved", className: "text-green-600" };
        case "rejected":
          return { text: "Rejected", className: "text-red-600" };
        default:
          return { text: "Pending", className: "text-yellow-600" };
      }
    };

    const statusDetails = getStatusText(dayLeave.status);

    return (
      <Popover open={isOpen}>
        <PopoverTrigger asChild>
          <div
            ref={triggerRef}
            className="h-full w-full cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-64"
          onMouseEnter={handleContentMouseEnter}
          onMouseLeave={handleContentMouseLeave}
        >
          <div className="grid gap-2">
            <div className="space-y-1">
              <div className="font-medium leading-none">Your Leave</div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(dayLeave.date), "MMMM d, yyyy")}
              </p>
            </div>
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span className={cn("capitalize", statusDetails.className)}>
                  {statusDetails.text}
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
              {dayLeave.originalLeave &&
                dayLeave.originalLeave.employee_comment && (
                  <div className="mt-2">
                    <span className="font-semibold">Comment:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dayLeave.originalLeave.employee_comment}
                    </p>
                  </div>
                )}
              {dayLeave.originalLeave && (
                <div className="text-xs text-muted-foreground mt-2">
                  {format(new Date(dayLeave.originalLeave.date_start), "MMM d")}{" "}
                  -{" "}
                  {format(
                    new Date(dayLeave.originalLeave.date_end),
                    "MMM d, yyyy"
                  )}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

CellPopover.displayName = "CellPopover";

export function UserCalendarGrid() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Get full month range
  const { monthStart, allDates } = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return {
      monthStart: start,
      monthEnd: end,
      allDates: Array.from({ length: end.getDate() }, (_, i) =>
        addDays(start, i)
      ),
    };
  }, [currentDate]);

  // Get visible dates based on view mode
  const visibleDates = useMemo(() => {
    switch (viewMode) {
      case "3day":
        return Array.from({ length: 3 }, (_, i) =>
          addDays(subDays(currentDate, 1), i)
        );
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      case "month":
        return allDates;
    }
  }, [viewMode, currentDate, allDates]);

  // Function to get cell style based on status and leave type
  const getCellStyle = useCallback((leave: DayLeave) => {
    if (leave.status === "none") return {};

    if (leave.status === "pending") {
      return { className: "bg-yellow-100 dark:bg-yellow-900/30" };
    }

    if (leave.status === "rejected") {
      return { className: "bg-red-100 dark:bg-red-900/30" };
    }

    if (leave.leaveType) {
      return {
        style: {
          backgroundColor: leave.leaveType.color,
          opacity: 0.2,
        },
      };
    }

    return { className: "bg-green-100 dark:bg-green-900/30" };
  }, []);

  // Get unique leave types for legend
  const leaveTypes = useMemo(() => {
    const typesMap = new Map<string, LeaveType>();
    leaves.forEach((leave) => {
      typesMap.set(leave.leave_types.name, {
        name: leave.leave_types.name,
        color: leave.leave_types.color,
      });
    });
    return Array.from(typesMap.values());
  }, [leaves]);

  // Cache key for month data
  const monthCacheKey = useMemo(
    () => `${format(monthStart, "yyyy-MM")}-user-leaves`,
    [monthStart]
  );

  // Convert status number to string
  const getStatusString = (
    status: number
  ): "approved" | "pending" | "rejected" => {
    switch (status) {
      case 2:
        return "approved";
      case 3:
        return "rejected";
      default:
        return "pending";
    }
  };

  // Fetch user leaves
  const fetchUserLeaves = useCallback(async () => {
    // const startDateStr = format(monthStart, "yyyy-MM-dd");
    // const endDateStr = format(monthEnd, "yyyy-MM-dd");
    const cacheKey = `user-leaves-${monthCacheKey}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    try {
      setLoading(true);

      if (cachedData) {
        setLeaves(JSON.parse(cachedData));
        return;
      }

      const response = await fetch(`/api/leaves`, { cache: "no-store" });

      if (!response.ok) {
        console.error(
          `Failed to fetch leave data: ${response.status} ${response.statusText}`
        );
        throw new Error(`Failed to fetch leave data: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched leaves data:", data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      setLeaves(data);
    } catch (error) {
      console.error("Error fetching leave data:", error);
    } finally {
      setLoading(false);
    }
  }, [monthCacheKey]);

  // Function to clear cache
  const clearCache = useCallback(() => {
    const cacheKey = `user-leaves-${monthCacheKey}`;
    sessionStorage.removeItem(cacheKey);
  }, [monthCacheKey]);

  // Fetch data when month changes
  useEffect(() => {
    // Clear cache and fetch fresh data
    clearCache();
    fetchUserLeaves();
  }, [fetchUserLeaves, clearCache]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(currentDate, "MMMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="grid gap-2 p-4">
                <Select
                  value={currentDate.getMonth().toString()}
                  onValueChange={(value) => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(parseInt(value));
                    setCurrentDate(newDate);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date(currentDate.getFullYear(), i, 1);
                      return {
                        value: i.toString(),
                        label: format(date, "MMMM"),
                      };
                    }).map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newDate = new Date(currentDate);
                switch (viewMode) {
                  case "3day":
                    newDate.setDate(currentDate.getDate() - 3);
                    break;
                  case "week":
                    newDate.setDate(currentDate.getDate() - 7);
                    break;
                  case "month":
                    newDate.setMonth(currentDate.getMonth() - 1);
                    break;
                }
                setCurrentDate(newDate);
              }}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newDate = new Date(currentDate);
                switch (viewMode) {
                  case "3day":
                    newDate.setDate(currentDate.getDate() + 3);
                    break;
                  case "week":
                    newDate.setDate(currentDate.getDate() + 7);
                    break;
                  case "month":
                    newDate.setMonth(currentDate.getMonth() + 1);
                    break;
                }
                setCurrentDate(newDate);
              }}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3day">3 Days</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-lg border p-2 sm:p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
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
              <tr>
                {visibleDates.map((date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  const leave = leaves.find((l) => {
                    const leaveStartDate = format(
                      new Date(l.date_start),
                      "yyyy-MM-dd"
                    );
                    const leaveEndDate = format(
                      new Date(l.date_end),
                      "yyyy-MM-dd"
                    );
                    return dateStr >= leaveStartDate && dateStr <= leaveEndDate;
                  });

                  const dayLeave: DayLeave = leave
                    ? {
                        date: dateStr,
                        status: getStatusString(leave.status),
                        leaveType: {
                          name: leave.leave_types.name,
                          color: leave.leave_types.color,
                        },
                        originalLeave: leave,
                      }
                    : {
                        date: dateStr,
                        status: "none",
                      };

                  return (
                    <td
                      key={dayLeave.date}
                      className={cn(
                        "border-r border-b h-10 relative",
                        getCellStyle(dayLeave).className
                      )}
                      style={getCellStyle(dayLeave).style}
                    >
                      {dayLeave.status !== "none" && (
                        <CellPopover
                          dayLeave={dayLeave}
                          onRefresh={fetchUserLeaves}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <TeamCalendarLegend leaveTypes={leaveTypes} />
      </div>
    </div>
  );
}
