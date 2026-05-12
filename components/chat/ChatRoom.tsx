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
  product:         Pick<Product, 'id' | 'title' | 'price' | 'status' | 'image_urls'>
  otherPerson:     { id: string, full_name: string, avatar_url: string | null }
}

export default function ChatRoom({ chatId, initialMessages, currentUserId, isSeller, product, otherPerson }: ChatRoomProps) {
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
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col border-b border-gray-100">
        <div className="flex items-center gap-3 p-4 bg-purple-50/30">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex-shrink-0">
             {otherPerson.avatar_url ? (
               <Image src={otherPerson.avatar_url} alt={otherPerson.full_name} fill sizes="40px" className="object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-purple-700 font-bold text-sm">
                 {getInitials(otherPerson.full_name)}
               </div>
             )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              {otherPerson.full_name}
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                Verified Student
              </span>
            </h2>
          </div>
        </div>

        {/* Product Info Bar */}
        <div className="px-4 py-3 bg-white flex items-center justify-between border-t border-gray-50 flex-wrap gap-y-3">
           <div className="flex items-center gap-3 min-w-0 flex-1">
             <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
              {product.image_urls?.[0] ? (
                 <Image src={product.image_urls[0]} alt={product.title} fill sizes="48px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
             </div>
             <div className="min-w-0 pr-2">
               <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
               <p className="text-sm font-bold text-purple-700">{formatPrice(product.price ?? 0)}</p>
             </div>
           </div>
           
           <div className="flex-shrink-0">
             {!isSeller && product.status === 'available' && (
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-amber-500/20 whitespace-nowrap"
                >
                  Kirim Penawaran
                </button>
             )}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
        <div className="text-center pb-2">
           <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">Hari Ini</span>
        </div>
        
        {messages.map((msg) => {
           let showAvatar = true;
           // TODO: Add grouping logic if needed
           
           return (
             <MessageBubble 
               key={msg.id} 
               message={msg} 
               isOwn={msg.sender_id === currentUserId} 
               isSeller={isSeller} 
               chatId={chatId} 
               otherPerson={otherPerson}
               showAvatar={showAvatar}
             />
           )
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-red-500 text-xs text-center px-4 py-1 bg-red-50">{error}</p>
      )}

      {/* Input Area */}
      {product.status !== 'sold' ? (
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2 items-end bg-gray-50 rounded-2xl border border-gray-200 p-1 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
            <button className="p-3 text-gray-400 hover:text-purple-600 transition-colors rounded-xl hover:bg-purple-50 flex-shrink-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
               </svg>
            </button>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Ketik pesan..."
              rows={1}
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm resize-none outline-none py-3 min-h-[44px] max-h-32"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !inputText.trim()}
              className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl transition-all shadow-sm flex-shrink-0 mb-0.5 mr-0.5"
            >
              {isSending ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 <svg className="w-5 h-5 translate-x-px -translate-y-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                 </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
         <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 font-medium">Obrolan ditutup karena barang sudah terjual.</p>
         </div>
      )}

      {/* Offer Modal */}
      <Modal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        title="Ajukan Penawaran Baru"
      >
        <div className="space-y-4 pt-2">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
             <p className="text-gray-500 text-sm mb-1">Harga saat ini</p>
             <p className="text-gray-900 font-bold text-xl">{formatPrice(product.price ?? 0)}</p>
          </div>
          <InputField
            type="number"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            label="Harga Penawaran Anda (Rp)"
            placeholder="Contoh: 150000"
          />
          <TextareaField
            value={offerNote}
            onChange={(e) => setOfferNote(e.target.value)}
            label="Pesan Tambahan (opsional)"
            placeholder="Ketik alasan penawaran atau lokasi COD yang diinginkan..."
            rows={3}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => setShowOfferModal(false)}
            variant="secondary"
            fullWidth
            size="lg"
            className="font-semibold h-12"
          >
            Batal
          </Button>
          <Button
            onClick={handleSendOffer}
            disabled={!offerPrice || isSubmitting}
            variant="accent"
            fullWidth
            size="lg"
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold h-12 border-none shadow-sm shadow-amber-400/30"
            loading={isSubmitting}
          >
            Kirim Tawaran
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function MessageBubble({ message, isOwn, isSeller, chatId, otherPerson, showAvatar }: {
  message:     MessageWithSender
  isOwn:       boolean
  isSeller:    boolean
  chatId:      string
  otherPerson: { id: string, full_name: string, avatar_url: string | null }
  showAvatar:  boolean
}) {
  const [isActing, setIsActing] = useState(false)
  const timeStr = new Date(message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  if (message.message_type === 'system') {
    return (
      <div className="text-center my-4">
        <span className="text-gray-400 text-xs bg-gray-100/80 border border-gray-200 px-4 py-1.5 rounded-full shadow-sm">{message.content}</span>
      </div>
    )
  }

  // --- BUBBLE PENAWARAN ---
  if (message.message_type === 'offer' || message.message_type === 'offer_accept' || message.message_type === 'offer_reject') {
    const payload = message.payload as Partial<OfferPayload & OfferAcceptPayload & OfferRejectPayload> | null
    const hasPayload = Boolean(payload)
    
    return (
      <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} my-2`}>
        <div className={`w-64 sm:w-72 rounded-2xl p-4 shadow-sm border ${
          message.message_type === 'offer'          ? 'bg-amber-50/80 border-amber-200/60'
          : message.message_type === 'offer_accept' ? 'bg-emerald-50/80 border-emerald-200/60'
          : 'bg-red-50/80 border-red-200/60'
        }`}>
          
          <div className="flex items-center gap-2 mb-2">
             <div className={`p-1.5 rounded-lg ${
                message.message_type === 'offer' ? 'bg-amber-100 text-amber-600' :
                message.message_type === 'offer_accept' ? 'bg-emerald-100 text-emerald-600' :
                'bg-red-100 text-red-600'
             }`}>
                {message.message_type === 'offer' ? (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : message.message_type === 'offer_accept' ? (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
             </div>
             <p className={`text-xs font-bold ${
               message.message_type === 'offer' ? 'text-amber-700' :
               message.message_type === 'offer_accept' ? 'text-emerald-700' :
               'text-red-700'
             }`}>
               {message.message_type === 'offer'         ? 'Penawaran Harga Diajukan'
                : message.message_type === 'offer_accept' ? 'Tawaran Diterima!'
                : 'Tawaran Ditolak'}
             </p>
          </div>

          <div className="bg-white/60 p-3 rounded-xl border border-white/40 mb-3">
             {payload?.offered_price != null && <p className="text-gray-900 font-extrabold text-lg">{formatPrice(payload.offered_price)}</p>}
             {payload?.agreed_price  != null && <p className="text-gray-900 font-extrabold text-lg">{formatPrice(payload.agreed_price)}</p>}
             {payload?.counter_offer != null && <p className="text-gray-600 text-sm mt-1">Counter: <span className="font-semibold text-gray-900">{formatPrice(payload.counter_offer)}</span></p>}
             
             {payload?.meet_point && (
               <div className="mt-2 flex items-start gap-1.5 text-gray-500 text-xs">
                 <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 <p>{payload.meet_point} <br/> {payload.meet_time}</p>
               </div>
             )}
          </div>
          
          {(payload?.note || payload?.reason) && (
            <div className="px-1 mb-3">
               <p className="text-gray-600 text-sm">"{payload?.note ?? payload?.reason}"</p>
            </div>
          )}

          {!hasPayload ? (
            <p className="text-gray-500 text-xs px-1">Data penawaran tidak tersedia.</p>
          ) : message.message_type === 'offer' && isSeller && !isOwn ? (
            <div className="flex gap-2 pt-2 border-t border-amber-200/40">
              <button
                disabled={isActing || payload?.offered_price == null}
                onClick={async () => {
                  setIsActing(true)
                  await acceptOfferAction(chatId, {
                    agreed_price: payload?.offered_price ?? 0,
                    meet_point:   'Kantin Teknik PENS (Contoh)',
                    meet_time:    'Atur lebih lanjut lewat chat',
                  })
                  setIsActing(false)
                }}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-500/20 disabled:opacity-40"
              >
                Terima Tawaran
              </button>
              <button
                disabled={isActing}
                onClick={async () => {
                  setIsActing(true)
                  await rejectOfferAction(chatId, { reason: 'Maaf, harga belum masuk.' })
                  setIsActing(false)
                }}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              >
                Tolak
              </button>
            </div>
          ) : null}
          
          <div className="text-right mt-1">
             <span className={`text-[10px] font-medium ${
                message.message_type === 'offer' ? 'text-amber-500/70' :
                message.message_type === 'offer_accept' ? 'text-emerald-500/70' :
                'text-red-500/70'
             }`}>{timeStr}</span>
          </div>
        </div>
      </div>
    )
  }

  // --- NORMAL BUBBLE ---
  return (
    <div className={`flex items-end gap-2 w-full ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}>
      
      {!isOwn && (
        <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden shadow-sm border border-gray-100 ${showAvatar ? 'bg-purple-100 text-purple-600' : 'bg-transparent border-transparent'}`}>
          {showAvatar && (
            otherPerson.avatar_url
              ? <Image src={otherPerson.avatar_url} alt="" fill sizes="32px" className="object-cover" />
              : getInitials(otherPerson.full_name)
          )}
        </div>
      )}
      
      <div className={`relative max-w-[75%] px-4 py-3 shadow-sm ${
        isOwn 
          ? 'bg-purple-700 text-white rounded-2xl rounded-br-sm' 
          : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
           {message.content}
        </p>
        
        <div className={`flex items-center justify-end gap-1 mt-1.5 -mb-1 ${isOwn ? 'text-purple-300' : 'text-gray-400'}`}>
           <span className="text-[10px] font-medium leading-none">
             {timeStr}
           </span>
           
           {isOwn && (
             <span className="inline-flex align-middle leading-none">
               {message.is_read ? (
                 <svg className="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5M10.5 12.75l3 3" />
                 </svg>
               ) : (
                 <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                 </svg>
               )}
             </span>
           )}
        </div>
      </div>
      
    </div>
  )
}
