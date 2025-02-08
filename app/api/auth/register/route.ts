import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { name, lastname, email, password, company_id, department_id } = await req.json()

    // Validate input
    if (!name || !lastname || !email || !password || !company_id || !department_id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.users.create({
      data: {
        name,
        lastname,
        email,
        password: hashedPassword,
        company_id,
        department_id,
        activated: false,
        start_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
