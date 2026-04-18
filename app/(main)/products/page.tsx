import type { Metadata } from 'next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getMarketplaceFeedAction } from '@/actions/product.actions'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '@/lib/constants/pens'
import EmptyState from '@/components/ui/EmptyState'
import CategoryIcon from '@/components/ui/CategoryIcon'
import SearchBar from '@/components/ui/SearchBar'

const InfiniteProductGrid = dynamic(() => import('@/components/product/InfiniteProductGrid'), {
  loading: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="aspect-square skeleton-shimmer" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
            <div className="h-5 w-1/2 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Jelajahi Produk'
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Terbaru' },
  { value: 'price_asc',  label: 'Termurah' },
  { value: 'price_desc', label: 'Termahal' },
] as const

function buildHref(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const merged = { ...base, ...overrides }
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(merged)) {
    if (v && v !== 'all' && v !== 'newest') params.set(k, v)
  }
  const qs = params.toString()
  return `/products${qs ? `?${qs}` : ''}`
}

export default async function ProductsBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; condition?: string; page?: string }>
}) {
  const { category, q, sort, condition } = await searchParams
  const result = await getMarketplaceFeedAction({ category, search: q, sort, condition, limit: 24 })
  const products = result.success ? result.data ?? [] : []

  const currentParams = { category, q, sort, condition }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jelajahi Produk</h1>
          <p className="text-gray-500 mt-1 text-sm">Cari dan temukan barang yang kamu butuhkan</p>
        </div>
        
        <Suspense>
          <SearchBar defaultValue={q} />
        </Suspense>
      </section>

      <section>
        <div className="flex gap-2 flex-wrap">
          <a
            href={buildHref(currentParams, { category: undefined })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !category ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </a>
          {PRODUCT_CATEGORIES.map((cat) => (
            <a
              key={cat.value}
              href={buildHref(currentParams, { category: cat.value })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CategoryIcon name={cat.icon} className="w-4 h-4 inline-block -mt-0.5" /> {cat.label}
            </a>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          <span className="text-xs text-gray-500 font-medium">Urutkan:</span>
          {SORT_OPTIONS.map((opt) => (
            <a
              key={opt.value}
              href={buildHref(currentParams, { sort: opt.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                (sort ?? 'newest') === opt.value
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </a>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          <span className="text-xs text-gray-500 font-medium">Kondisi:</span>
          <a
            href={buildHref(currentParams, { condition: undefined })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !condition
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Semua
          </a>
          {PRODUCT_CONDITIONS.map((cond) => (
            <a
              key={cond.value}
              href={buildHref(currentParams, { condition: cond.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                condition === cond.value
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cond.label}
            </a>
          ))}
        </div>
      </section>

      <section>
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
            filters={{ category, search: q, sort, condition }}
            pageSize={24}
          />
        )}
      </section>
    </div>
  )
}
