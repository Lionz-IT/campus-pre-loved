import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { getUnreadCountAction } from '@/actions/chat.actions'
import BottomNav from '@/components/layout/BottomNav'
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
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative" aria-label="Navigasi desktop">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded-xl group transition-transform hover:scale-[1.02]" aria-label="Campus Pre-loved - Beranda">
            <div className="relative w-14 h-14" aria-hidden="true">
              <Image src="/logo.png" alt="Campus Pre-loved Logo" fill sizes="56px" className="object-contain" priority />
            </div>
            <span className="text-2xl font-extrabold hidden sm:block tracking-tight">
              <span className="text-black">Campus</span> <span className="text-[var(--primary)]">Pre-loved</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-6">
            <Link href={ROUTES.PRODUCTS} prefetch={true} className="text-[#3730a3] hover:text-[var(--accent)] font-semibold transition-colors duration-200">Jelajahi</Link>
            <Link href={ROUTES.CHATS} prefetch={true} className="relative text-[#3730a3] hover:text-[var(--accent)] font-semibold transition-colors duration-200">
              Chat
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--accent)] text-white text-[10px] font-bold rounded-full px-1.5 leading-none shadow-sm shadow-[var(--accent)]/30 animate-pulse" aria-label={`${unreadCount} pesan belum dibaca`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href={ROUTES.PROFILE} prefetch={true} className="text-[#3730a3] hover:text-[var(--accent)] font-semibold transition-colors duration-200">Profil</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
             <button aria-label="Notifikasi" className="text-[#3730a3] hover:text-[var(--accent)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded-lg p-1.5">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
             </button>
             <button aria-label="Keranjang Belanja" className="text-[#3730a3] hover:text-[var(--accent)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded-lg p-1.5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             </button>

            <Link href={ROUTES.PRODUCT_NEW} prefetch={true} className="px-5 py-2.5 bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] hover:-translate-y-0.5 rounded-xl text-sm font-bold shadow-md shadow-[var(--primary)]/20 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] flex items-center gap-2 border border-[var(--accent)]/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Jual Barang
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content" className="gsap-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe" role="main">
        {children}
      </main>

      <footer className="gsap-footer hidden md:block border-t border-[var(--border)] mt-24 bg-gradient-to-b from-[var(--surface)] to-[var(--surface-hover)] pt-16 pb-8">
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

      <BottomNav unreadCount={unreadCount} />
    </div>
  )
}
