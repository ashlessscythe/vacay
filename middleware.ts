import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
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
    
    // Handle pending users
    if (token?.status === 'PENDING') {
      // Allow access to pending page, redirect other routes to pending
      if (!path.startsWith('/auth/pending')) {
        return NextResponse.redirect(new URL('/auth/pending', req.url))
      }
      return NextResponse.next()
    }

    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (token && isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // If user is not authenticated and tries to access protected routes, redirect to login
    if (!token && !isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true // We handle authorization in the middleware function
    },
  }
)

export const config = {
  matcher: [
    // Protect all routes except public ones
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ]
}
