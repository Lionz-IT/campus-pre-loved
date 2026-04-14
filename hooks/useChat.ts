'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { sendMessageAction } from '@/actions/chat.actions'
import type { MessageWithSender } from '@/types'


export function useChat(chatId: string, initialMessages: MessageWithSender[]) {
  const [messages, setMessages]   = useState<MessageWithSender[]>(initialMessages)
  const [isSending, setIsSending] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const bottomRef                 = useRef<HTMLDivElement>(null)


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

          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single()

          const newMessage: MessageWithSender = {
            ...(payload.new as MessageWithSender),
            sender: sender ?? { id: payload.new.sender_id, full_name: 'Unknown', avatar_url: null },
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
      if (!result.success) setError(result.error)

      setIsSending(false)
    },
    [chatId, isSending],
  )

  return { messages, sendMessage, isSending, error, bottomRef }
}
