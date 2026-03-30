'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

/**
 * Supabase Browser Client
 * Gunakan di: Client Components — terutama untuk Realtime subscription
 * Satu instance per component (jangan buat di luar component tanpa useMemo)
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
