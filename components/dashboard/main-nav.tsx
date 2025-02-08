"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { appConfig } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { LeaveRequestForm } from "@/components/dashboard/leave-request-form"

const items = [
  {
    title: "Overview",
    href: "/dashboard",
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
  },
  {
    title: "Team",
    href: "/dashboard/team",
  },
  {
    title: "Requests",
    href: "/dashboard/requests",
  },
]

interface MainNavProps {
  onRefresh?: () => Promise<void>
  userRole?: string
}

export function MainNav({ onRefresh, userRole }: MainNavProps) {
  const pathname = usePathname()
  const [showLeaveRequest, setShowLeaveRequest] = useState(false)

  return (
    <nav className="flex items-center space-x-6 lg:space-x-8">
      <span className="text-sm font-medium text-muted-foreground">
        {appConfig.name}
      </span>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
      {userRole === "ADMIN" && (
        <Link
          href="/dashboard/admin"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard/admin"
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          Admin
        </Link>
      )}
      <Button
        onClick={() => setShowLeaveRequest(true)}
        className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white hover:opacity-90"
      >
        New Request
      </Button>
      <LeaveRequestForm 
        open={showLeaveRequest} 
        onOpenChange={setShowLeaveRequest}
        onSuccess={onRefresh}
      />
    </nav>
  )
}
