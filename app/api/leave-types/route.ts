import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.email) {
      return NextResponse.json({ error: "Invalid user email" }, { status: 400 })
    }

    // Get user details
    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
      select: { 
        company_id: true,
        manager: true,
        admin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get leave types for user's company
    const leaveTypes = await prisma.leave_types.findMany({
      where: {
        company_id: user.company_id,
        // Only include manager_only types if user is manager or admin
        ...(!(user.manager || user.admin) && {
          manager_only: false
        })
      },
      orderBy: { sort_order: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        use_allowance: true,
        use_personal: true,
        limit: true,
        auto_approve: true
      }
    })

    return NextResponse.json(leaveTypes)
  } catch (error) {
    console.error("[LEAVE_TYPES_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
