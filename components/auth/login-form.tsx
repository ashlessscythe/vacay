'use client'
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
})

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [callbackUrl, setCallbackUrl] = useState<string>("/dashboard")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const searchCallbackUrl = searchParams.get("callbackUrl")
    if (typeof window !== "undefined") {
      setCallbackUrl(searchCallbackUrl || `${window.location.origin}/dashboard`)
    }
  }, [searchParams])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: callbackUrl,
        rememberMe: values.rememberMe,
      })

      // This will only run if redirect: false
      if (result?.error === "PENDING_ACTIVATION") {
        router.push("/auth/pending")
      } else if (result?.error) {
        form.setError("root", { 
          message: "Invalid email or password" 
        })
      } else {
        await router.push(callbackUrl)
      }
    } catch (error) {
      console.error(error)
      form.setError("root", { 
        message: "Something went wrong. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            variant="link"
            className="px-0 text-sm text-muted-foreground hover:text-primary"
            onClick={() => router.push("/auth/reset-password")}
            type="button"
          >
            Forgot password?
          </Button>
        </div>
        {form.formState.errors.root && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {form.formState.errors.root.message}
          </p>
        )}
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">Remember me</FormLabel>
            </FormItem>
          )}
        />
        <Button
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing in...
            </div>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </Form>
  )
}
