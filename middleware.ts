import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      const parsedToken = JSON.parse(token)
      const currentTime = new Date().getTime()
      
      // If token is expired or doesn't exist, redirect to login
      if (!parsedToken || parsedToken.exp < currentTime) {
        localStorage.removeItem('auth_token')
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }
  
  // For server-side, we'll handle auth in the page component
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
