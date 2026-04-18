import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Masuk Akun',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <span className="text-white font-bold text-xl">CP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Campus <span className="text-blue-600">Pre-loved</span>
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
