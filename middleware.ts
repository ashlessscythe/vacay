import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`
    
    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/login',
      '/auth/register',
      '/auth/reset-password'
    ]
    
    // Check if the current path exactly matches a public route
    const isPublicRoute = publicRoutes.some(route => 
      path === route || // Exact match
      (route !== '/' && path.startsWith(route)) // Prefix match for non-root routes
    )
    
    // Handle pending users

    if (token?.status === 'PENDING') {
      // Allow access to pending page, redirect other routes to pending
      if (!path.startsWith('/auth/pending')) {
        return NextResponse.redirect(new URL('/auth/pending', baseUrl))
      }
      return NextResponse.next()
    }

    // If user is authenticated and tries to access auth pages (except root), redirect to dashboard

    if (token && isPublicRoute && path !== '/') {
      return NextResponse.redirect(new URL('/dashboard', baseUrl))
    }
    
    // If user is not authenticated and tries to access protected routes, redirect to login
    if (!token && !isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', baseUrl))
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
