import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"
import { TeamCalendarGrid } from "@/components/dashboard/team-calendar-grid"

export default async function TeamPage() {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role as "ADMIN" | "MANAGER" | "USER" | undefined

  const company = session?.user ? await prisma.companies.findUnique({
    where: { id: parseInt(session.user.companyId) },
    select: { is_team_view_hidden: true }
  }) : null

  if (!session?.user || 
      ((userRole !== "ADMIN" && userRole !== "MANAGER") && company?.is_team_view_hidden)) {
    redirect("/dashboard")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Team Calendar</h2>
      </div>
      <TeamCalendarGrid />
    </div>
  )
}
