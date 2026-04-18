import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function VerifyEmailPage() {
  return (
    <div className="w-full text-center py-4">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-3">
        Cek Email Kamu
      </h2>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
        Kami telah mengirimkan tautan verifikasi ke email kampus kamu. Silakan cek kotak masuk atau folder spam, lalu klik tautan tersebut untuk mengaktifkan akun.
      </p>
      
      <Link href={ROUTES.LOGIN}>
        <Button fullWidth size="lg">
          Kembali ke Login
        </Button>
      </Link>
    </div>
  )
}
