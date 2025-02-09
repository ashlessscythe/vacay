import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!session.user.email) {
      return new NextResponse("Invalid user session", { status: 401 })
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    })

    if (!user?.manager) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const { approved, comment } = await req.json()
    const leaveId = parseInt(params.id)

    const leave = await prisma.leaves.findUnique({
      where: { id: leaveId },
      include: {
        leave_types: true,
      },
    })

    if (!leave) {
      return new NextResponse("Leave not found", { status: 404 })
    }

    // Check if leave type has auto_approve enabled
    if (leave.leave_types.auto_approve) {
      return new NextResponse("Cannot modify auto-approved leave", { status: 400 })
    }

    // Update leave status
    const updatedLeave = await prisma.leaves.update({
      where: { id: leaveId },
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
