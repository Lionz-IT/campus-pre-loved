import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { PRODUCT_STATUS_LABELS } from '@/lib/constants/pens'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { getSellerReviewsAction } from '@/features/reviews/actions'
import type { Product, Profile } from '@/types'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ReviewList from '@/components/product/ReviewList'

type Params = Promise<{ userId: string }>

const STATUS_BADGE_VARIANT = {
  green: 'green',
  yellow: 'yellow',
  gray: 'gray',
} as const

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { userId } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).single()
  const profileMeta = data as Pick<Profile, 'full_name'> | null

  return {
    title: profileMeta?.full_name ? `${profileMeta.full_name} | Profil` : 'Profil Pengguna',
  }
}

export default async function PublicProfilePage({ params }: { params: Params }) {
  const { userId } = await params
  const supabase = await createSupabaseServerClient()

  const [{ data: profileData }, { data: productsData }, sellerReviewsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('products')
      .select('*')
      .eq('seller_id', userId)
      .eq('status', 'available')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }),
    getSellerReviewsAction(userId),
  ])

  const profile = profileData as Profile | null
  if (!profile) notFound()

  const listings = (productsData ?? []) as Product[]
  const sellerReviews = sellerReviewsResult.success && sellerReviewsResult.data ? sellerReviewsResult.data : []
  const displayName = profile.full_name || 'Pengguna'

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Avatar src={profile.avatar_url} name={displayName} size="xl" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="blue">{profile.department || 'Departemen belum diisi'}</Badge>
                <Badge variant="gray">NRP: {profile.nim || '-'}</Badge>
              </div>
              <p className="text-gray-500 text-sm max-w-xl">{profile.bio || 'Belum menambahkan bio.'}</p>
              <p className="text-gray-400 text-sm">WhatsApp: {profile.whatsapp_number || '-'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-blue-600 text-xs font-medium">Total Listing</p>
            <p className="text-gray-900 text-2xl font-bold">{profile.total_listings ?? 0}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-amber-600 text-xs font-medium">Total Terjual</p>
            <p className="text-gray-900 text-2xl font-bold">{profile.total_sold ?? 0}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-green-600 text-xs font-medium">Rating</p>
            <p className="text-gray-900 text-2xl font-bold">{profile.rating?.toFixed(1) ?? '0.0'}</p>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Listing Aktif</h2>
          <span className="text-sm text-gray-400">{listings.length} item</span>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            }
            title="Belum ada listing aktif"
            description="Penjual ini belum memiliki produk yang tersedia."
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
                      {formatPrice(product.price)}
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
        <h2 className="text-xl font-semibold text-gray-900">Review dari Pembeli</h2>
        <Card>
          <ReviewList reviews={sellerReviews} />
        </Card>
      </section>
    </div>
  )
}
