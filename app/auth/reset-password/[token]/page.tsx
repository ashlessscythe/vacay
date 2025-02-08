import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: `Reset Password - Token: ${resolvedParams.token}`,
    description: "Reset your password using the provided token"
  }
}

export default async function ResetPasswordPage({
  params,
}: PageProps) {
  const resolvedParams = await params
  // Verify token server-side
  const user = await prisma.users.findFirst({
    where: {
      resetToken: resolvedParams.token,
      resetTokenExpires: {
        gt: new Date()
      }
    }
  })

  // Redirect to login if token is invalid or expired
  if (!user) {
    redirect('/auth/login?error=Invalid+or+expired+reset+token')
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Update Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Please enter your new password
          </p>
        </div>
        <UpdatePasswordForm token={resolvedParams.token} />
      </div>
    </div>
  )
}
