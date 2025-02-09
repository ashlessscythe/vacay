import BankHolidayManager from "@/components/dashboard/bank-holiday-manager"
import { CompanySettings } from "@/components/dashboard/company-settings"
import { TeamMemberManagementContainer } from "@/components/dashboard/team-member-management-container"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/dashboard")
  }

  const user = await prisma.users.findFirst({
    where: { email: session.user.email! },
  })

  if (!user?.admin) {
    redirect("/dashboard")
  }

  const departments = await prisma.departments.findMany({
    where: { company_id: user.company_id },
    select: {
      id: true,
      name: true,
    },
  })

  const company = await prisma.companies.findUnique({
    where: { id: user.company_id },
    select: { is_team_view_hidden: true }
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4">
        <CompanySettings 
          initialSettings={{
            is_team_view_hidden: company?.is_team_view_hidden ?? false
          }}
        />
        <TeamMemberManagementContainer 
          departments={departments.map(d => ({ id: d.id.toString(), name: d.name }))}
        />
        <BankHolidayManager />
      </div>
    </div>
  )
}
