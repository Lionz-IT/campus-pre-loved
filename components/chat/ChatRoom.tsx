'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useChat } from '@/hooks/useChat'
import { sendOfferAction, acceptOfferAction, rejectOfferAction } from '@/actions/chat.actions'
import { formatPrice, formatRelativeTime, getInitials } from '@/lib/utils'
import type { MessageWithSender, Product, OfferPayload, OfferAcceptPayload, OfferRejectPayload } from '@/types'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { InputField, TextareaField } from '@/components/ui/Input'

interface ChatRoomProps {
  chatId:          string
  initialMessages: MessageWithSender[]
  currentUserId:   string
  isSeller:        boolean
  product:         Pick<Product, 'id' | 'title' | 'price' | 'status'>
}

export default function ChatRoom({ chatId, initialMessages, currentUserId, isSeller, product }: ChatRoomProps) {
  const { messages, sendMessage, isSending, error, bottomRef } = useChat(chatId, initialMessages)
  const [inputText, setInputText]         = useState('')
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerPrice, setOfferPrice]        = useState('')
  const [offerNote, setOfferNote]          = useState('')
  const [isSubmitting, setIsSubmitting]    = useState(false)

  const handleSend = async () => {
    if (!inputText.trim()) return
    await sendMessage(inputText)
    setInputText('')
  }

  const handleSendOffer = async () => {
    setIsSubmitting(true)

    const offeredPriceNumber = Number(offerPrice)
    if (!Number.isFinite(offeredPriceNumber) || offeredPriceNumber <= 0) {
      toast.error('Harga tawar tidak valid')
      setIsSubmitting(false)
      return
    }

    const result = await sendOfferAction(chatId, {
      offered_price:  offeredPriceNumber,
      original_price: product.price ?? undefined,
      note:           offerNote || undefined,
    })
    if (result?.success) {
      toast.success('Penawaran terkirim!')
    } else {
      toast.error('Gagal mengirim penawaran')
    }
    setShowOfferModal(false)
    setOfferPrice('')
    setOfferNote('')
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === currentUserId} isSeller={isSeller} chatId={chatId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-red-500 text-xs text-center px-4 py-1">{error}</p>
      )}

      {product.status !== 'sold' && (
        <div className="flex-shrink-0 p-3 bg-white border border-gray-200 rounded-2xl mt-3">
          <div className="flex gap-2 items-end">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Ketik pesan..."
              rows={1}
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm resize-none outline-none min-h-[36px] max-h-24"
            />
            {!isSeller && product.status === 'available' && (
              <button
                onClick={() => setShowOfferModal(true)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border border-amber-200"
              >
                Tawar
              </button>
            )}
            <Button
              onClick={handleSend}
              disabled={isSending || !inputText.trim()}
              size="sm"
            >
              Kirim
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        title="Ajukan Penawaran"
      >
        {product.price != null && (
          <p className="text-gray-500 text-sm">Harga asli: <span className="text-gray-900 font-semibold">{formatPrice(product.price)}</span></p>
        )}
        <InputField
          type="number"
          value={offerPrice}
          onChange={(e) => setOfferPrice(e.target.value)}
          label="Harga Tawar (Rp)"
          placeholder="Contoh: 150000"
        />
        <TextareaField
          value={offerNote}
          onChange={(e) => setOfferNote(e.target.value)}
          label="Catatan (opsional)"
          placeholder="Alasan penawaran..."
          rows={2}
        />
        <div className="flex gap-3">
          <Button
            onClick={() => setShowOfferModal(false)}
            variant="secondary"
            fullWidth
            size="lg"
          >
            Batal
          </Button>
          <Button
            onClick={handleSendOffer}
            disabled={!offerPrice || isSubmitting}
            variant="accent"
            fullWidth
            size="lg"
            loading={isSubmitting}
          >
            Kirim Tawaran
          </Button>
        </div>
      </Modal>
    </div>
  )
}


function MessageBubble({ message, isOwn, isSeller, chatId }: {
  message:  MessageWithSender
  isOwn:    boolean
  isSeller: boolean
  chatId:   string
}) {
  const [isActing, setIsActing] = useState(false)

  if (message.message_type === 'system') {
    return (
      <div className="text-center">
        <span className="text-gray-400 text-xs bg-gray-100 px-3 py-1 rounded-full">{message.content}</span>
      </div>
    )
  }

  if (message.message_type === 'offer' || message.message_type === 'offer_accept' || message.message_type === 'offer_reject') {
    const payload = message.payload as Partial<OfferPayload & OfferAcceptPayload & OfferRejectPayload> | null
    const hasPayload = Boolean(payload)
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs rounded-2xl p-4 border space-y-2 ${
          message.message_type === 'offer'        ? 'bg-amber-50 border-amber-200'
          : message.message_type === 'offer_accept' ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
        }`}>
          <p className="text-xs font-semibold text-gray-500">
            {message.message_type === 'offer'         ? 'Penawaran Harga'
             : message.message_type === 'offer_accept' ? 'Tawaran Diterima'
             : 'Tawaran Ditolak'}
          </p>
          {payload?.offered_price != null && <p className="text-gray-900 font-bold">{formatPrice(payload.offered_price)}</p>}
          {payload?.agreed_price  != null && <p className="text-gray-900 font-bold">{formatPrice(payload.agreed_price)}</p>}
          {payload?.counter_offer != null && <p className="text-gray-600 text-sm">Counter: {formatPrice(payload.counter_offer)}</p>}
          {payload?.meet_point && (
            <p className="text-gray-500 text-xs">{payload.meet_point} · {payload.meet_time}</p>
          )}
          {(payload?.note || payload?.reason) && (
            <p className="text-gray-400 text-xs italic">"{payload?.note ?? payload?.reason}"</p>
          )}

          {!hasPayload ? (
            <p className="text-gray-500 text-xs">Data penawaran tidak tersedia.</p>
          ) : message.message_type === 'offer' && isSeller && !isOwn ? (
            <div className="flex gap-2 pt-1">
              <button
                disabled={isActing || payload?.offered_price == null}
                onClick={async () => {
                  setIsActing(true)
                  await acceptOfferAction(chatId, {
                    agreed_price: payload?.offered_price ?? 0,
                    meet_point:   'Kantin Teknik PENS',
                    meet_time:    'Atur lewat chat',
                  })
                  setIsActing(false)
                }}
                className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
              >
                Terima
              </button>
              <button
                disabled={isActing}
                onClick={async () => {
                  setIsActing(true)
                  await rejectOfferAction(chatId, { reason: 'Maaf, harga tidak bisa dikurangi.' })
                  setIsActing(false)
                }}
                className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 border border-red-200"
              >
                Tolak
              </button>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <div className="relative w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0 overflow-hidden">
          {message.sender.avatar_url
            ? <Image src={message.sender.avatar_url} alt="" fill sizes="28px" className="object-cover" />
            : getInitials(message.sender.full_name)
          }
        </div>
      )}
      <div className={`max-w-xs px-4 py-2.5 rounded-2xl ${
        isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
          {formatRelativeTime(message.created_at)}
          {isOwn && (
            <span className="ml-1.5 inline-flex align-middle">
              {message.is_read ? (
                <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5M10.5 12.75l3 3" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-blue-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
