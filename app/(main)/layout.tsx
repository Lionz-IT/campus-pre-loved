import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { getUnreadCountAction } from '@/features/chats/actions'
import GSAPAnimations from '@/components/layout/GSAPAnimations'
import NextTopLoader from 'nextjs-toploader'
import Link from 'next/link'
import Image from 'next/image'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.LOGIN)

  const unreadResult = await getUnreadCountAction()
  const unreadCount = unreadResult.success ? unreadResult.data ?? 0 : 0

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <NextTopLoader color="var(--primary)" height={3} showSpinner={false} shadow="0 0 10px var(--primary), 0 0 5px var(--primary)" />
      <GSAPAnimations />
      
      {/* Modern Glassmorphism Top Navigation */}
      <header className="gsap-header sticky top-0 z-40 bg-gradient-to-b from-purple-50 to-white/95 backdrop-blur-xl border-b border-[var(--border)] shadow-sm transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative" aria-label="Navigasi">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded-xl group transition-transform hover:scale-[1.02]" aria-label="Campus Pre-loved - Beranda">
            <div className="relative w-10 h-10 sm:w-14 sm:h-14" aria-hidden="true">
              <Image src="/logo.png" alt="Campus Pre-loved Logo" fill sizes="(max-width: 640px) 40px, 56px" className="object-contain" priority />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
              <span className="text-black hidden sm:inline">Campus</span> <span className="text-[var(--primary)] hidden sm:inline">Pre-loved</span>
            </span>
          </Link>

          {/* Navigation Links - Mobile & Desktop */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href={ROUTES.PRODUCTS} prefetch={true} className="text-[#3730a3] hover:text-[var(--accent)] font-semibold transition-colors duration-200">
              <span className="hidden sm:inline">Jelajahi</span>
              <svg className="w-6 h-6 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </Link>
            <Link href="/wishlists" prefetch={true} className="text-[#3730a3] hover:text-[var(--accent)] font-semibold transition-colors duration-200">
              <span className="hidden sm:inline">Wishlist</span>
              <svg className="w-6 h-6 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </Link>
            <Link href={ROUTES.CHATS} prefetch={true} className="relative text-[#3730a3] hover:text-[var(--accent)] font-semibold transition-colors duration-200">
              <span className="hidden sm:inline">Chat</span>
              <svg className="w-6 h-6 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--accent)] text-white text-[10px] font-bold rounded-full px-1.5 leading-none shadow-sm shadow-[var(--accent)]/30 animate-pulse" aria-label={`${unreadCount} pesan belum dibaca`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href={ROUTES.PROFILE} prefetch={true} className="text-[#3730a3] hover:text-[var(--accent)] font-semibold transition-colors duration-200">
              <span className="hidden sm:inline">Profil</span>
              <svg className="w-6 h-6 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </Link>

            <Link href={ROUTES.PRODUCT_NEW} prefetch={true} className="px-3 sm:px-5 py-2 sm:py-2.5 bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] hover:-translate-y-0.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[var(--primary)]/20 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] flex items-center gap-2 border border-[var(--accent)]/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" /></svg>
              <span className="hidden sm:inline">Jual Barang</span>
              <span className="sm:hidden">Jual</span>
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content" className="gsap-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe" role="main">
        {children}
      </main>

      <footer className="gsap-footer border-t border-[var(--border)] mt-24 bg-gradient-to-b from-[var(--surface)] to-[var(--surface-hover)] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Branding Column */}
            <div className="gsap-footer-col col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-16 h-16">
                  <Image src="/logo.png" alt="Campus Pre-loved Logo" fill sizes="64px" className="object-contain" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight">
                  <span className="text-black">Campus</span> <span className="text-[var(--primary)]">Pre-loved</span>
                </span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm max-w-md leading-relaxed">
                Marketplace eksklusif mahasiswa Politeknik Elektronika Negeri Surabaya (PENS). Platform aman dan terpercaya untuk jual-beli dan barter kebutuhan kuliah di lingkungan kampus.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="gsap-footer-col">
              <h4 className="font-bold text-[var(--foreground)] mb-6 text-sm uppercase tracking-wider">Tautan Cepat</h4>
              <ul className="space-y-4">
                <li><Link href={ROUTES.PRODUCTS} prefetch={true} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:translate-x-1 transition-all inline-block">Jelajahi Produk</Link></li>
                <li><Link href={ROUTES.PRODUCT_NEW} prefetch={true} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:translate-x-1 transition-all inline-block">Mulai Berjualan</Link></li>
                <li><Link href={ROUTES.CHATS} prefetch={true} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:translate-x-1 transition-all inline-block">Pesan Masuk</Link></li>
                <li><Link href={ROUTES.PROFILE} prefetch={true} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:translate-x-1 transition-all inline-block">Pengaturan Profil</Link></li>
              </ul>
            </div>
            
            {/* Safety & Trust */}
            <div className="gsap-footer-col">
              <h4 className="font-bold text-[var(--foreground)] mb-6 text-sm uppercase tracking-wider">Keamanan</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-[var(--success)]/10 rounded-md text-[var(--success)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Eksklusif Mahasiswa PENS</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-[var(--accent)]/15 rounded-md text-[var(--accent-dark)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Rekomendasi Transaksi COD</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-[var(--primary)]/10 rounded-md text-[var(--primary)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Komunitas Terpercaya</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[var(--text-muted)] text-sm font-medium">
              &copy; {new Date().getFullYear()} Campus Pre-loved. Hak Cipta Dilindungi.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] bg-white px-4 py-2 rounded-full border border-[var(--border)] shadow-sm">
                Built with <span className="text-[var(--primary)] animate-pulse inline-block">💙</span> at PENS
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

