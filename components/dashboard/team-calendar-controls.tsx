"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ViewMode = "3day" | "week" | "month"

interface Department {
  id: number
  name: string
}

interface TeamCalendarControlsProps {
  currentDate: Date
  viewMode: ViewMode
  selectedDepartment?: number
  onDateChange: (date: Date) => void
  onViewModeChange: (mode: ViewMode) => void
  onDepartmentChange: (departmentId: number | undefined) => void
}

export function TeamCalendarControls({
  currentDate,
  viewMode,
  selectedDepartment,
  onDateChange,
  onViewModeChange,
  onDepartmentChange,
}: TeamCalendarControlsProps) {
  const [departments, setDepartments] = React.useState<Department[]>([])

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/team/departments")
        if (!response.ok) throw new Error("Failed to fetch departments")
        const data = await response.json()
        setDepartments(data)
      } catch (error) {
        console.error("Error fetching departments:", error)
      }
    }
    fetchDepartments()
  }, [])
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), i, 1)
    return {
      value: i.toString(),
      label: format(date, "MMMM"),
    }
  })

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case "3day":
        newDate.setDate(currentDate.getDate() - 3)
        break
      case "week":
        newDate.setDate(currentDate.getDate() - 7)
        break
      case "month":
        newDate.setMonth(currentDate.getMonth() - 1)
        break
    }
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case "3day":
        newDate.setDate(currentDate.getDate() + 3)
        break
      case "week":
        newDate.setDate(currentDate.getDate() + 7)
        break
      case "month":
        newDate.setMonth(currentDate.getMonth() + 1)
        break
    }
    onDateChange(newDate)
  }

  return (
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
                  const newDate = new Date(currentDate)
                  newDate.setMonth(parseInt(value))
                  onDateChange(newDate)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
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
            onClick={handlePrevious}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={viewMode}
          onValueChange={(value) => onViewModeChange(value as ViewMode)}
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

      <div className="flex items-center space-x-2">
        <Select
          value={selectedDepartment?.toString() || "all"}
          onValueChange={(value) => 
            onDepartmentChange(value !== "all" ? parseInt(value) : undefined)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
