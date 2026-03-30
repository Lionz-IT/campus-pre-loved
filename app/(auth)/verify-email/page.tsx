import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="w-full text-center py-6">
      <div className="flex justify-center mb-6 text-6xl">
        ✉️
      </div>
      <h2 className="text-2xl font-semibold text-white mb-4">
        Cek Email Kamu
      </h2>
      <p className="text-slate-300 text-sm mb-8 leading-relaxed">
        Kami telah mengirimkan tautan verifikasi ke email kampus kamu. Silakan cek kotak masuk atau folder spam, lalu klik tautan tersebut untuk mengaktifkan akun.
      </p>
      
      <Link 
        href={ROUTES.LOGIN}
        className="inline-block w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-600/25"
      >
        Kembali ke Login
      </Link>
    </div>
  )
}