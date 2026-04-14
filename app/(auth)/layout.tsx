import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Masuk Akun',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Campus <span className="text-blue-400">Pre-loved</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Marketplace eksklusif mahasiswa PENS
          </p>
        </div>

        {}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {children}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Eksklusif untuk sivitas akademika PENS · Domain @pens.ac.id
        </p>
      </div>
    </div>
  )
}
