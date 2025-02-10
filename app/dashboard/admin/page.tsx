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
    select: {
      name: true,
      country: true,
      timezone: true,
      date_format: true,
      last_name_first: true,
      start_of_new_year: true,
      carry_over: true,
      payroll_close_time: true,
      share_all_absences: true,
      is_team_view_hidden: true,
      company_wide_message: true,
      company_wide_message_text_color: true,
      company_wide_message_bg_color: true,
    }
  })

  if (!company) {
    throw new Error("Company not found")
  }

  // Prepare settings with default values for nullable fields
  const settings = {
    ...company,
    timezone: company.timezone ?? "America/Denver",
    company_wide_message: company.company_wide_message ?? "",
    company_wide_message_text_color: company.company_wide_message_text_color ?? "#000000",
    company_wide_message_bg_color: company.company_wide_message_bg_color ?? "#ffffff",
    carry_over: company.carry_over ?? 0,
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4">
        <CompanySettings initialSettings={settings} />
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
