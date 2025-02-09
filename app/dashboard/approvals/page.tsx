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
    include: {
      department_supervisors: true
    }
  })

  if (!user) {
    redirect("/auth/login")
  }

  if (!user.manager && !user.admin && user.department_supervisors.length === 0) {
    redirect("/dashboard")
  }

  // Get departments user can approve for
  const supervisedDepartmentIds = user.department_supervisors.map(ds => ds.department_id)
  const approverDepartmentIds = user.admin 
    ? undefined // Admin can see all departments
    : user.manager 
      ? [user.department_id] // Manager sees own department
      : supervisedDepartmentIds // Supervisor sees supervised departments

  // Default to empty array if query fails
  const leaves = await prisma.leaves.findMany({
    where: {
      status: 1, // Pending
      users_leaves_user_idTousers: {
        company_id: user.company_id,
        ...(approverDepartmentIds && {
          department_id: { in: approverDepartmentIds }
        })
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
