import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname
      
      // Public routes that don't require authentication
      const publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/reset-password'
      ]
      
      // Check if the current path is a public route
      const isPublicRoute = publicRoutes.some(route => 
        path.startsWith(route)
      )
      
      // Allow access to public routes, require auth for all others
      return isPublicRoute ? true : !!token
    },
  },
})

export const config = {
  matcher: [
    // Protect all routes except public ones
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ]
}
