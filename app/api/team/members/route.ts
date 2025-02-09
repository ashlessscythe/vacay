import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email! },
    })

    if (!user?.admin) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const members = await prisma.users.findMany({
      where: { company_id: user.company_id },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        admin: true,
        manager: true,
        department_id: true,
        departments: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("[TEAM_MEMBERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email! },
    })

    if (!user?.admin) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { email, department_id, role } = body

    if (!email || !department_id) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const existingUser = await prisma.users.findFirst({
      where: { email },
    })

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 })
    }

    const newUser = await prisma.users.create({
      data: {
        email,
        department_id,
        company_id: user.company_id!,
        admin: role === "admin",
        manager: role === "manager",
        name: "",  // These will be set when user registers
        lastname: "",
        password: "",
        activated: false,
        start_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return NextResponse.json(newUser)
  } catch (error) {
    console.error("[TEAM_MEMBERS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email! },
    })

    if (!user?.admin) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { userId, department_id, role } = body

    if (!userId) {
      return new NextResponse("Missing user ID", { status: 400 })
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(department_id && { department_id }),
        ...(role && { 
          admin: role === "admin",
          manager: role === "manager"
        }),
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[TEAM_MEMBERS_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email! },
    })

    if (!user?.admin) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return new NextResponse("Missing user ID", { status: 400 })
    }

    await prisma.users.delete({
      where: { id: parseInt(userId) },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TEAM_MEMBERS_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
