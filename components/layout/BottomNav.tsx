'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    label: 'Beranda',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/products',
    label: 'Jelajahi',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    href: '/products/new',
    label: 'Jual',
    isCenter: true,
    icon: (_active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    href: '/chats',
    label: 'Chat',
    hasBadge: true,
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
]

interface BottomNavProps {
  unreadCount?: number
}

export default function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--border-light)] shadow-lg shadow-[var(--foreground)]/5 rounded-2xl md:hidden" aria-label="Navigasi utama">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                aria-label={item.label}
                className="flex items-center justify-center w-14 h-14 -mt-8 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] text-white rounded-full shadow-lg shadow-[var(--primary)]/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] z-10 border-4 border-[var(--background)]"
              >
                {item.icon(false)}
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-300 relative focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded-xl group',
                isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--primary-light)]',
              )}
            >
              <span className="relative transition-transform duration-300 group-hover:-translate-y-0.5">
                {item.icon(isActive)}
                {'hasBadge' in item && item.hasBadge && unreadCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--accent)] text-[var(--foreground)] text-[10px] font-extrabold rounded-full px-1.5 leading-none shadow-sm shadow-[var(--accent)]/40 animate-bounce"
                    aria-label={`${unreadCount} pesan belum dibaca`}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
              <span className={cn(
                "text-[10px] font-bold transition-all duration-300",
                isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
              )}>{item.label}</span>
              
              {/* Active Dot Indicator */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--primary)] rounded-full animate-fade-in-up"></span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
