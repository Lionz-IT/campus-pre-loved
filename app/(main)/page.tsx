import type { Metadata } from 'next'
import { getMarketplaceFeedAction } from '@/actions/product.actions'
import { PRODUCT_CATEGORIES } from '@/lib/constants/pens'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

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
      {/* Hero */}
      <section className="text-center py-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
          Marketplace Mahasiswa PENS
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Jual, beli, dan barter kebutuhan kuliah — mulai dari mikrokontroler sampai buku modul.
          COD aman di area kampus.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="/products/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-600/25"
          >
            + Mulai Jual
          </a>
          <a
            href="/products"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/10"
          >
            Jelajahi Semua
          </a>
        </div>
      </section>

      {/* Filter Kategori */}
      <section>
        <div className="flex gap-2 flex-wrap">
          <a
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !category ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {cat.emoji} {cat.label}
            </a>
          ))}
        </div>
      </section>

      {/* Grid Produk */}
      <section>
        {products.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg font-medium">Belum ada produk di kategori ini</p>
            <p className="text-sm">Jadilah yang pertama berjualan!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Foto */}
                <div className="aspect-square bg-slate-800 overflow-hidden">
                  {product.image_urls[0] ? (
                    <img
                      src={product.image_urls[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">
                      📷
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-1">
                  <p className="text-white font-medium text-sm line-clamp-2 leading-snug">
                    {product.title}
                  </p>
                  <p className="text-blue-400 font-bold text-base">
                    {product.listing_type === 'barter' ? '🔄 Barter' : formatPrice(product.price)}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-xs">{product.seller.full_name}</p>
                    <p className="text-slate-600 text-xs">{formatRelativeTime(product.created_at)}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
