import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/callback
 *
 * Supabase Auth mengarahkan user ke sini setelah verifikasi email.
 * Handler ini menukar `code` menjadi session aktif, lalu redirect ke home.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code         = searchParams.get('code')
  const next         = searchParams.get('next') ?? '/'
  const errorParam   = searchParams.get('error')
  const errorDesc    = searchParams.get('error_description')

  // Tangani error dari Supabase (misal: link expired)
  if (errorParam) {
    console.error(`[Auth Callback] Error: ${errorParam} — ${errorDesc}`)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDesc ?? errorParam)}`,
    )
  }

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Exchange failed:', error.message)
      return NextResponse.redirect(`${origin}/login?error=Verifikasi+gagal`)
    }

    // Redirect ke halaman yang dimaksud (atau home)
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Tidak ada code → kembalikan ke login
  return NextResponse.redirect(`${origin}/login`)
}
