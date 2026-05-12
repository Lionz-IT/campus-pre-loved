import type { Metadata } from 'next'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getChatMessagesAction } from '@/actions/chat.actions'
import { ROUTES } from '@/lib/constants/routes'
import Badge from '@/components/ui/Badge'

const ChatRoom = dynamic(() => import('@/components/chat/ChatRoom'), {
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export const metadata: Metadata = { title: 'Chat' }

export default async function ChatRoomPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const [{ data: chat, error }, messagesResult] = await Promise.all([
    supabase
      .from('chats')
      .select(`
        *,
        product:products!chats_product_id_fkey ( id, title, image_urls, status, price, seller_id ),
        buyer:profiles!chats_buyer_id_fkey     ( id, full_name, avatar_url ),
        seller:profiles!chats_seller_id_fkey   ( id, full_name, avatar_url )
      `)
      .eq('id', chatId)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .single(),
    getChatMessagesAction(chatId),
  ])

  if (error || !chat) notFound()

  const initialMessages = messagesResult.success ? messagesResult.data ?? [] : []

  const isSeller = user.id === chat.seller_id
  const statusVariant = chat.product.status === 'available' ? 'green' as const : chat.product.status === 'booked' ? 'yellow' as const : 'gray' as const
  const statusLabel = chat.product.status === 'available' ? 'Tersedia' : chat.product.status === 'booked' ? 'Di-booking' : 'Terjual'

  return (
    <div className="w-full h-full flex flex-col absolute inset-0 md:static md:max-w-2xl md:mx-auto md:h-full bg-white md:bg-transparent">
      <div className="flex items-center gap-3 p-3 sm:p-4 bg-white border-b md:border md:rounded-2xl md:mb-4 flex-shrink-0 border-gray-200 sticky top-0 z-10">
        <Link href={ROUTES.CHATS} className="md:hidden p-2 -ml-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <a href={ROUTES.PRODUCT_DETAIL(chat.product.id)} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {chat.product.image_urls[0]
              ? <Image src={chat.product.image_urls[0]} alt={chat.product.title} fill sizes="48px" className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
            }
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 font-medium text-sm truncate">{chat.product.title}</p>
            <p className="text-gray-400 text-xs truncate">
              {isSeller ? `Pembeli: ${chat.buyer.full_name}` : `Penjual: ${chat.seller.full_name}`}
            </p>
          </div>
        </a>
        <Badge variant={statusVariant} className="hidden sm:inline-flex">{statusLabel}</Badge>
      </div>

      <ChatRoom
        chatId={chatId}
        initialMessages={initialMessages}
        currentUserId={user.id}
        isSeller={isSeller}
        product={chat.product}
        otherPerson={isSeller ? chat.buyer : chat.seller}
      />
    </div>
  )
}
