"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TeamCalendarProps {
  className?: string
}

export function TeamCalendar({ className }: TeamCalendarProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {date.from.toLocaleDateString()} - {date.to.toLocaleDateString()}
                </>
              ) : (
                date.from.toLocaleDateString()
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      
      <div className="rounded-md border p-4">
        <div className="space-y-4">
          <h3 className="font-medium leading-none">Team Absences</h3>
          <div className="text-sm text-muted-foreground">
            {/* We'll populate this with team absence data */}
            No absences scheduled for the selected date range.
          </div>
        </div>
      </div>
    </div>
  )
}
