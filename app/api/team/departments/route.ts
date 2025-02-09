import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../../auth/auth.config"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get current user with their roles
    const currentUser = await prisma.users.findFirst({
      where: { 
        email: session.user.email as string,
        activated: true
      },
      select: { 
        id: true,
        company_id: true,
        admin: true,
        manager: true
      }
    })

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get departments based on user role
    const departments = await prisma.departments.findMany({
      where: {
        company_id: currentUser.company_id,
        // If user is admin/manager, show all departments
        // Otherwise, show only departments they supervise
        ...(!(currentUser.admin || currentUser.manager) && {
          department_supervisors: {
            some: {
              user_id: currentUser.id
            }
          }
        })
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("[TEAM_DEPARTMENTS]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
