import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { prisma } from "@/lib/prisma"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions)
  
  const company = session?.user ? await prisma.companies.findUnique({
    where: { id: parseInt(session.user.companyId) },
    select: { is_team_view_hidden: true }
  }) : null
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/75 backdrop-blur-sm supports-[backdrop-filter]:bg-background/40 transition-colors duration-200">
        <div className="container mx-auto max-w-[1200px] flex h-14 items-center px-4">
          <MainNav 
            userRole={session?.user?.role} 
            isTeamViewHidden={company?.is_team_view_hidden}
          />
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

