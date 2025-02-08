import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100),
})

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const { password } = resetPasswordSchema.parse(json)
    const token = request.nextUrl.pathname.split('/').pop()

    if (!token) {
      return Response.json(
        { error: "Reset token is required" },
        { status: 400 }
      )
    }

    // Find user with valid reset token that hasn't expired
    const user = await prisma.users.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return Response.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user's password and clear reset token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    })

    return Response.json(
      { message: "Password updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Password must be between 8 and 100 characters" },
        { status: 422 }
      )
    }

    console.error("Password reset error:", error)
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
