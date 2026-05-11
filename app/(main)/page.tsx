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
    <div className="space-y-10">
      <section className="relative overflow-hidden bg-[var(--surface-hover)] border border-[var(--border)] rounded-[2rem] p-8 md:p-14 animate-fade-in-up">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary)]/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="max-w-2xl flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 tracking-tight text-[var(--primary-dark)]">
              Selamat Datang di Campus Pre-loved
            </h1>
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <p className="text-[var(--text-secondary)] text-lg md:text-xl leading-relaxed font-medium">
                Hemat & Terpercaya di Kampus!
              </p>
              <span className="bg-amber-400 text-amber-950 font-bold px-3 py-1 rounded-md text-sm rotate-[-2deg]">
                #CampusLife
              </span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <a
                href="/products"
                className="px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl font-bold transition-colors text-base"
              >
                Mulai Belanja
              </a>
            </div>
          </div>
          <div className="flex-1 w-full md:w-auto flex justify-center md:justify-end">
            <div className="bg-white p-4 pb-10 shadow-xl rounded-sm rotate-3 hover:rotate-6 transition-transform duration-300">
              <div className="relative w-full max-w-sm aspect-[4/3] bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://picsum.photos/seed/books/600/400" 
                  alt="Books Polaroid" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-fade-in-up stagger-2">
        <div className="flex gap-3 flex-wrap">
          <a
            href="/"
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors duration-200 ${
              !category ? 'bg-[var(--foreground)] text-white' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
            }`}
          >
            Semua
          </a>
          {PRODUCT_CATEGORIES.map((cat) => (
            <a
              key={cat.value}
              href={`/?category=${cat.value}`}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors duration-200 flex items-center gap-2 ${
                category === cat.value
                  ? 'bg-[var(--foreground)] text-white'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
              }`}
            >
              <CategoryIcon name={cat.icon} className="w-4 h-4" /> {cat.label}
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--primary)]">Penawaran Terbaru</h2>
          <a href="/products" className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">
            Lihat Semua &rarr;
          </a>
        </div>
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
              <a href="/products/new" className="inline-flex px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl font-bold text-sm transition-colors">
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
                imageUrl={product.image_urls?.[0]}
                sellerName={product.seller_id} // Should join with users
                timeAgo={formatRelativeTime(product.created_at)}
              />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
