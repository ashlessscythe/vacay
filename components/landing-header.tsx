"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { appConfig } from "@/lib/config"

export function LandingHeader() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/75 backdrop-blur-sm supports-[backdrop-filter]:bg-background/40 transition-colors duration-200">
      <div className="container mx-auto px-4 lg:px-6 h-14 flex items-center max-w-[1200px]">
        <Link className="flex items-center" href="/">
          <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
            {appConfig.name}
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {session ? (
            <>
              <Link 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400" 
                href="/dashboard"
              >
                Dashboard
              </Link>
              {session.user?.role?.includes('ADMIN') && (
                <Link 
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400" 
                  href="/dashboard/admin"
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400" 
                href="/auth/login"
              >
                Sign In
              </Link>
              <Link 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400" 
                href="/auth/register"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
