import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Masuk Akun',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image src="/logo.png" alt="Campus Pre-loved Logo" fill sizes="96px" className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-black">Campus</span> <span className="text-[var(--primary)]">Pre-loved</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Marketplace eksklusif mahasiswa PENS
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {children}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Eksklusif untuk sivitas akademika PENS &middot; Domain @pens.ac.id
        </p>
      </div>
    </div>
  )
}
