'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatRelativeTime } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'
import type { ChatWithDetails } from '@/types'

interface ChatsSidebarProps {
  chats: ChatWithDetails[]
  userId: string
}

export default function ChatsSidebar({ chats, userId }: ChatsSidebarProps) {
  const params = useParams()
  const currentChatId = params?.chatId as string | undefined
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = chats.filter((chat) => {
    const isUserBuyer = chat.buyer_id === userId
    const otherPerson = isUserBuyer ? chat.seller : chat.buyer
    const searchLower = searchQuery.toLowerCase()
    
    return (
      otherPerson?.full_name?.toLowerCase().includes(searchLower) ||
      chat.product?.title?.toLowerCase().includes(searchLower) ||
      chat.last_message?.content?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-white sticky top-0 z-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight px-1">Pesan</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all placeholder-gray-400"
            placeholder="Cari pesan atau pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        {filteredChats.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center justify-center h-full">
            <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Belum ada obrolan.
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredChats.map((chat) => {
              const isUserBuyer = chat.buyer_id === userId
              const otherPerson = isUserBuyer ? chat.seller : chat.buyer
              const isActive = currentChatId === chat.id

              return (
                <Link
                  key={chat.id}
                  href={ROUTES.CHAT_ROOM(chat.id)}
                  className={`relative flex items-center gap-3 p-4 border-b border-gray-50 transition-all ${
                    isActive ? 'bg-purple-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-600 rounded-r-full" />
                  )}

                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 ring-1 ring-black/5">
                    {otherPerson?.avatar_url ? (
                      <Image src={otherPerson.avatar_url} alt={otherPerson.full_name || 'User'} fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-lg">
                        {otherPerson?.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <p className={`font-semibold text-sm truncate pr-2 ${isActive ? 'text-purple-900' : 'text-gray-900'}`}>
                        {otherPerson?.full_name}
                      </p>
                      {chat.last_message_at && (
                        <span className={`text-xs whitespace-nowrap flex-shrink-0 ${isActive ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                          {formatRelativeTime(chat.last_message_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      {chat.product?.title && (
                        <p className={`text-xs truncate mb-0.5 ${isActive ? 'text-purple-700/80' : 'text-gray-500'}`}>
                          {chat.product.title}
                        </p>
                      )}
                      <p className={`text-[13px] truncate ${isActive ? 'text-purple-900 font-medium' : 'text-gray-600'}`}>
                        {chat.last_message?.content ?? 'Penawaran dikirim'}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
