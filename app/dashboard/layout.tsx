"use client"

import { ReactNode } from "react"
import { useCallback } from "react"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Create refresh callback that child pages can override
  const refresh = useCallback(async () => {
    // Default implementation does nothing
    // Child pages can override by setting window.dashboardRefresh
    if (typeof window !== 'undefined' && window.dashboardRefresh) {
      await window.dashboardRefresh();
    }
  }, []);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/75 backdrop-blur-sm supports-[backdrop-filter]:bg-background/40 transition-colors duration-200">
        <div className="container mx-auto max-w-[1200px] flex h-14 items-center px-4">
          <MainNav onRefresh={refresh} />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto max-w-[1200px] px-4 py-6">
        {children}
      </main>
    </div>
  )
}
