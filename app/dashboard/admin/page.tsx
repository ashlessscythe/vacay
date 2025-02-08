import BankHolidayManager from "@/components/dashboard/bank-holiday-manager"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4">
        <BankHolidayManager />
      </div>
    </div>
  )
}
