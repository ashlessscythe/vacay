import Link from "next/link"
import { Button } from "@/components/ui/button"
import { appConfig } from "@/lib/config"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center" href="/">
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {appConfig.name}
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/auth/login">
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950 animate-gradient-slow" />
          <div className="container mx-auto relative px-4 md:px-6 max-w-[1200px]">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Manage Time Off with{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent animate-gradient">
                    Ease
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Streamline your vacation tracking, leave requests, and team management all in one place.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/login">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 -bottom-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-bottom-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-500 to-cyan-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
            <div className="grid gap-6 lg:grid-cols-3 items-center">
              <div className="rounded-lg border bg-card p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 text-4xl font-bold text-blue-600">⏰</div>
                <h3 className="mb-2 text-xl font-bold">Time Tracking</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Effortlessly track vacation days, sick leave, and other time off with our intuitive interface.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 text-4xl font-bold text-cyan-500">👥</div>
                <h3 className="mb-2 text-xl font-bold">Team Management</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Keep your team organized with department-based tracking and approval workflows.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 text-4xl font-bold text-teal-500">📊</div>
                <h3 className="mb-2 text-xl font-bold">Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Get insights into leave patterns and make data-driven decisions with detailed reports.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
