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

    // Get user's department ID
    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
      select: { department_id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all team members in the same department
    const teamMembers = await prisma.users.findMany({
      where: {
        department_id: user.department_id
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        department_id: true
      }
    })

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error("[TEAM_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
