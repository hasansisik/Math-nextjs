import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (token) {
    try {
      const parsedToken = JSON.parse(token)
      const currentTime = new Date().getTime()
      
      // If token is expired or doesn't exist, redirect to login
      if (!parsedToken || parsedToken.exp < currentTime) {
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('auth_token')
        return response
      }
    } catch (error) {
      // If token is invalid JSON, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }
  } else {
    // No token found, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
