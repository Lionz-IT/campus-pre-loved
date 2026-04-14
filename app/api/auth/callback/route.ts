import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'


export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code         = searchParams.get('code')
  const next         = searchParams.get('next') ?? '/'
  const errorParam   = searchParams.get('error')
  const errorDesc    = searchParams.get('error_description')


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


    return NextResponse.redirect(`${origin}${next}`)
  }


  return NextResponse.redirect(`${origin}/login`)
}
