import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const departmentSettingsSchema = z.object({
  departmentId: z.number(),
  allowance: z.number().min(0),
  personal: z.number().min(0),
  include_public_holidays: z.boolean(),
  is_accrued_allowance: z.boolean(),
})

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    
    try {
      const validatedData = departmentSettingsSchema.parse(body)
      const { departmentId, ...settings } = validatedData
      
      const department = await prisma.departments.findFirst({
        where: {
          id: departmentId,
          company_id: parseInt(session.user.companyId)
        }
      })

      if (!department) {
        return new NextResponse("Department not found", { status: 404 })
      }

      const updatedDepartment = await prisma.departments.update({
        where: {
          id: departmentId
        },
        data: settings
      })

      return NextResponse.json(updatedDepartment)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({
          error: "Validation failed",
          details: validationError.errors
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      throw validationError
    }
  } catch (error) {
    console.error("[DEPARTMENT_SETTINGS_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get('departmentId')

    if (!departmentId) {
      // If no department ID is provided, return all departments for the company
      const departments = await prisma.departments.findMany({
        where: {
          company_id: parseInt(session.user.companyId)
        },
        select: {
          id: true,
          name: true,
          allowance: true,
          personal: true,
          include_public_holidays: true,
          is_accrued_allowance: true,
        }
      })

      return NextResponse.json(departments)
    }

    const department = await prisma.departments.findFirst({
      where: {
        id: parseInt(departmentId),
        company_id: parseInt(session.user.companyId)
      },
      select: {
        id: true,
        name: true,
        allowance: true,
        personal: true,
        include_public_holidays: true,
        is_accrued_allowance: true,
      }
    })

    if (!department) {
      return new NextResponse("Department not found", { status: 404 })
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error("[DEPARTMENT_SETTINGS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
