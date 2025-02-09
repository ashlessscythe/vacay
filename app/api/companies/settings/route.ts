import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { is_team_view_hidden } = body

    if (typeof is_team_view_hidden !== "boolean") {
      return new NextResponse("Invalid request body", { status: 400 })
    }

    const updatedCompany = await prisma.companies.update({
      where: {
        id: parseInt(session.user.companyId)
      },
      data: {
        is_team_view_hidden
      }
    })

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error("[COMPANY_SETTINGS_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const company = await prisma.companies.findUnique({
      where: {
        id: parseInt(session.user.companyId)
      },
      select: {
        is_team_view_hidden: true
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error("[COMPANY_SETTINGS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
