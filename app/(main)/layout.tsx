import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { getUnreadCountAction } from '@/actions/chat.actions'
import BottomNav from '@/components/layout/BottomNav'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.LOGIN)

  const unreadResult = await getUnreadCountAction()
  const unreadCount = unreadResult.success ? unreadResult.data ?? 0 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#main-content" className="skip-link">Langsung ke konten</a>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between" aria-label="Navigasi desktop">
          <a href={ROUTES.HOME} className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-blue-500 rounded-lg" aria-label="Campus Pre-loved - Beranda">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              Campus <span className="text-blue-600">Pre-loved</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            <a href={ROUTES.HOME} className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500">Home</a>
            <a href={ROUTES.PRODUCTS} className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500">Jelajahi</a>
            <a href={ROUTES.PRODUCT_NEW} className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500">+ Jual</a>
            <a href={ROUTES.CHATS} className="relative px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500">
              Chat
              {unreadCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none" aria-label={`${unreadCount} pesan belum dibaca`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </a>
            <a href={ROUTES.PROFILE} className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500">Profil</a>
          </div>
        </nav>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-6 pb-safe" role="main">
        {children}
      </main>

      <footer className="hidden md:block border-t border-gray-200 mt-12 py-6 text-center text-gray-400 text-sm bg-white">
        &copy; {new Date().getFullYear()} Campus Pre-loved &middot; Politeknik Elektronika Negeri Surabaya
      </footer>

      <BottomNav unreadCount={unreadCount} />
    </div>
  )
}
