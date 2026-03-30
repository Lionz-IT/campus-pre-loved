import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

/**
 * Layout untuk semua halaman yang membutuhkan:
 * 1. User sudah terautentikasi
 * 2. Navbar dan struktur halaman utama
 *
 * Server Component — fetch user di server, redirect jika belum login.
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Halaman dalam (main) wajib login (kecuali / dan /products sudah ditangani middleware)
  // Layout ini sebagai safety net tambahan
  if (!user) redirect(ROUTES.LOGIN)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar — akan dibuat sebagai komponen terpisah */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href={ROUTES.HOME} className="text-xl font-bold text-white">
            Campus <span className="text-blue-400">Pre-loved</span>
          </a>
          <div className="flex items-center gap-4">
            <a href={ROUTES.PRODUCTS}          className="text-slate-300 hover:text-white transition-colors text-sm">Jelajahi</a>
            <a href={ROUTES.PRODUCT_NEW}       className="text-slate-300 hover:text-white transition-colors text-sm">+ Jual</a>
            <a href={ROUTES.CHATS}             className="text-slate-300 hover:text-white transition-colors text-sm">Chat</a>
            <a href={ROUTES.PROFILE}           className="text-slate-300 hover:text-white transition-colors text-sm">Profil</a>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-white/10 mt-16 py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} Campus Pre-loved · Politeknik Elektronika Negeri Surabaya
      </footer>
    </div>
  )
}
