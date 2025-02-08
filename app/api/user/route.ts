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

    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        manager: true,
        admin: true,
        department_id: true,
        company_id: true,
        companies: {
          select: {
            date_format: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USER_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
