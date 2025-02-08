import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { appConfig } from "@/lib/config"

export default function LoginPage() {
  return (
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
  )
}
