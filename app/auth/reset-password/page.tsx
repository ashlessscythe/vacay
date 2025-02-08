import { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password to regain access to your account",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
