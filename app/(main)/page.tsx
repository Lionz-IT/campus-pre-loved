import type { Metadata } from 'next'
import { getMarketplaceFeedAction } from '@/actions/product.actions'
import { PRODUCT_CATEGORIES } from '@/lib/constants/pens'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { ProductCard } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import CategoryIcon from '@/components/ui/CategoryIcon'

export const metadata: Metadata = {
  title: 'Campus Pre-loved | Marketplace Mahasiswa PENS',
  description: 'Temukan barang bekas berkualitas dari sesama mahasiswa PENS — mikrokontroler, buku, laptop, dan lainnya.',
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const result = await getMarketplaceFeedAction({ category, search: q, limit: 24 })
  const products = result.success ? result.data ?? [] : []

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 md:p-12 text-white animate-fade-in-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Eksklusif Mahasiswa PENS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            Marketplace Mahasiswa PENS
          </h1>
          <p className="text-blue-100 text-base md:text-lg mb-6 leading-relaxed">
            Jual, beli, dan barter kebutuhan kuliah — mulai dari mikrokontroler sampai buku modul. COD aman di area kampus.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/products/new"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-amber-500/30 text-sm"
            >
              + Mulai Jual
            </a>
            <a
              href="/products"
              className="px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl font-semibold transition-all border border-white/20 text-sm"
            >
              Jelajahi Semua
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="flex gap-2 flex-wrap">
          <a
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !category ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </a>
          {PRODUCT_CATEGORIES.map((cat) => (
            <a
              key={cat.value}
              href={`/?category=${cat.value}`}
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

      <section>
        {products.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            }
            title="Belum ada produk di kategori ini"
            description="Jadilah yang pertama berjualan!"
            action={
              <a href="/products/new" className="inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
                + Mulai Jual
              </a>
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <div key={product.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                <ProductCard
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  listingType={product.listing_type}
                  imageUrl={product.image_urls[0]}
                  sellerName={product.seller.full_name}
                  timeAgo={formatRelativeTime(product.created_at)}
                  formatPrice={formatPrice}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
