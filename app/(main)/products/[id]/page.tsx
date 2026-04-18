import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createChatRoomAction } from '@/actions/chat.actions'
import { bookProductAction, cancelBookingAction, markAsSoldAction } from '@/actions/product.actions'
import { checkWishlistAction } from '@/actions/wishlist.actions'
import { getProductReviewsAction, checkCanReviewAction } from '@/actions/review.actions'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { PRODUCT_CONDITIONS, PRODUCT_STATUS_LABELS } from '@/lib/constants/pens'
import { ROUTES } from '@/lib/constants/routes'
import type { ProductWithSeller } from '@/types'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import SubmitButton from '@/components/ui/SubmitButton'
import Card from '@/components/ui/Card'
import ShareButton from '@/components/ui/ShareButton'
import WishlistButton from '@/components/ui/WishlistButton'
import ReviewList from '@/components/product/ReviewList'
import ReviewForm from '@/components/product/ReviewForm'

const ImageCarousel = dynamic(() => import('@/components/ui/ImageCarousel'), {
  loading: () => <div className="aspect-square bg-gray-100 rounded-2xl skeleton-shimmer" />,
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('products').select('title, description').eq('id', id).single()
  return {
    title:       data?.title ?? 'Detail Produk',
    description: data?.description ?? 'Lihat detail produk di Campus Pre-loved PENS.',
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [{ data: product, error }, { data: { user } }] = await Promise.all([
    supabase
      .from('products')
      .select(`*, seller:profiles!products_seller_id_fkey (id, full_name, avatar_url, rating, whatsapp_number, nim, department)`)
      .eq('id', id)
      .eq('is_deleted', false)
      .single(),
    supabase.auth.getUser(),
  ])

  if (error || !product) notFound()

  const isSeller   = user?.id === product.seller_id
  const isBooker   = user?.id === product.booked_by
  const isLoggedIn = !!user

  const conditionLabel = PRODUCT_CONDITIONS.find((c) => c.value === product.condition)
  const statusInfo     = PRODUCT_STATUS_LABELS[product.status]

  const [chatResult, wishlistResult, reviewsResult, canReviewResult] = await Promise.all([
    user && !isSeller
      ? supabase.from('chats').select('id').eq('product_id', id).eq('buyer_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    checkWishlistAction(id),
    getProductReviewsAction(id),
    checkCanReviewAction(id, product.seller_id),
  ])

  const existingChatId = chatResult.data?.id ?? null
  const isWishlisted = wishlistResult.success && wishlistResult.data ? wishlistResult.data.wishlisted : false
  const reviews = reviewsResult.success && reviewsResult.data ? reviewsResult.data : []
  const canReview = canReviewResult.success && canReviewResult.data ? canReviewResult.data.canReview : false

  const statusBadgeVariant = product.status === 'available' ? 'green' as const : product.status === 'booked' ? 'yellow' as const : 'gray' as const

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="animate-fade-in-up">
          <ImageCarousel images={product.image_urls} alt={product.title} />
        </div>

        <div className="space-y-5 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={statusBadgeVariant}>{statusInfo.label}</Badge>
              <Badge variant={product.listing_type === 'barter' ? 'amber' : 'blue'}>
                {product.listing_type === 'barter' ? 'Barter' : 'Dijual'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {isLoggedIn && <WishlistButton productId={product.id} initialWishlisted={isWishlisted} size="sm" />}
              <ShareButton url={ROUTES.PRODUCT_DETAIL(product.id)} title={product.title} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h1>

          <p className="text-3xl font-bold text-blue-600">
            {product.listing_type === 'barter' ? 'Barter' : formatPrice(product.price)}
            {product.is_negotiable && <span className="text-sm text-gray-400 font-normal ml-2">(Nego)</span>}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Card className="!p-3">
              <p className="text-gray-400 text-xs mb-1">Kondisi</p>
              <p className="text-gray-900 text-sm font-medium">{conditionLabel?.label}</p>
            </Card>
            <Card className="!p-3">
              <p className="text-gray-400 text-xs mb-1">Lokasi COD</p>
              <p className="text-gray-900 text-sm font-medium">{product.campus_location}</p>
            </Card>
          </div>

          {product.description && (
            <Card>
              <p className="text-gray-400 text-xs mb-2 font-medium uppercase tracking-wide">Deskripsi</p>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </Card>
          )}

          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <Avatar src={product.seller.avatar_url} name={product.seller.full_name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium text-sm truncate">{product.seller.full_name}</p>
                <p className="text-gray-400 text-xs">{product.seller.department ?? 'Mahasiswa PENS'}</p>
              </div>
              <a href={ROUTES.PROFILE_PUBLIC(product.seller_id)} className="text-blue-600 text-xs font-medium hover:underline">
                Lihat Profil
              </a>
            </div>
          </Card>

          {!isSeller && isLoggedIn && product.status === 'available' && (
          <div className="flex gap-3">
              <form action={async () => {
                'use server'
                const result = await createChatRoomAction(product.id, product.seller_id)
                if (result.success) {
                  const { redirect } = await import('next/navigation')
                  redirect(ROUTES.CHAT_ROOM(result.data!.chatId))
                }
              }} className="flex-1">
                <SubmitButton fullWidth size="lg" pendingText="Membuka chat...">
                  Chat &amp; Tawar
                </SubmitButton>
              </form>
            </div>
          )}

          {isSeller && (
            <div className="flex gap-3">
              <a href={ROUTES.PRODUCT_EDIT(product.id)} className="flex-1">
                <Button variant="outline" fullWidth size="lg">
                  Edit Produk
                </Button>
              </a>
              {product.status === 'booked' && existingChatId && (
                <form action={async () => {
                  'use server'
                  await markAsSoldAction(product.id, existingChatId!)
                }}>
                  <SubmitButton variant="accent" size="lg" pendingText="Memproses...">
                    Tandai Terjual
                  </SubmitButton>
                </form>
              )}
            </div>
          )}

          {isBooker && existingChatId && (
            <form action={async () => {
              'use server'
              await cancelBookingAction(product.id, existingChatId!)
            }}>
              <SubmitButton variant="danger" fullWidth size="lg" pendingText="Membatalkan...">
                Batalkan Booking
              </SubmitButton>
            </form>
          )}

          <p className="text-gray-400 text-xs">Diposting {formatRelativeTime(product.created_at)}</p>
        </div>
      </div>

      <div className="mt-10 animate-fade-in-up stagger-3">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Pembeli</h2>
          <ReviewList reviews={reviews} />
          {canReview && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tulis Review</h3>
              <ReviewForm productId={product.id} sellerId={product.seller_id} />
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
