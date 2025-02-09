"use client"

import { SessionProvider } from "next-auth/react"

export function LandingProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
