import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"
import { LeaveApprovalList } from "@/components/dashboard/leave-approval-list"

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/auth/login")
  }

  const user = await prisma.users.findFirst({
    where: { 
      email: session.user.email,
      activated: true
    },
  })

  if (!user?.manager) {
    redirect("/dashboard")
  }

  const leaves = await prisma.leaves.findMany({
    where: {
      status: 1, // Pending
      users_leaves_user_idTousers: {
        company_id: user.company_id
      }
    },
    include: {
      users_leaves_user_idTousers: {
        select: {
          name: true,
          lastname: true,
          email: true,
        },
      },
      leave_types: true,
    },
    orderBy: {
      created_at: "desc",
    },
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leave Approvals</h2>
      </div>
      <LeaveApprovalList 
        leaves={leaves.map(leave => ({
          ...leave,
          date_start: leave.date_start.toISOString(),
          date_end: leave.date_end.toISOString(),
        }))} 
      />
    </div>
  )
}
