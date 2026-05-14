'use client'

import { useEffect, useState, useCallback, useRef, useOptimistic } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { sendMessageAction, markMessagesReadAction } from '@/features/chats/actions'
import type { Message, MessageWithSender } from '@/types'

export function useChat(chatId: string, initialMessages: MessageWithSender[], currentUserId?: string) {
  const [messages, setMessages]   = useState<MessageWithSender[]>(initialMessages)
  const [isSending, setIsSending] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const bottomRef                 = useRef<HTMLDivElement>(null)

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: MessageWithSender[], newMessage: MessageWithSender) => [...state, newMessage]
  )

  // Tandai pesan sudah dibaca saat komponen di-mount
  useEffect(() => {
    markMessagesReadAction(chatId).catch(console.error)
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [optimisticMessages])

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
      if (!content.trim()) return
      setError(null)
      
      if (currentUserId) {
        const tempId = crypto.randomUUID()
        addOptimisticMessage({
          id: tempId,
          chat_id: chatId,
          sender_id: currentUserId,
          message_type: 'text',
          content,
          payload: null,
          is_read: false,
          created_at: new Date().toISOString(),
          sender: { id: currentUserId, full_name: 'Me', avatar_url: null }
        })
      }

      setIsSending(true)
      const result = await sendMessageAction(chatId, content)
      if (!result.success) {
        setError(result.error)
      } else if (result.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === result.data!.id)) return prev
          return [...prev, result.data!]
        })
      }

      setIsSending(false)
    },
    [chatId, currentUserId, addOptimisticMessage],
  )

  return { messages: optimisticMessages, sendMessage, isSending, error, bottomRef }
}

