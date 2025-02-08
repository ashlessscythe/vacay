import { ReactNode } from "react"
import Link from "next/link"
import { appConfig } from "@/lib/config"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950 animate-gradient-slow">
      <header className="container mx-auto px-4 lg:px-6 h-14 flex items-center flex-none">
        <Link className="flex items-center" href="/">
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {appConfig.name}
          </span>
        </Link>
      </header>
      <main className="flex-1 flex">
        {children}
      </main>
    </div>
  )
}
