import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { PRODUCT_STATUS_LABELS } from '@/lib/constants/pens'
import { formatPrice, formatRelativeTime, getInitials } from '@/lib/utils'
import { getWishlistAction } from '@/actions/wishlist.actions'
import type { Product, Profile } from '@/types'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ProductCard } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: 'Profil Saya' }

const STATUS_BADGE_VARIANT = {
  green: 'green',
  yellow: 'yellow',
  gray: 'gray',
} as const

export default async function MyProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.LOGIN)

  const [{ data: profileData }, { data: productsData }, wishlistResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }),
    getWishlistAction(),
  ])

  const profile = profileData as Profile | null
  const listings = (productsData ?? []) as Product[]
  const wishlistProducts = wishlistResult.success && wishlistResult.data ? wishlistResult.data : []
  const displayName = profile?.full_name ?? user.email?.split('@')[0] ?? 'Pengguna'

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Avatar src={profile?.avatar_url} name={displayName} size="xl" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="blue">{profile?.department || 'Departemen belum diisi'}</Badge>
                <Badge variant="gray">NRP: {profile?.nim || '-'}</Badge>
              </div>
              <p className="text-gray-500 text-sm max-w-xl">{profile?.bio || 'Belum menambahkan bio.'}</p>
              <p className="text-gray-400 text-sm">WhatsApp: {profile?.whatsapp_number || '-'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <a href={ROUTES.PROFILE_SETTINGS}>
              <Button variant="primary" size="sm">Edit Profil</Button>
            </a>
            <form action={async () => {
              'use server'
              const { logoutAction } = await import('@/actions/auth.actions')
              await logoutAction()
            }}>
              <Button type="submit" variant="danger" size="sm">Keluar</Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-blue-600 text-xs font-medium">Total Listing</p>
            <p className="text-gray-900 text-2xl font-bold">{profile?.total_listings ?? 0}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-amber-600 text-xs font-medium">Total Terjual</p>
            <p className="text-gray-900 text-2xl font-bold">{profile?.total_sold ?? 0}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-green-600 text-xs font-medium">Rating</p>
            <p className="text-gray-900 text-2xl font-bold">{profile?.rating?.toFixed(1) ?? '0.0'}</p>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Listing Saya</h2>
          <span className="text-sm text-gray-400">{listings.length} item</span>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            }
            title="Kamu belum punya listing"
            description="Yuk pasang barang pertamamu!"
            action={
              <a href="/products/new">
                <Button variant="primary" size="md">+ Mulai Jual</Button>
              </a>
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((product) => {
              const status = PRODUCT_STATUS_LABELS[product.status]
              const badgeVariant = STATUS_BADGE_VARIANT[status.color]

              return (
                <a
                  key={product.id}
                  href={ROUTES.PRODUCT_DETAIL(product.id)}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {product.image_urls[0] ? (
                      <Image
                        src={product.image_urls[0]}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <Badge variant={badgeVariant}>{status.label}</Badge>
                    <p className="text-gray-900 font-medium text-sm line-clamp-2 leading-snug">{product.title}</p>
                    <p className="text-blue-600 font-bold text-base">
                      {product.listing_type === 'barter' ? 'Barter' : formatPrice(product.price)}
                    </p>
                    <p className="text-gray-400 text-xs">{formatRelativeTime(product.created_at)}</p>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Wishlist</h2>
          <span className="text-sm text-gray-400">{wishlistProducts.length} item</span>
        </div>

        {wishlistProducts.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            }
            title="Wishlist kosong"
            description="Simpan barang favoritmu dengan menekan tombol hati."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                listingType={product.listing_type}
                imageUrl={product.image_urls[0]}
                sellerName={product.seller.full_name}
                timeAgo={formatRelativeTime(product.created_at)}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
