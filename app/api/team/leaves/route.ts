import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../../auth/auth.config"
import { z } from "zod"

// Validation schema for leave approval
const approvalSchema = z.object({
  leaveId: z.number(),
  approved: z.boolean()
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const departmentId = searchParams.get("departmentId")

    if (!startDate || !endDate) {
      return new NextResponse("Missing date range", { status: 400 })
    }

    // Validate departmentId if provided
    if (departmentId && isNaN(parseInt(departmentId))) {
      return new NextResponse("Invalid department ID", { status: 400 })
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return new NextResponse("Invalid date format. Use YYYY-MM-DD", { status: 400 })
    }

    // Get current user with their roles, department and company settings
    const currentUser = await prisma.users.findFirst({
      where: { 
        email: session.user.email as string,
        activated: true
      },
      select: { 
        id: true,
        company_id: true,
        department_id: true,
        admin: true,
        manager: true,
        companies: {
          select: {
            timezone: true,
            date_format: true
          }
        }
      }
    })

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get departments user has access to
    const supervisedDepartments = await prisma.department_supervisors.findMany({
      where: {
        user_id: currentUser.id
      },
      select: {
        department_id: true
      }
    })

    const departmentIds = [
      currentUser.department_id,
      ...supervisedDepartments.map(d => d.department_id)
    ]

    // Get users and their leaves
    const users = await prisma.users.findMany({
      where: {
        company_id: currentUser.company_id,
        activated: true,
        end_date: null,
        // Show all users if admin/manager, otherwise only show users from same/supervised departments
        ...((!(currentUser.admin || currentUser.manager) || departmentId) && {
          department_id: departmentId 
            ? parseInt(departmentId)
            : { in: departmentIds }
        })
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        leaves_leaves_user_idTousers: {
          select: {
            id: true,
            status: true,
            date_start: true,
            date_end: true,
            day_part_start: true,
            day_part_end: true,
            leave_type_id: true,
            leave_types: {
              select: {
                name: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: [
        { lastname: "asc" },
        { name: "asc" }
      ]
    })

    // Format data for the calendar grid
    const formattedData = users.map(user => ({
      id: user.id,
      name: `${user.name} ${user.lastname}`,
      leaves: user.leaves_leaves_user_idTousers.map(leave => ({
        id: leave.id,
        // Convert UTC dates from DB to company timezone (default to America/Denver if not set)
        dateStart: new Date(leave.date_start.toLocaleString('en-US', { timeZone: currentUser.companies?.timezone || 'America/Denver' })).toISOString().split('T')[0],
        dateEnd: new Date(leave.date_end.toLocaleString('en-US', { timeZone: currentUser.companies?.timezone || 'America/Denver' })).toISOString().split('T')[0],
        status: leave.status === 1 ? "approved" as const : "pending" as const,
        leaveType: leave.leave_types
      }))
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("[TEAM_LEAVES]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const result = approvalSchema.safeParse(body)
    if (!result.success) {
      return new NextResponse("Invalid request body", { status: 400 })
    }

    const { leaveId, approved } = result.data

    // Get current user with their roles and department
    const currentUser = await prisma.users.findFirst({
      where: { 
        email: session.user.email as string,
        activated: true
      },
      select: { 
        id: true,
        department_id: true,
        admin: true,
        manager: true
      }
    })

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check if user is manager or admin
    if (!currentUser.manager && !currentUser.admin) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Get supervised departments
    const supervisedDepartments = await prisma.department_supervisors.findMany({
      where: {
        user_id: currentUser.id
      },
      select: {
        department_id: true
      }
    })

    // Get leave request with user's department
    const leave = await prisma.leaves.findFirst({
      where: {
        id: leaveId
      },
      include: {
        users_leaves_user_idTousers: {
          select: {
            department_id: true
          }
        }
      }
    })

    if (!leave) {
      return new NextResponse("Leave request not found", { status: 404 })
    }

    // Check if user has permission to approve this leave
    const hasPermission = currentUser.admin || 
      (currentUser.manager && (
        leave.users_leaves_user_idTousers.department_id === currentUser.department_id ||
        supervisedDepartments.some(d => d.department_id === leave.users_leaves_user_idTousers.department_id)
      ))

    if (!hasPermission) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Update leave status
    const updatedLeave = await prisma.leaves.update({
      where: {
        id: leaveId
      },
      data: {
        status: approved ? 1 : 2, // 1 = approved, 2 = rejected
        decided_at: new Date(),
        approver_id: currentUser.id
      }
    })

    return NextResponse.json(updatedLeave)
  } catch (error) {
    console.error("[TEAM_LEAVES_APPROVAL]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
