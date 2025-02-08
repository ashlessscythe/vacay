import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const body = resetPasswordSchema.parse(json)

    const user = await prisma.users.findFirst({
      where: { email: body.email },
    })

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex")

      // Update user with reset token
      await prisma.users.update({
        where: { id: user.id },
        data: {
          resetToken: resetToken,
          resetTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      })

      // TODO: Send email with reset link
      // For now, we'll just log the token (in production, you'd use a proper email service)
      console.log(
        `Password reset link: ${process.env.NEXTAUTH_URL}/auth/reset-password/${resetToken}`
      )
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      { message: "If an account exists, a reset link has been sent" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 422 }
      )
    }

    console.error("Password reset error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
