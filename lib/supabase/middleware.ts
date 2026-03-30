import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

/**
 * Refresh Supabase session di setiap request.
 * Dipanggil dari middleware.ts root.
 * Juga bertugas sebagai auth guard: redirect ke /login
 * jika user belum login dan mencoba akses protected routes.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh token — JANGAN hapus baris ini
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes: semua route kecuali (auth)/* dan halaman publik
  const { pathname } = request.nextUrl
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/verify-email')
  const isPublicRoute = pathname === '/' || pathname.startsWith('/products')

  if (!user && !isAuthRoute && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Jika sudah login dan mencoba akses halaman auth, redirect ke home
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}
