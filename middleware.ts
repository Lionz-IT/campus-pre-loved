import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

/**
 * Next.js Middleware — berjalan di Edge Runtime sebelum setiap request.
 * Tugasnya: refresh Supabase session + auth guard (redirect ke /login jika belum login).
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua route KECUALI:
     * - _next/static (aset statis)
     * - _next/image  (image optimization)
     * - favicon.ico
     * - File statis (.svg, .png, .jpg, dll)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
