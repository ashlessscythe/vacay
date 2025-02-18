import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { appConfig } from "@/lib/config"

export default function LoginPage() {
  return (
    <div className="container relative h-full flex items-center justify-center">
      <div className="relative hidden h-full w-1/3 flex-col bg-muted p-10 text-white lg:flex dark:border-r fixed left-0 top-0 bottom-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-blue-600" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          {appConfig.name}
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Streamline your vacation management with our modern, intuitive platform.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="w-full flex items-center justify-center lg:w-2/3 lg:ml-auto">
        <div className="w-full max-w-[400px] px-4">
          <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/50 dark:bg-gray-950/50">
      <CardHeader className="space-y-1">
        <div className="space-y-2">
          <h1 className="text-sm font-medium text-muted-foreground">{appConfig.name}</h1>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">Sign in</CardTitle>
        </div>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
