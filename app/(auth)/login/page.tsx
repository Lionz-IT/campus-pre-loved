'use client'

import { useState, use } from 'react'
import { toast } from 'sonner'
import { loginAction } from '@/features/auth/actions'
import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { InputField } from '@/components/ui/Input'

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
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Masuk ke Akun</h2>
      
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <form action={handleAction} className="space-y-4">
        <InputField
          id="campus_email"
          name="campus_email"
          type="email"
          label="Email Kampus"
          placeholder="nama@mhs.pens.ac.id"
          required
        />

        <InputField
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          required
        />

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Masuk
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Belum punya akun?{' '}
        <Link href={ROUTES.REGISTER} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
          Daftar sekarang
        </Link>
      </div>
    </div>
  )
}

