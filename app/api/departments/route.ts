import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json(
        { message: "Company ID is required" },
        { status: 400 }
      )
    }

    const departments = await prisma.departments.findMany({
      where: {
        company_id: parseInt(companyId),
      },
      select: {
        id: true,
        name: true,
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("[DEPARTMENTS_ERROR]", error)
    return NextResponse.json(
      { message: "Failed to fetch departments" },
      { status: 500 }
    )
  }
}
