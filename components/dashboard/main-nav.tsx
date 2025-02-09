"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { appConfig } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { LeaveRequestForm } from "@/components/dashboard/leave-request-form"

interface MainNavProps {
  onRefresh?: () => Promise<void>
  userRole?: "ADMIN" | "MANAGER" | "USER"
  isTeamViewHidden?: boolean
}

export function MainNav({ onRefresh, userRole, isTeamViewHidden }: MainNavProps) {
  const items = [
    {
      title: "Overview",
      href: "/dashboard",
    },
    ...(!isTeamViewHidden || userRole === "ADMIN" || userRole === "MANAGER" ? [
      {
        title: "Team Calendar",
        href: "/dashboard/team",
      }
    ] : []),
    ...(userRole === "ADMIN" ? [
      {
        title: "Admin",
        href: "/dashboard/admin",
      }
    ] : []),
    ...(userRole === "MANAGER" || userRole === "ADMIN" ? [
      {
        title: "Approvals",
        href: "/dashboard/approvals",
      }
    ] : [])
  ]

  const pathname = usePathname()
  const [showLeaveRequest, setShowLeaveRequest] = useState(false)

  return (
    <nav className="flex items-center space-x-6 lg:space-x-8">
      <Link href="/" className="text-sm font-medium text-muted-foreground">
        {appConfig.name}
      </Link>
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
