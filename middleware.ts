// src/middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'fallback-secret-key'

function base64UrlDecode(str: string): string {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding
  while (base64.length % 4) {
    base64 += '='
  }
  return atob(base64)
}

function base64UrlToUint8Array(str: string): Uint8Array {
  const decoded = base64UrlDecode(str)
  const array = new Uint8Array(decoded.length)
  for (let i = 0; i < decoded.length; i++) {
    array[i] = decoded.charCodeAt(i)
  }
  return array
}

async function verifyAccessToken(token: string) {
  try {
    console.log('Middleware: Verifying token:', token.substring(0, 20) + '...')

    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const [headerB64, payloadB64, signatureB64] = parts

    // Convert the signature from base64url to Uint8Array
    const signature = base64UrlToUint8Array(signatureB64)

    // Prepare the data to verify: header + '.' + payload
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)

    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET_STRING),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Verify the signature
    const isValid = await crypto.subtle.verify('HMAC', key, signature, data)
    if (!isValid) {
      throw new Error('Invalid signature')
    }

    // Now decode the payload
    const payloadJson = base64UrlDecode(payloadB64)
    const payload = JSON.parse(payloadJson)

    // Check expiration (exp is in seconds since epoch)
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      throw new Error('Token expired')
    }

    console.log('Middleware: Token verified successfully for user:', payload.userId)
    return { userId: payload.userId as string }
  } catch (error) {
    console.log('Middleware: Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('Middleware running for:', pathname)

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/report', '/inbox']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Auth routes that should redirect if already logged in
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(pathname)

  // Get the access token from cookies
  const accessToken = request.cookies.get('accessToken')?.value
  console.log('Access token exists:', !!accessToken)

  if (isProtectedRoute) {
    // Check if user is authenticated for protected routes
    if (!accessToken) {
      console.log(`Redirecting to login from ${pathname} - no token`)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token using Web Crypto API (Edge-compatible)
    const payload = await verifyAccessToken(accessToken)
    if (!payload) {
      console.log(`Redirecting to login from ${pathname} - invalid token`)
      // Token is invalid, redirect to login and clear cookies
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
      return response
    }

    console.log(`Access granted to ${pathname} for user ${payload.userId}`)
  }

  if (isAuthRoute) {
    // Redirect authenticated users away from auth pages
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken)
      if (payload) {
        console.log(
          `Redirecting authenticated user from ${pathname} to dashboard`
        )
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
