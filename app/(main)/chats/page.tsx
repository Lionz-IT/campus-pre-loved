import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getMyChatsAction } from '@/actions/chat.actions'
import { formatRelativeTime } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = { title: 'Pesan & Chat' }

export default async function ChatsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const result = await getMyChatsAction()
  const chats  = result.success ? result.data ?? [] : []

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-white">💬 Pesan</h1>

      {chats.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-5xl mb-4">💬</p>
          <p className="text-lg font-medium">Belum ada percakapan</p>
          <p className="text-sm">Chat dengan penjual untuk mulai negosiasi!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => {
            const isUserBuyer = chat.buyer_id === user.id
            const otherPerson = isUserBuyer ? chat.seller : chat.buyer

            return (
              <a
                key={chat.id}
                href={ROUTES.CHAT_ROOM(chat.id)}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all"
              >
                {}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                  {chat.product.image_urls[0] ? (
                    <img src={chat.product.image_urls[0]} alt={chat.product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                  )}
                </div>

                {}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{chat.product.title}</p>
                  <p className="text-slate-500 text-xs mb-1">
                    {isUserBuyer ? `Penjual: ${otherPerson?.full_name}` : `Pembeli: ${otherPerson?.full_name}`}
                  </p>
                  {chat.last_message && (
                    <p className="text-slate-400 text-xs truncate">{chat.last_message.content ?? '📎 Penawaran'}</p>
                  )}
                </div>

                {}
                <div className="flex-shrink-0 text-right">
                  {chat.last_message_at && (
                    <p className="text-slate-600 text-xs">{formatRelativeTime(chat.last_message_at)}</p>
                  )}
                  <span className={`inline-block w-2 h-2 rounded-full mt-1 ${
                    chat.product.status === 'available' ? 'bg-green-500'
                    : chat.product.status === 'booked'  ? 'bg-yellow-500'
                    : 'bg-slate-500'
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
