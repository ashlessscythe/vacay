"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>

interface UpdatePasswordFormProps {
  token: string
}

export function UpdatePasswordForm({ token }: UpdatePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const form = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: UpdatePasswordForm) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: data.password }),
      })

      if (!response.ok) {
        throw new Error("Failed to reset password")
      }

      setIsSuccess(true)
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (error) {
      console.error("Error:", error)
      form.setError("password", {
        type: "manual",
        message: "Failed to reset password. The link may have expired.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="p-6">
        <div className="flex flex-col space-y-2 text-center">
          <h2 className="text-lg font-semibold">Password Updated</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully reset. Redirecting to login...
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your new password"
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Updating password...
            </div>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </Form>
  )
}
