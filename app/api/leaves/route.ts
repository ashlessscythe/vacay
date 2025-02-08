import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1),
  dateStart: z.string().min(1),
  dateEnd: z.string().min(1),
  dayPartStart: z.string().min(1),
  dayPartEnd: z.string().min(1),
  employeeComment: z.string().optional(),
  userId: z.number(),
  status: z.number(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.email) {
      return NextResponse.json({ error: "Invalid user email" }, { status: 400 })
    }

    const body = await req.json()
    const validatedData = leaveRequestSchema.parse(body)

    // Get user details
    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Ensure user can only create leaves for themselves
    if (validatedData.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get leave type to check if it's auto-approved
    const leaveType = await prisma.leave_types.findUnique({
      where: { id: parseInt(validatedData.leaveTypeId) },
      select: { auto_approve: true }
    })

    if (!leaveType) {
      return NextResponse.json({ error: "Leave type not found" }, { status: 404 })
    }

    // Create the leave request
    const leave = await prisma.leaves.create({
      data: {
        status: leaveType.auto_approve ? 2 : 1, // 2 for approved, 1 for pending
        employee_comment: validatedData.employeeComment || null,
        date_start: new Date(validatedData.dateStart),
        date_end: new Date(validatedData.dateEnd),
        day_part_start: parseInt(validatedData.dayPartStart),
        day_part_end: parseInt(validatedData.dayPartEnd),
        user_id: validatedData.userId,
        leave_type_id: parseInt(validatedData.leaveTypeId),
        created_at: new Date(),
        updated_at: new Date(),
      }
    })

    return NextResponse.json(leave)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[LEAVES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
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
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    // If userId is provided, ensure it matches the user
    if (userId && parseInt(userId) !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const leaves = await prisma.leaves.findMany({
      where: {
        user_id: user.id
      },
      include: {
        leave_types: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    })

    return NextResponse.json(leaves)
  } catch (error) {
    console.error("[LEAVES_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
