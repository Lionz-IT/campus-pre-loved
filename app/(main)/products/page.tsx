import type { Metadata } from 'next'
import { getMarketplaceFeedAction } from '@/actions/product.actions'
import { PRODUCT_CATEGORIES } from '@/lib/constants/pens'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Jelajahi Produk'
}

export default async function ProductsBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>
}) {
  const { category, q, page } = await searchParams
  const result = await getMarketplaceFeedAction({ category, search: q, limit: 24 })
  const products = result.success ? result.data ?? [] : []

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Jelajahi Produk</h1>
          <p className="text-slate-400 mt-1">Cari dan temukan barang yang kamu butuhkan</p>
        </div>
        
        <form method="GET" className="flex gap-3">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari nama produk..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25"
          >
            Cari
          </button>
        </form>
      </section>

      <section>
        <div className="flex gap-2 flex-wrap">
          <a
            href="/products"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !category ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Semua
          </a>
          {PRODUCT_CATEGORIES.map((cat) => (
            <a
              key={cat.value}
              href={`/products?category=${cat.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
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

      <section>
        {products.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">Tidak ada produk ditemukan</p>
            <p className="text-sm">Coba kata kunci atau kategori lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
              >
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
