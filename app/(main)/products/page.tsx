import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getMarketplaceFeedAction } from '@/actions/product.actions'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '@/lib/constants/pens'
import EmptyState from '@/components/ui/EmptyState'
import { ProductCard } from '@/components/ui/Card'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Jelajahi Produk'
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Terbaru' },
  { value: 'price_asc',  label: 'Termurah' },
  { value: 'price_desc', label: 'Termahal' },
] as const

export default async function ProductsBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; condition?: string; page?: string }>
}) {
  const { category, q, sort, condition } = await searchParams
  const result = await getMarketplaceFeedAction({ category, search: q, sort, condition, limit: 24 })
  const products = result.success ? result.data ?? [] : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semua Barang</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} barang ditemukan</p>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <span className="text-sm text-gray-600 font-medium">Urutkan:</span>
          <div className="relative">
            <select 
              defaultValue={sort || 'newest'}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1A57] focus:border-transparent cursor-pointer font-medium"
            >
              {SORT_OPTIONS.map(opt => (
                 <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Kiri */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          {/* Kategori */}
          <div>
            <h3 className="font-bold text-[#4C1A57] mb-4 tracking-wide">Kategori</h3>
            <div className="space-y-3">
               {PRODUCT_CATEGORIES.map(cat => (
                 <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative flex items-center justify-center">
                     <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#4C1A57] checked:border-[#4C1A57] transition-colors" />
                     <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   </div>
                   <span className="text-sm text-gray-700 group-hover:text-[#4C1A57] transition-colors">{cat.label}</span>
                 </label>
               ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Rentang Harga */}
          <div>
            <h3 className="font-bold text-[#4C1A57] mb-4 tracking-wide">Rentang Harga</h3>
            <div className="flex items-center gap-2 mb-4">
               <div className="relative flex-1">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                 <input type="number" placeholder="MIN" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4C1A57] focus:border-transparent outline-none" />
               </div>
               <span className="text-gray-400 font-medium">-</span>
               <div className="relative flex-1">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                 <input type="number" placeholder="MAX" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4C1A57] focus:border-transparent outline-none" />
               </div>
            </div>
            <button className="w-full py-2 px-4 bg-white border-2 border-[#4C1A57] text-[#4C1A57] rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors duration-200">
              Terapkan Harga
            </button>
          </div>

          <hr className="border-gray-200" />

          {/* Kondisi Barang */}
          <div>
             <h3 className="font-bold text-[#4C1A57] mb-4 tracking-wide">Kondisi Barang</h3>
             <div className="space-y-3">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="radio" name="kondisi" defaultChecked className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer checked:border-[#4C1A57] transition-colors" />
                    <div className="absolute w-2.5 h-2.5 bg-[#4C1A57] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-[#4C1A57] transition-colors font-medium">Semua Kondisi</span>
               </label>
               {PRODUCT_CONDITIONS.map(cond => (
                 <label key={cond.value} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="radio" name="kondisi" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer checked:border-[#4C1A57] transition-colors" />
                    <div className="absolute w-2.5 h-2.5 bg-[#4C1A57] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-[#4C1A57] transition-colors">{cond.label}</span>
                 </label>
               ))}
             </div>
          </div>
        </aside>

        {/* Product Grid & Pagination */}
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
                    listingType={product.listing_type}
                    imageUrl={product.image_urls?.[0]}
                    sellerName={product.seller_id} // Should join with users
                    timeAgo={formatRelativeTime(product.created_at)}
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

