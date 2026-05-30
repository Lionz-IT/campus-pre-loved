import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getMyChatsAction } from '@/features/chats/actions'
import { ROUTES } from '@/lib/constants/routes'
import ChatsSidebar from '@/components/chat/sidebar/ChatsSidebar'
import ChatListRealtime from '@/components/chat/ChatListRealtime'

export const metadata: Metadata = { title: 'Pesan & Chat' }

export default async function ChatsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const result = await getMyChatsAction()
  const chats  = result.success ? result.data ?? [] : []

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white max-w-[1400px] mx-auto xl:border-x border-gray-200 shadow-sm relative">
      <ChatListRealtime />
      <div className="hidden md:flex flex-col w-80 lg:w-96 border-r border-gray-200 flex-shrink-0 bg-white">
        <ChatsSidebar chats={chats} userId={user.id as string} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30 relative">
        {children}
      </div>
    </div>
  )
}

