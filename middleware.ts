import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Only allow authenticated users to access /dashboard routes
      const isAccessingDashboard = req.nextUrl.pathname.startsWith("/dashboard")
      return isAccessingDashboard ? !!token : true
    },
  },
})

export const config = {
  matcher: ["/dashboard/:path*"]
}
