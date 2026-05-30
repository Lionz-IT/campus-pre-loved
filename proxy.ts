import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { ROUTES } from "@/lib/constants/routes"

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify-email')

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/dashboard' ||
    pathname === '/products' ||
    (pathname.startsWith('/products/') && !pathname.endsWith('/edit') && !pathname.includes('/new'))

  if (pathname.startsWith('/api')) return NextResponse.next()

  // If NOT logged in, block protected routes (like /dashboard) and redirect to login
  if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = ROUTES.LOGIN
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If logged in, block auth routes and redirect to dashboard
  if (isLoggedIn && isAuthRoute) {
    const url = req.nextUrl.clone()
    url.pathname = ROUTES.DASHBOARD
    return NextResponse.redirect(url)
  }

  // If logged in and visiting home page (/), redirect to dashboard
  if (isLoggedIn && pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = ROUTES.DASHBOARD
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
