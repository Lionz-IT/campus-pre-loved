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
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white border border-[var(--border)] rounded-full px-5 py-2 text-xs font-bold mb-6 shadow-sm text-[var(--primary-dark)]">
            <span className="w-2.5 h-2.5 bg-[var(--primary)] rounded-full animate-pulse" />
            Eksklusif Mahasiswa PENS
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 tracking-tight text-[var(--foreground)]">
            Marketplace<br/><span className="text-[var(--primary)]">Mahasiswa PENS</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl mb-8 leading-relaxed max-w-xl font-medium">
            Jual, beli, dan barter kebutuhan kuliah — mulai dari mikrokontroler sampai buku modul. COD aman di area kampus.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="/products/new"
              className="px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl font-bold transition-colors text-base"
            >
              + Mulai Jual
            </a>
            <a
              href="/products"
              className="px-8 py-4 bg-white hover:bg-[var(--surface-hover)] text-[var(--text-primary)] rounded-xl font-bold transition-colors border border-[var(--border)] text-base"
            >
              Jelajahi Semua
            </a>
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
