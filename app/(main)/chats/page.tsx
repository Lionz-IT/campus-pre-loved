import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getMyChatsAction } from '@/actions/chat.actions'
import { formatRelativeTime } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'
import EmptyState from '@/components/ui/EmptyState'
import ChatListRealtime from '@/components/chat/ChatListRealtime'

export const metadata: Metadata = { title: 'Pesan & Chat' }

export default async function ChatsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const result = await getMyChatsAction()
  const chats  = result.success ? result.data ?? [] : []

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ChatListRealtime />
      <h1 className="text-2xl font-bold text-gray-900">Pesan</h1>

      {chats.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          }
          title="Belum ada percakapan"
          description="Chat dengan penjual untuk mulai negosiasi!"
          action={
            <a href="/products" className="inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
              Jelajahi Produk
            </a>
          }
        />
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => {
            const isUserBuyer = chat.buyer_id === user.id
            const otherPerson = isUserBuyer ? chat.seller : chat.buyer

            return (
              <a
                key={chat.id}
                href={ROUTES.CHAT_ROOM(chat.id)}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {chat.product.image_urls[0] ? (
                    <Image src={chat.product.image_urls[0]} alt={chat.product.title} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium text-sm truncate">{chat.product.title}</p>
                  <p className="text-gray-400 text-xs mb-1">
                    {isUserBuyer ? `Penjual: ${otherPerson?.full_name}` : `Pembeli: ${otherPerson?.full_name}`}
                  </p>
                  {chat.last_message && (
                    <p className="text-gray-500 text-xs truncate">{chat.last_message.content ?? 'Penawaran'}</p>
                  )}
                </div>

                <div className="flex-shrink-0 text-right">
                  {chat.last_message_at && (
                    <p className="text-gray-400 text-xs">{formatRelativeTime(chat.last_message_at)}</p>
                  )}
                  <span className={`inline-block w-2.5 h-2.5 rounded-full mt-1.5 ${
                    chat.product.status === 'available' ? 'bg-green-500'
                    : chat.product.status === 'booked'  ? 'bg-amber-500'
                    : 'bg-gray-300'
                  }`} />
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
