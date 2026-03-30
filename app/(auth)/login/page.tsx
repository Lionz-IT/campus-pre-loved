'use client'

import { useState, use } from 'react'
import { loginAction } from '@/actions/auth.actions'
import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectedFrom?: string }>
}) {
  const params = use(searchParams)
  const [error, setError] = useState<string | null>(params.error || null)
  const [loading, setLoading] = useState(false)

  const handleAction = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    const result = await loginAction(formData)
    
    if (result && !result.success && result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-white mb-6 text-center">Masuk ke Akun</h2>
      
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form action={handleAction} className="space-y-4">
        <div>
          <label htmlFor="campus_email" className="block text-slate-300 text-sm font-medium mb-1.5">
            Email Kampus
          </label>
          <input
            id="campus_email"
            name="campus_email"
            type="email"
            placeholder="nama@mhs.pens.ac.id"
            required
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-slate-300 text-sm font-medium mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Belum punya akun?{' '}
        <Link href={ROUTES.REGISTER} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Daftar sekarang
        </Link>
      </div>
    </div>
  )
}