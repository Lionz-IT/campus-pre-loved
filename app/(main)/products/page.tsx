import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getMarketplaceFeedAction } from '@/features/products/actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import EmptyState from '@/components/ui/EmptyState'
import { ProductCard } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'
import ProductFilters from '@/components/product/ProductFilters'

export const metadata: Metadata = {
  title: 'Jelajahi Produk'
}

export default async function ProductsBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; condition?: string; min_price?: string; max_price?: string; page?: string }>
}) {
  const { category, q, sort, condition, min_price, max_price } = await searchParams
  const supabase = await createSupabaseServerClient()
  
  const [result, { data: { user } }] = await Promise.all([
    getMarketplaceFeedAction({ category, search: q, sort, condition, min_price, max_price, limit: 24 }),
    supabase.auth.getUser()
  ])
  
  const products = result.success ? result.data ?? [] : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-10">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    imageUrl={product.image_urls?.[0]}
                    isNegotiable={product.is_negotiable}
                    isOwner={user?.id === product.seller_id}
                  />
                ))}
              </div>

              {/* Mock Pagination */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#4C1A57] text-white font-medium shadow-sm transition-colors">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  3
                </button>
                <span className="w-10 h-10 flex items-center justify-center text-gray-500 tracking-widest font-bold">
                  ...
                </span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
