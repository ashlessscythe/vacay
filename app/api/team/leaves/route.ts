import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../../auth/auth.config"

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
