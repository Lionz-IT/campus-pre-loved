import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getMyChatsAction } from '@/features/chats/actions'
import { ROUTES } from '@/lib/constants/routes'
import ChatsSidebar from '@/components/chat/sidebar/ChatsSidebar'

export default async function ChatsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const result = await getMyChatsAction()
  const chats  = result.success ? result.data ?? [] : []

  return (
    <>
      <div className="flex md:hidden flex-col h-full w-full bg-white z-10 absolute inset-0">
        <ChatsSidebar chats={chats} userId={user.id} />
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center h-full bg-gray-50/50">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 text-purple-200">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pilih Pesan</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">Pilih percakapan dari daftar di sebelah kiri untuk mulai mengirim pesan.</p>
        </div>
      </div>
    </>
  )
}

