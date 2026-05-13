import { cache, Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createChatRoomAction } from '@/actions/chat.actions'
import { markAsSoldAction, revertSoldAction } from '@/actions/product.actions'
import { checkWishlistAction } from '@/actions/wishlist.actions'
import { getProductReviewsAction, checkCanReviewAction } from '@/actions/review.actions'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { PRODUCT_CONDITIONS, PRODUCT_STATUS_LABELS } from '@/lib/constants/pens'
import { ROUTES } from '@/lib/constants/routes'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import SubmitButton from '@/components/ui/SubmitButton'
import Card from '@/components/ui/Card'
import ShareButton from '@/components/ui/ShareButton'
import WishlistButton from '@/components/ui/WishlistButton'
import ReviewList from '@/components/product/ReviewList'
import ReviewForm from '@/components/product/ReviewForm'
import ImageCarousel from '@/components/ui/ImageCarousel'

// 1. DEDUPLICATE QUERY: Cache database call to reuse between Metadata and Component
const getProduct = cache(async (id: string) => {
  const supabase = await createSupabaseServerClient()
  return supabase
    .from('products')
    .select(`*, seller:profiles!products_seller_id_fkey (id, full_name, avatar_url, rating, whatsapp_number, nim, department)`)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data } = await getProduct(id)
  return {
    title:       data?.title ?? 'Detail Produk',
    description: data?.description ?? 'Lihat detail produk di Campus Pre-loved PENS.',
  }
}

// 2. ISOLATE WISHLIST QUERY
async function WishlistToggle({ productId }: { productId: string }) {
  const wishlistResult = await checkWishlistAction(productId)
  const isWishlisted = wishlistResult.success && wishlistResult.data ? wishlistResult.data.wishlisted : false
  return <WishlistButton productId={productId} initialWishlisted={isWishlisted} size="sm" />
}

// 3. ISOLATE REVIEWS AND ACTIONS (WATERFALL FIX)
async function ProductInteractions({ product, user }: { product: any, user: any }) {
  const supabase = await createSupabaseServerClient()
  const isLoggedIn = !!user
  const isSeller   = user?.id === product.seller_id

  let chatPromise: Promise<any> = Promise.resolve({ data: null })
  
  if (isLoggedIn) {
    if (!isSeller) {
      chatPromise = supabase.from('chats').select('id').eq('product_id', product.id).eq('buyer_id', user.id).maybeSingle() as any
    }
  }

  const [chatResult, reviewsResult, canReviewResult] = await Promise.all([
    chatPromise,
    getProductReviewsAction(product.id),
    checkCanReviewAction(product.id, product.seller_id),
  ])

  const existingChatId = chatResult.data?.id ?? null
  const reviews = reviewsResult.success && reviewsResult.data ? reviewsResult.data : []
  const canReview = canReviewResult.success && canReviewResult.data ? canReviewResult.data.canReview : false

  return (
    <>
      <div className="mt-4">
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
            {product.status === 'available' && existingChatId && (
              <form action={async () => {
                'use server'
                await markAsSoldAction(product.id, existingChatId!)
              }}>
                <SubmitButton variant="accent" size="lg" pendingText="Memproses...">
                  Tandai Terjual
                </SubmitButton>
              </form>
            )}
            {product.status === 'sold' && existingChatId && (
              <form action={async () => {
                'use server'
                await revertSoldAction(product.id, existingChatId!)
              }}>
                <SubmitButton variant="danger" size="lg" pendingText="Membatalkan...">
                  Batalkan Penjualan
                </SubmitButton>
              </form>
            )}
          </div>
        )}
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
    </>
  )
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Only block the initial render for the core product and user authentication!
  const [{ data: product, error }, { data: { user } }] = await Promise.all([
    getProduct(id),
    supabase.auth.getUser(),
  ])

  if (error || !product) notFound()

  const isLoggedIn = !!user
  const conditionLabel = PRODUCT_CONDITIONS.find((c) => c.value === product.condition)
  const statusKey      = product.status
  const statusInfo     = PRODUCT_STATUS_LABELS[statusKey]
  const statusBadgeVariant = product.status === 'available' ? 'green' as const : 'gray' as const

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
              {isLoggedIn && (
                <Suspense fallback={<div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />}>
                  <WishlistToggle productId={product.id} />
                </Suspense>
              )}
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
          
          <p className="text-gray-400 text-xs">Diposting {formatRelativeTime(product.created_at)}</p>

          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse w-full mt-4" />
              <div className="h-40 bg-gray-100 rounded-2xl animate-pulse w-full mt-10" />
            </div>
          }>
            <ProductInteractions product={product} user={user} />
          </Suspense>

        </div>
      </div>
    </div>
  )
}
