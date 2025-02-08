import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const companies = await prisma.companies.findMany({
      select: {
        id: true,
        name: true,
      },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error("[COMPANIES_ERROR]", error)
    return NextResponse.json(
      { message: "Failed to fetch companies" },
      { status: 500 }
    )
  }
}
