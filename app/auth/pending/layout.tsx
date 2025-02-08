import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account Pending",
  description: "Your account is pending activation",
}

export default function PendingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
