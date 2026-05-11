import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getMyChatsAction } from '@/actions/chat.actions'
import { ROUTES } from '@/lib/constants/routes'
import ChatsSidebar from '@/components/chat/sidebar/ChatsSidebar'
import ChatListRealtime from '@/components/chat/ChatListRealtime'

export const metadata: Metadata = { title: 'Pesan & Chat' }

export default async function ChatsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const result = await getMyChatsAction()
  const chats  = result.success ? result.data ?? [] : []

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white max-w-[1400px] mx-auto xl:border-x border-gray-200 shadow-sm">
      <ChatListRealtime />
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-80 lg:w-96 border-r border-gray-200 flex-shrink-0 bg-white">
        <ChatsSidebar chats={chats} userId={user.id} />
      </div>
      
      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col min-w-0 bg-gray-50/30">
        {children}
      </div>
    </div>
  )
}
