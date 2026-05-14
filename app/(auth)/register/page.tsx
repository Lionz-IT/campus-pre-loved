'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { registerAction } from '@/features/auth/actions'
import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { InputField } from '@/components/ui/Input'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAction = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    const result = await registerAction(formData)
    
    if (result && !result.success && result.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    } else if (result && result.success) {
      toast.success('Akun berhasil dibuat! Cek email untuk verifikasi.')
      window.location.href = ROUTES.VERIFY_EMAIL
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Buat Akun Baru</h2>
      
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <form action={handleAction} className="space-y-4">
        <InputField
          id="full_name"
          name="full_name"
          type="text"
          label="Nama Lengkap"
          placeholder="John Doe"
          required
        />

        <InputField
          id="campus_email"
          name="campus_email"
          type="email"
          label="Email Kampus"
          placeholder="nama@mhs.pens.ac.id"
          required
          hint="Wajib menggunakan email domain PENS (@mhs.pens.ac.id, @it.student.pens.ac.id, atau @pens.ac.id)"
        />

        <InputField
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          required
        />

        <InputField
          id="confirm_password"
          name="confirm_password"
          type="password"
          label="Konfirmasi Password"
          placeholder="••••••••"
          required
        />

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Daftar Sekarang
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
          Masuk di sini
        </Link>
      </div>
    </div>
  )
}

