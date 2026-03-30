import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title:       { default: 'Campus Pre-loved | PENS Marketplace', template: '%s | Campus Pre-loved' },
  description: 'Marketplace eksklusif mahasiswa PENS untuk jual-beli dan barter kebutuhan kuliah secara aman via COD di area kampus.',
  keywords:    ['PENS', 'marketplace', 'mahasiswa', 'jual beli', 'elektronika', 'mikrokontroler'],
  authors:     [{ name: 'PENS Students' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
