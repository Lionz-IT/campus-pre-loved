
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getWishlistAction } from '@/features/wishlists/actions'
import { ProductCard } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import { ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = { title: 'Barang Tersimpan' }

export default async function WishlistsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const result = await getWishlistAction()
  // Data returned is casted to any here temporarily since the generated products structure in getWishlistAction is missing is_negotiable/price typing locally
  const products: any[] = result.success ? result.data : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Barang Tersimpan</h1>
        <p className="text-sm text-gray-500 mt-1">Daftar barang incaran yang telah kamu tandai</p>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          }
          title="Belum ada barang tersimpan"
          description="Mulai jelajahi marketplace dan tekan ikon hati untuk menyimpan barang incaranmu."
          action={
            <Link href="/products" className="inline-flex px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl font-bold text-sm transition-colors">
              Jelajahi Produk
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              imageUrl={product.image_urls?.[0]}
              status={product.status}
              isNegotiable={product.is_negotiable}
              isOwner={user.id === product.seller_id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

