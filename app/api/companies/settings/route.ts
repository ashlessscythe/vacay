import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const companySettingsSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Company name is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  date_format: z.string().min(1, "Date format is required"),
  last_name_first: z.boolean(),
  
  // Leave Management
  start_of_new_year: z.number().min(1).max(12),
  carry_over: z.number().min(0),
  payroll_close_time: z.number().min(0).max(23),
  
  // Display Settings
  share_all_absences: z.boolean(),
  is_team_view_hidden: z.boolean(),
  company_wide_message: z.string().optional(),
  company_wide_message_text_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  company_wide_message_bg_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
})

type CompanySettingsValues = z.infer<typeof companySettingsSchema>

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    
    try {
      const validatedData = companySettingsSchema.parse(body)
      
      const updatedCompany = await prisma.companies.update({
        where: {
          id: parseInt(session.user.companyId)
        },
        data: validatedData
      })

      return NextResponse.json(updatedCompany)
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
        name: true,
        country: true,
        timezone: true,
        date_format: true,
        last_name_first: true,
        start_of_new_year: true,
        carry_over: true,
        payroll_close_time: true,
        share_all_absences: true,
        is_team_view_hidden: true,
        company_wide_message: true,
        company_wide_message_text_color: true,
        company_wide_message_bg_color: true,
      }
    })

    if (!company) {
      return new NextResponse("Company not found", { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("[COMPANY_SETTINGS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
