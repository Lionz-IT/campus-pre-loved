import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Supabase Server Client
 * Gunakan di: Server Components, Server Actions, Route Handlers
 * RLS aktif → user hanya bisa akses data miliknya sesuai policy
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Diabaikan jika dipanggil dari Server Component (read-only)
            // Middleware sudah menangani refresh session
          }
        },
      },
    },
  )
}

/**
 * Supabase Admin Client (Service Role)
 * Gunakan di: API Routes server-side saja, JANGAN expose ke client
 * Melewati RLS — hanya untuk operasi admin
 */
export function createSupabaseAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { persistSession: false },
    },
  )
}
