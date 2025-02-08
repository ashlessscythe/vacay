import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      role: "ADMIN" | "MANAGER" | "USER"
    } & DefaultSession["user"]
  }

  interface User {
    role: "ADMIN" | "MANAGER" | "USER"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "MANAGER" | "USER"
  }
}
