import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getChatMessagesAction } from '@/actions/chat.actions'
import { ROUTES } from '@/lib/constants/routes'
import ChatRoom from '@/components/chat/ChatRoom'

export const metadata: Metadata = { title: 'Chat' }

export default async function ChatRoomPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)


  const { data: chat, error } = await supabase
    .from('chats')
    .select(`
      *,
      product:products!chats_product_id_fkey ( id, title, image_urls, status, price, seller_id ),
      buyer:profiles!chats_buyer_id_fkey     ( id, full_name, avatar_url ),
      seller:profiles!chats_seller_id_fkey   ( id, full_name, avatar_url )
    `)
    .eq('id', chatId)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .single()

  if (error || !chat) notFound()


  const messagesResult = await getChatMessagesAction(chatId)
  const initialMessages = messagesResult.success ? messagesResult.data ?? [] : []

  const isSeller = user.id === chat.seller_id

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {}
      <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl mb-4 flex-shrink-0">
        <a href={ROUTES.PRODUCT_DETAIL(chat.product.id)} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
            {chat.product.image_urls[0]
              ? <img src={chat.product.image_urls[0]} alt={chat.product.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xl">📷</div>
            }
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">{chat.product.title}</p>
            <p className="text-slate-500 text-xs">
              {isSeller ? `Pembeli: ${chat.buyer.full_name}` : `Penjual: ${chat.seller.full_name}`}
            </p>
          </div>
        </a>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
          chat.product.status === 'available' ? 'bg-green-500/20 text-green-400'
          : chat.product.status === 'booked'  ? 'bg-yellow-500/20 text-yellow-400'
          : 'bg-slate-500/20 text-slate-400'
        }`}>
          {chat.product.status === 'available' ? 'Tersedia' : chat.product.status === 'booked' ? 'Di-booking' : 'Terjual'}
        </span>
      </div>

      {}
      <ChatRoom
        chatId={chatId}
        initialMessages={initialMessages}
        currentUserId={user.id}
        isSeller={isSeller}
        product={chat.product as never}
      />
    </div>
  )
}
