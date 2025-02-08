import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.users.findFirst({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user?.password) {
          throw new Error("Invalid credentials")
        }

        if (!user.activated) {
          throw new Error("PENDING_ACTIVATION")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.name} ${user.lastname}`,
          role: user.admin ? "ADMIN" : user.manager ? "MANAGER" : "USER",
          image: null
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/pending",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours by default
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
      }
      
      // Update session duration if rememberMe is true
      if (trigger === "signIn" && session?.rememberMe) {
        token.maxAge = 30 * 24 * 60 * 60 // 30 days
      }
      
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
      }
      return session
    }
  }
}
