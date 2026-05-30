import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getMarketplaceFeedAction } from '@/features/products/actions'
import { getCurrentUser } from '@/lib/auth'
import EmptyState from '@/components/ui/EmptyState'
import ProductFilters from '@/components/product/ProductFilters'
import ProductSort from '@/components/product/ProductSort'
import InfiniteProductGrid from '@/components/product/InfiniteProductGrid'

export const metadata: Metadata = {
  title: 'Jelajahi Produk'
}

export default async function ProductsBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; condition?: string; min_price?: string; max_price?: string; page?: string }>
}) {
  const { category, q, sort, condition, min_price, max_price } = await searchParams
  
  const [result, user] = await Promise.all([
    getMarketplaceFeedAction({ category, search: q, sort, condition, min_price, max_price, limit: 24 }),
    getCurrentUser()
  ])
  
  const products = result.success ? result.data ?? [] : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semua Barang</h1>
        </div>
        <Suspense fallback={<div className="h-10 w-48 bg-gray-100 animate-pulse rounded-lg" />}>
          <ProductSort />
        </Suspense>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Suspense fallback={<div className="w-full lg:w-64 flex-shrink-0 animate-pulse bg-gray-100 h-96 rounded-xl" />}>
          <ProductFilters />
        </Suspense>

        <main className="flex-1 flex flex-col">
          {products.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              }
              title="Tidak ada produk ditemukan"
              description="Coba kata kunci, kategori, atau kondisi lain"
            />
          ) : (
            <InfiniteProductGrid
              initialProducts={products}
              filters={{ category, search: q, sort, condition, min_price, max_price }}
              pageSize={24}
              currentUserId={user?.id}
            />
          )}
        </main>
      </div>
    </div>
  )
}
