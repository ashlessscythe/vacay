import BankHolidayManager from "@/components/dashboard/bank-holiday-manager"
import { CompanySettings } from "@/components/dashboard/company-settings"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"

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
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Team Members</h3>
            <p className="text-sm text-muted-foreground">Manage your team members and their roles</p>
          </div>
          <Link href="/dashboard/team/members" passHref>
            <Button asChild>
              <span>
                Manage Team Members
              </span>
            </Button>
          </Link>
        </div>
      </Card>
        <BankHolidayManager />
      </div>
    </div>
  )
}
