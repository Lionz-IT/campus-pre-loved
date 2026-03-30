'use client'

import { useState, useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { sendOfferAction, acceptOfferAction, rejectOfferAction } from '@/actions/chat.actions'
import { formatPrice, formatRelativeTime, getInitials } from '@/lib/utils'
import type { MessageWithSender, Product, OfferPayload, OfferAcceptPayload } from '@/types'

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
    await sendOfferAction(chatId, {
      offered_price:  Number(offerPrice),
      original_price: product.price ?? undefined,
      note:           offerNote || undefined,
    })
    setShowOfferModal(false)
    setOfferPrice('')
    setOfferNote('')
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Daftar Pesan */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === currentUserId} isSeller={isSeller} chatId={chatId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-red-400 text-xs text-center px-4 py-1">{error}</p>
      )}

      {/* Input Area */}
      {product.status !== 'sold' && (
        <div className="flex-shrink-0 p-3 bg-white/5 border border-white/10 rounded-2xl mt-3">
          <div className="flex gap-2 items-end">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Ketik pesan..."
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm resize-none outline-none min-h-[36px] max-h-24"
            />
            {/* Tombol Tawar (hanya pembeli) */}
            {!isSeller && product.status === 'available' && (
              <button
                onClick={() => setShowOfferModal(true)}
                className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl text-xs font-medium transition-all whitespace-nowrap border border-yellow-500/30"
              >
                💰 Tawar
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={isSending || !inputText.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
            >
              Kirim
            </button>
          </div>
        </div>
      )}

      {/* Modal Penawaran Harga */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold text-lg">💰 Ajukan Penawaran</h3>
            {product.price && (
              <p className="text-slate-400 text-sm">Harga asli: <span className="text-white font-medium">{formatPrice(product.price)}</span></p>
            )}
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Harga Tawar (Rp)</label>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Contoh: 150000"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Catatan (opsional)</label>
              <textarea
                value={offerNote}
                onChange={(e) => setOfferNote(e.target.value)}
                placeholder="Alasan penawaran..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSendOffer}
                disabled={!offerPrice || isSubmitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Kirim Tawaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Komponen Bubble Pesan ────────────────────────────────────────────────────
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
        <span className="text-slate-500 text-xs bg-white/5 px-3 py-1 rounded-full">{message.content}</span>
      </div>
    )
  }

  if (message.message_type === 'offer' || message.message_type === 'offer_accept' || message.message_type === 'offer_reject') {
    const payload = message.payload as OfferPayload & OfferAcceptPayload & { counter_offer?: number; reason?: string }
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs rounded-2xl p-4 border space-y-2 ${
          message.message_type === 'offer'        ? 'bg-yellow-500/10 border-yellow-500/30'
          : message.message_type === 'offer_accept' ? 'bg-green-500/10 border-green-500/30'
          : 'bg-red-500/10 border-red-500/30'
        }`}>
          <p className="text-xs font-semibold text-slate-400">
            {message.message_type === 'offer'         ? '💰 Penawaran Harga'
             : message.message_type === 'offer_accept' ? '✅ Tawaran Diterima'
             : '❌ Tawaran Ditolak'}
          </p>
          {payload.offered_price  && <p className="text-white font-bold">{formatPrice(payload.offered_price)}</p>}
          {payload.agreed_price   && <p className="text-white font-bold">{formatPrice(payload.agreed_price)}</p>}
          {payload.counter_offer  && <p className="text-slate-300 text-sm">Counter: {formatPrice(payload.counter_offer)}</p>}
          {payload.meet_point && (
            <p className="text-slate-300 text-xs">📍 {payload.meet_point} · {payload.meet_time}</p>
          )}
          {(payload.note || payload.reason) && (
            <p className="text-slate-400 text-xs italic">"{payload.note ?? payload.reason}"</p>
          )}

          {/* Tombol terima/tolak untuk penjual */}
          {message.message_type === 'offer' && isSeller && !isOwn && (
            <div className="flex gap-2 pt-1">
              <button
                disabled={isActing}
                onClick={async () => {
                  setIsActing(true)
                  await acceptOfferAction(chatId, {
                    agreed_price: payload.offered_price,
                    meet_point:   'Kantin Teknik PENS',
                    meet_time:    'Atur lewat chat',
                  })
                  setIsActing(false)
                }}
                className="flex-1 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-40"
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
                className="flex-1 py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-400 rounded-lg text-xs font-medium transition-all disabled:opacity-40 border border-red-600/30"
              >
                Tolak
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Pesan teks biasa
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
          {message.sender.avatar_url
            ? <img src={message.sender.avatar_url} alt="" className="w-full h-full object-cover" />
            : getInitials(message.sender.full_name)
          }
        </div>
      )}
      <div className={`max-w-xs px-4 py-2.5 rounded-2xl ${
        isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white/10 text-slate-200 rounded-bl-sm'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-500'}`}>
          {formatRelativeTime(message.created_at)}
          {isOwn && <span className="ml-1">{message.is_read ? ' ✓✓' : ' ✓'}</span>}
        </p>
      </div>
    </div>
  )
}
