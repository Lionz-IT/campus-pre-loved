'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops, ada yang salah</h2>
        <p className="text-gray-500 text-sm mb-6">
          Terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Coba Lagi</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>Ke Beranda</Button>
        </div>
      </div>
    </div>
  )
}
