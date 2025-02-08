import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Update Password",
  description: "Enter your new password",
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
