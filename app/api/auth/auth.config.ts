import { AuthOptions, Session, User } from "next-auth"
import { JWT } from "next-auth/jwt"
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

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        if (!user.activated) {
          throw new Error("PENDING_ACTIVATION")
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.name} ${user.lastname}`,
          role: user.admin ? "ADMIN" : user.manager ? "MANAGER" : "USER",
          companyId: user.company_id.toString(),
          image: null
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours by default
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Only redirect to pending page if the error is PENDING_ACTIVATION
      if (url.includes("error=PENDING_ACTIVATION")) {
        return `${baseUrl}/auth/pending`
      }
      return url
    },
    async jwt({ token, user, trigger, session }: { 
      token: JWT;
      user?: User;
      trigger?: "signIn" | "signUp" | "update";
      session?: Session & { rememberMe?: boolean };
    }) {
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
      }
      
      // Update session duration if rememberMe is true
      if (trigger === "signIn" && session?.rememberMe) {
        token.maxAge = 30 * 24 * 60 * 60 // 30 days
      }
      
      return token
    },
    async session({ session, token }: { 
      session: Session; 
      token: JWT & { role?: string; companyId?: string };
    }) {
      if (session?.user) {
        session.user.role = token.role
        session.user.companyId = token.companyId || ''
      }
      return session
    }
  }
}
