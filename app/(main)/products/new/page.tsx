import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { ROUTES } from '@/lib/constants/routes'
import NewProductForm from '@/components/product/NewProductForm'

export const metadata: Metadata = { title: 'Jual Barang Baru' }

export default async function NewProductPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jual Barang</h1>
        <p className="text-gray-500 text-sm mt-1">Isi detail barang yang ingin kamu jual</p>
      </div>

      <NewProductForm />
    </div>
  )
}


