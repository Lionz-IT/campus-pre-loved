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
  const [success, setSuccess] = useState(false)

  const handleAction = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    const result = await registerAction(formData)
    
    if (result && !result.success && result.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    } else if (result && result.success) {
      setSuccess(true)
      toast.success('Akun berhasil dibuat! Cek email untuk verifikasi.')
      setTimeout(() => {
        window.location.href = ROUTES.VERIFY_EMAIL
      }, 2500)
    }
  }

  return (
    <div className="w-full relative">
      {success && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-fade-in transition-all duration-300">
          <style>{`
            @keyframes drawCheck {
              to { stroke-dashoffset: 0; }
            }
            @keyframes scaleIn {
              0% { transform: scale(0); }
              100% { transform: scale(1); }
            }
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(10px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-draw-check {
              stroke-dasharray: 24;
              stroke-dashoffset: 24;
              animation: drawCheck 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.3s;
            }
            .animate-scale-in {
              animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            .animate-fade-in-up-custom {
              animation: fadeInUp 0.5s ease-out forwards 0.1s;
              opacity: 0;
            }
          `}</style>
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping duration-1500" />
            {/* Spinning accent ring */}
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-r-purple-600 border-b-transparent border-l-transparent animate-spin" />
            {/* Inner glowing circle */}
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30 animate-scale-in">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-draw-check" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2 animate-fade-in-up-custom">Pendaftaran Berhasil!</h3>
          <p className="text-gray-500 text-sm animate-fade-in-up-custom">Silakan verifikasi email kampus Anda...</p>
        </div>
      )}

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

