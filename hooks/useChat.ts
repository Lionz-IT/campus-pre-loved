'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { sendMessageAction, markMessagesReadAction } from '@/actions/chat.actions'
import type { Message, MessageWithSender } from '@/types'

export function useChat(chatId: string, initialMessages: MessageWithSender[]) {
  const [messages, setMessages]   = useState<MessageWithSender[]>(initialMessages)
  const [isSending, setIsSending] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const bottomRef                 = useRef<HTMLDivElement>(null)

  // Tandai pesan sudah dibaca saat komponen di-mount
  useEffect(() => {
    markMessagesReadAction(chatId).catch(console.error)
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel(`chat-room:${chatId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const rawMessage = payload.new as Message

          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', rawMessage.sender_id)
            .single()

          const newMessage: MessageWithSender = {
            ...rawMessage,
            sender: sender ?? { id: rawMessage.sender_id, full_name: 'Unknown', avatar_url: null },
          }

          setMessages((prev) => {

            if (prev.some((m) => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId])


  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSending) return
      setIsSending(true)
      setError(null)

      const result = await sendMessageAction(chatId, content)
      if (!result.success) {
        setError(result.error)
      } else if (result.data) {
        // Optimistic update agar langsung muncul tanpa tunggu event socket
        setMessages((prev) => {
          if (prev.some((m) => m.id === result.data!.id)) return prev
          return [...prev, result.data!]
        })
      }

      setIsSending(false)
    },
    [chatId, isSending],
  )

  return { messages, sendMessage, isSending, error, bottomRef }
}
