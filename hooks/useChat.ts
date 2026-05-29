'use client'

import { useEffect, useState, useCallback, useRef, useOptimistic, startTransition } from 'react'
import { sendMessageAction, markMessagesReadAction } from '@/features/chats/actions'
import type { Message, MessageWithSender } from '@/types'
import { io } from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')

export function useChat(chatId: string, initialMessages: MessageWithSender[], currentUserId?: string) {
  const [messages, setMessages]   = useState<MessageWithSender[]>(initialMessages)
  const [isSending, setIsSending] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const bottomRef                 = useRef<HTMLDivElement>(null)

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: MessageWithSender[], newMessage: MessageWithSender) => [...state, newMessage]
  )

  useEffect(() => {
    markMessagesReadAction(chatId).catch(console.error)
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [optimisticMessages])

  useEffect(() => {
    socket.emit("join-chat", chatId)

    socket.on("new-message", (newMessage: MessageWithSender) => {
        setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
        })
    })

    return () => {
        socket.off("new-message")
    }
  }, [chatId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return
      setError(null)
      
      setIsSending(true)
      const result = await sendMessageAction(chatId, content)
      if (!result.success) {
        setError(result.error)
      } else if (result.data) {
        socket.emit("send-message", result.data)
        setMessages((prev) => {
          if (prev.some((m) => m.id === result.data!.id)) return prev
          return [...prev, result.data!]
        })
      }

      setIsSending(false)
    },
    [chatId]
  )

  return { messages: optimisticMessages, sendMessage, isSending, error, bottomRef }
}

