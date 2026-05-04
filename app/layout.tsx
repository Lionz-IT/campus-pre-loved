import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title:       { default: 'Campus Pre-loved | PENS Marketplace', template: '%s | Campus Pre-loved' },
  description: 'Marketplace eksklusif mahasiswa PENS untuk jual-beli dan barter kebutuhan kuliah secara aman via COD di area kampus.',
  keywords:    ['PENS', 'marketplace', 'mahasiswa', 'jual beli', 'elektronika', 'mikrokontroler', 'campus preloved', 'barter'],
  authors:     [{ name: 'PENS Students' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Campus Pre-loved',
    title: 'Campus Pre-loved | PENS Marketplace',
    description: 'Marketplace eksklusif mahasiswa PENS untuk jual-beli dan barter kebutuhan kuliah secara aman via COD di area kampus.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campus Pre-loved | PENS Marketplace',
    description: 'Marketplace eksklusif mahasiswa PENS untuk jual-beli dan barter kebutuhan kuliah secara aman via COD di area kampus.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'font-sans',
            style: { fontFamily: 'var(--font-inter), system-ui, sans-serif' },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  )
}
