import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAccessToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ["/dashboard", "/report"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const accessToken = request.cookies.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verify token without DB access (Edge-safe)
    const payload = verifyAccessToken(accessToken)
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ["/login", "/register"]
  const isAuthRoute = authRoutes.includes(pathname)

  if (isAuthRoute) {
    const accessToken = request.cookies.get("accessToken")?.value
    if (accessToken && verifyAccessToken(accessToken)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/report/:path*", "/login", "/register"],
}
