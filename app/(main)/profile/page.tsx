import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import type { Product, Profile } from '@/types'
import { ProductCard } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'Profil Saya' }

export default async function MyProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.LOGIN)

  const [{ data: profileData }, { data: productsData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('products')
      .select('*, seller:profiles(*)')
      .eq('seller_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileData
  const listings = productsData ?? []
  const displayName = profile?.full_name ?? user.email?.split('@')[0] ?? 'Pengguna'

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* 1. User Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 w-full">
          {/* Avatar */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-white shadow-md">
            {profile?.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt={displayName} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-3xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              {/* Verified Badge */}
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 font-medium">
              {profile?.department || 'Universitas'} • Angkatan {profile?.nim ? '20' + profile.nim.substring(2, 4) : '2021'}
            </p>
            
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4 pt-2">
              <Link 
                href={ROUTES.PROFILE_SETTINGS} 
                className="inline-flex items-center justify-center px-6 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-purple-600/20"
              >
                Edit Profil
              </Link>
              <button className="inline-flex items-center justify-center px-6 py-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 active:bg-purple-100 text-sm font-semibold rounded-xl transition-colors">
                Bagikan
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-stretch gap-8 bg-gray-50/80 px-8 py-5 rounded-2xl border border-gray-100 w-full md:w-auto justify-center">
          <div className="flex flex-col items-center justify-center space-y-1">
            <span className="text-3xl font-black text-gray-900">{profile?.total_sold ?? 12}</span>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Terjual</span>
          </div>
          <div className="w-px bg-gray-300 rounded-full my-1"></div>
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-black text-gray-900">{profile?.rating?.toFixed(1) ?? '4.8'}</span>
              <svg className="w-6 h-6 text-amber-400 fill-amber-400 mb-1" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Bintang</span>
          </div>
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar px-1">
        {['Barang Saya', 'Pesanan', 'Chat Tersimpan', 'Pengaturan'].map((tab, i) => (
          <button 
            key={tab}
            className={`pb-4 text-base font-semibold whitespace-nowrap border-b-[3px] transition-colors ${
              i === 0 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Content Bawah (Barang Saya) */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Sedang Dijual <span className="text-gray-400 font-medium text-base ml-1">({listings.length})</span></h2>
          <Link href="/products/new" className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-purple-700 hover:bg-purple-50 text-sm font-bold rounded-lg transition-colors">
            + Tambah Barang
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {listings.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                imageUrl={product.image_urls?.[0]}
                sellerName={user.id}
                timeAgo={formatRelativeTime(product.created_at)}
                status={product.status}
                isNegotiable={product.is_negotiable}
              />
          ))}

          {/* Jual Barang Baru Placeholder */}
          <Link 
            href="/products/new" 
            className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 aspect-[3/4] group select-none relative"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm group-hover:border-purple-300 group-hover:text-purple-600 group-hover:shadow-purple-100 transition-all duration-300 transform group-hover:-translate-y-1">
              <svg className="w-7 h-7 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-500 group-hover:text-purple-700 transition-colors">Jual Barang Baru</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
