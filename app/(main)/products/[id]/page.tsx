import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createChatRoomAction } from '@/actions/chat.actions'
import { bookProductAction, cancelBookingAction, markAsSoldAction } from '@/actions/product.actions'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { PRODUCT_CONDITIONS, PRODUCT_STATUS_LABELS } from '@/lib/constants/pens'
import { ROUTES } from '@/lib/constants/routes'
import type { ProductWithSeller } from '@/types'

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

  // Fetch produk + data penjual
  const { data: product, error } = await supabase
    .from('products')
    .select(`*, seller:profiles!products_seller_id_fkey (id, full_name, avatar_url, rating, whatsapp_number, nim, department)`)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error || !product) notFound()

  // Dapatkan user saat ini
  const { data: { user } } = await supabase.auth.getUser()
  const isSeller   = user?.id === product.seller_id
  const isBooker   = user?.id === product.booked_by
  const isLoggedIn = !!user

  const conditionLabel = PRODUCT_CONDITIONS.find((c) => c.value === product.condition)
  const statusInfo     = PRODUCT_STATUS_LABELS[product.status]

  // Cek apakah user sudah punya chat room dengan produk ini
  let existingChatId: string | null = null
  if (user && !isSeller) {
    const { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('product_id', id)
      .eq('buyer_id', user.id)
      .maybeSingle()
    existingChatId = chat?.id ?? null
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Foto Produk */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-800">
            {product.image_urls[0] ? (
              <img src={product.image_urls[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-slate-600">📷</div>
            )}
          </div>
          {product.image_urls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.image_urls.slice(1).map((url, i) => (
                <img key={i} src={url} alt={`Foto ${i + 2}`} className="w-20 h-20 object-cover rounded-xl flex-shrink-0 border border-white/10" />
              ))}
            </div>
          )}
        </div>

        {/* Info Produk */}
        <div className="space-y-5">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              product.status === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : product.status === 'booked'  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
            }`}>
              {statusInfo.label}
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
              {product.listing_type === 'barter' ? '🔄 Barter' : '💰 Dijual'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white leading-tight">{product.title}</h1>

          {/* Harga */}
          <p className="text-3xl font-bold text-blue-400">
            {product.listing_type === 'barter' ? 'Barter' : formatPrice(product.price)}
            {product.is_negotiable && <span className="text-sm text-slate-400 font-normal ml-2">(Nego)</span>}
          </p>

          {/* Detail */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-slate-500 text-xs mb-1">Kondisi</p>
              <p className="text-white text-sm font-medium">{conditionLabel?.label}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-slate-500 text-xs mb-1">Lokasi COD</p>
              <p className="text-white text-sm font-medium">{product.campus_location}</p>
            </div>
          </div>

          {/* Deskripsi */}
          {product.description && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-slate-400 text-xs mb-2 font-medium uppercase tracking-wide">Deskripsi</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Profil Penjual */}
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {product.seller.avatar_url
                ? <img src={product.seller.avatar_url} alt={product.seller.full_name} className="w-full h-full object-cover" />
                : product.seller.full_name[0].toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{product.seller.full_name}</p>
              <p className="text-slate-500 text-xs">{product.seller.department ?? 'Mahasiswa PENS'}</p>
            </div>
            <a href={ROUTES.PROFILE_PUBLIC(product.seller_id)} className="text-blue-400 text-xs hover:underline">
              Lihat Profil
            </a>
          </div>

          {/* CTA Buttons */}
          {!isSeller && isLoggedIn && product.status === 'available' && (
            <div className="flex gap-3">
              <form action={async () => {
                'use server'
                // Buat chat room jika belum ada, lalu redirect
                const result = await createChatRoomAction(product.id, product.seller_id)
                if (result.success) {
                  const { redirect } = await import('next/navigation')
                  redirect(ROUTES.CHAT_ROOM(result.data!.chatId))
                }
              }}>
                <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all hover:scale-105">
                  💬 Chat & Tawar
                </button>
              </form>
            </div>
          )}

          {/* Seller controls */}
          {isSeller && (
            <div className="flex gap-3">
              <a href={ROUTES.PRODUCT_EDIT(product.id)} className="flex-1 text-center px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all text-sm">
                ✏️ Edit Produk
              </a>
              {product.status === 'booked' && existingChatId && (
                <form action={async () => {
                  'use server'
                  await markAsSoldAction(product.id, existingChatId!)
                }}>
                  <button type="submit" className="px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-all text-sm">
                    ✅ Tandai Terjual
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Buyer cancel button */}
          {isBooker && existingChatId && (
            <form action={async () => {
              'use server'
              await cancelBookingAction(product.id, existingChatId!)
            }}>
              <button type="submit" className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-all text-sm border border-red-600/30">
                ✖️ Batalkan Booking
              </button>
            </form>
          )}

          <p className="text-slate-600 text-xs">Diposting {formatRelativeTime(product.created_at)}</p>
        </div>
      </div>
    </div>
  )
}
