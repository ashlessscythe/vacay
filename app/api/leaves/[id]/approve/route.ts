import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
   try {
    const fullPath = req.nextUrl.pathname.split('/');
    const id = fullPath[fullPath.length - 2] // get id
    console.log(`id: ${id}`)

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid leave ID" }, { status: 400 })
    }

    const leaveId = id;
    const { approved, comment } = await req.json();

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!session.user.email) {
      return new NextResponse("Invalid user session", { status: 401 })
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
      include: {
        department_supervisors: true,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (!user.manager && !user.admin && user.department_supervisors.length === 0) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const leave = await prisma.leaves.findUnique({
      where: { id: Number.parseInt(leaveId) },
      include: {
        leave_types: true,
        users_leaves_user_idTousers: {
          select: {
            department_id: true,
          },
        },
      },
    })

    if (!leave) {
      return new NextResponse("Leave not found", { status: 404 })
    }

    // Check if user has permission to approve this leave request
    const canApprove =
      user.admin || // Admin can approve all
      (user.manager && user.department_id === leave.users_leaves_user_idTousers.department_id) || // Manager can approve own department
      user.department_supervisors.some((ds) => ds.department_id === leave.users_leaves_user_idTousers.department_id) // Supervisor can approve supervised departments

    if (!canApprove) {
      return new NextResponse("Cannot approve leave requests from other departments", { status: 403 })
    }

    // Check if leave type has auto_approve enabled
    if (leave.leave_types.auto_approve) {
      return new NextResponse("Cannot modify auto-approved leave", { status: 400 })
    }

    // Update leave status
    const updatedLeave = await prisma.leaves.update({
      where: { id: Number.parseInt(leaveId) },
      data: {
        status: approved ? 2 : 3, // 2 = Approved, 3 = Rejected
        approver_id: user.id,
        approver_comment: comment || null,
        decided_at: new Date(),
      },
    })

    return NextResponse.json(updatedLeave)
  } catch (error) {
    console.error("Error approving leave:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

