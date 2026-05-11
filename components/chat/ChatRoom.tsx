'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useChat } from '@/hooks/useChat'
import { sendOfferAction, acceptOfferAction, rejectOfferAction } from '@/actions/chat.actions'
import { formatPrice } from '@/lib/utils'
import type { MessageWithSender, Product, OfferPayload, OfferAcceptPayload, OfferRejectPayload } from '@/types'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { InputField, TextareaField } from '@/components/ui/Input'

interface ChatRoomProps {
  chatId:          string
  initialMessages: MessageWithSender[]
  currentUserId:   string
  isSeller:        boolean
  product:         any // Product with image_urls
  otherPerson:     any // Profile of the opponent
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
    <div className="flex flex-col flex-1 h-full w-full bg-[#FCFCFD] relative isolate">
      {/* 2. Top Header Ruang Obrolan */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 z-20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] relative">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-5xl mx-auto">
          {/* Profile Name & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden relative border border-gray-200 bg-gray-100 flex-shrink-0">
              {otherPerson?.avatar_url ? (
                <Image src={otherPerson.avatar_url} alt={otherPerson.full_name} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                  {otherPerson?.full_name?.charAt(0) || '?'}
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-gray-900 font-bold text-base leading-none">{otherPerson?.full_name || 'Pengguna'}</h3>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full border border-purple-100">
                  Verified Student
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">Online baru saja</p>
            </div>
          </div>

          {/* Product Card di Header */}
          <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100 md:max-w-md w-full">
            <div className="w-12 h-12 rounded-lg bg-white overflow-hidden relative border border-gray-200 flex-shrink-0">
              {product.image_urls?.[0] ? (
                 <Image src={product.image_urls[0]} alt={product.title} fill className="object-cover" sizes="48px" />
              ) : (
                 <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                   <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-gray-900 font-medium text-[13px] truncate">{product.title}</h4>
              <p className="text-purple-700 font-bold text-sm">{formatPrice(product.price)}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <Button 
                variant="outline" 
                className="text-purple-700 border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-[11px] h-8 px-2 md:px-3 bg-white transition-all shadow-sm"
                onClick={() => toast('Fitur Atur Janji COD belum tersedia')}
              >
                Janji COD
              </Button>
              {!isSeller && product.status === 'available' && (
                <Button 
                  variant="accent" 
                  className="bg-amber-400 hover:bg-amber-500 text-white border-none text-[11px] font-bold h-8 px-2 md:px-3 shadow-sm shadow-amber-400/20"
                  onClick={() => setShowOfferModal(true)}
                >
                  Kirim Penawaran
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Ruang Obrolan (Bubble Messages) */}
      <div className="flex-1 overflow-y-auto w-full p-4 lg:p-6 pb-4 space-y-5">
        <div className="flex justify-center mb-6">
           <span className="bg-white border border-gray-200 shadow-sm text-gray-500 text-[11px] px-4 py-1.5 rounded-full font-medium tracking-wide">
             Hari Ini
           </span>
        </div>

        {messages.map((msg, index) => {
           // Basic grouping check
           const prevMsg = index > 0 ? messages[index - 1] : null;
           const showAvatar = msg.sender_id !== currentUserId && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
           
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
        <div ref={bottomRef} className="h-2" />
      </div>

      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-100 text-red-600 rounded-lg shadow-sm text-xs font-medium z-10 border border-red-200">
          {error}
        </div>
      )}

      {/* 3. Input Form Bawah */}
      {product.status !== 'sold' ? (
        <div className="flex-shrink-0 p-3 lg:p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.03)] z-20">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            {/* Attachment Icon */}
            <button className="h-[46px] w-[46px] flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors flex-shrink-0 rounded-full" title="Lampirkan File">
              <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            {/* Input Text */}
            <div className="flex-1 bg-[#F3F4F6] rounded-3xl border border-transparent flex items-center px-4 overflow-hidden focus-within:ring-2 focus-within:ring-purple-100 focus-within:border-purple-300 focus-within:bg-white transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSend() 
                  } 
                }}
                placeholder="Ketik pesan..."
                rows={1}
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 border-none outline-none py-3 text-[14.5px] resize-none max-h-24 min-h-[46px] leading-[22px]"
                style={{ scrollbarWidth: 'none' }}
              />
            </div>
            
            {/* Send Button */}
            <button 
              onClick={handleSend}
              disabled={isSending || !inputText.trim()}
              className="w-[46px] h-[46px] bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-full flex items-center justify-center transition-all shadow-md shadow-purple-600/20 flex-shrink-0 group"
            >
              <svg className="w-5 h-5 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.03)] z-20">
          <p className="text-gray-500 text-sm font-medium">Barang sudah terjual, obrolan dibekukan.</p>
        </div>
      )}

      {/* Offer Modal */}
      <Modal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        title="Ajukan Penawaran Harga"
      >
        <div className="mb-4 space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
            <span className="text-sm text-gray-500 font-medium">Harga Barang:</span>
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
          </div>
          <InputField
            type="number"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            label="Harga Tawar Anda (Rp)"
            placeholder="Contoh: 150000"
          />
          <TextareaField
            value={offerNote}
            onChange={(e) => setOfferNote(e.target.value)}
            label="Catatan Pembeli (Opsional)"
            placeholder="Berikan alasan seperti: 'Bisa ambil nanti sore di perpus?'"
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
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold h-12 border-none"
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
  otherPerson: any
  showAvatar:  boolean
}) {
  const [isActing, setIsActing] = useState(false)
  const timeStr = new Date(message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  if (message.message_type === 'system') {
    return (
      <div className="text-center my-4">
        <span className="text-gray-500 text-xs font-medium bg-gray-100/80 border border-gray-200 px-4 py-1.5 rounded-full inline-block shadow-sm">
          {message.content}
        </span>
      </div>
    )
  }

  // Handle Offer specific messages
  if (['offer', 'offer_accept', 'offer_reject'].includes(message.message_type)) {
    const payload = message.payload as Partial<OfferPayload & OfferAcceptPayload & OfferRejectPayload> | null
    const hasPayload = Boolean(payload)
    
    return (
      <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {!isOwn && (
          <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-3 self-end mb-1 border border-gray-200 bg-white ${!showAvatar && 'opacity-0'}`}>
            <Image src={otherPerson?.avatar_url || 'https://api.dicebear.com/7.x/mp/svg'} alt="Avatar" width={32} height={32} />
          </div>
        )}
        <div className={`relative max-w-[85%] md:max-w-md rounded-[20px] p-5 border shadow-sm ${
          message.message_type === 'offer'          ? 'bg-gradient-to-b from-amber-50 to-white border-amber-200/60'
          : message.message_type === 'offer_accept' ? 'bg-gradient-to-b from-green-50 to-white border-green-200/60'
          : 'bg-gradient-to-b from-red-50 to-white border-red-200/60'
        } ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
          <div className="flex items-center gap-2 mb-3 text-sm">
             <div className={`p-1.5 rounded-full ${message.message_type === 'offer' ? 'bg-amber-100 text-amber-600' : message.message_type === 'offer_accept' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {message.message_type === 'offer' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : message.message_type === 'offer_accept' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
             </div>
             <p className="font-bold text-gray-700">
               {message.message_type === 'offer' ? 'Penawaran Harga' : message.message_type === 'offer_accept' ? 'Tawaran Diterima' : 'Tawaran Ditolak'}
             </p>
          </div>
          
          <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3 shadow-sm shadow-gray-100/50">
            {payload?.offered_price != null && <p className="text-xl text-gray-900 font-extrabold tracking-tight">{formatPrice(payload.offered_price)}</p>}
            {payload?.agreed_price  != null && <p className="text-xl text-gray-900 font-extrabold tracking-tight">{formatPrice(payload.agreed_price)}</p>}
            {payload?.counter_offer != null && <p className="text-gray-500 text-xs font-semibold mt-1">Balasan: {formatPrice(payload.counter_offer)}</p>}
          </div>

          {payload?.meet_point && (
            <div className="flex items-center gap-2 text-gray-600 text-xs font-medium bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 mb-3">
               <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               <span className="truncate">{payload.meet_point} • {payload.meet_time}</span>
            </div>
          )}
          
          {(payload?.note || payload?.reason) && (
            <p className="text-gray-600 text-[13.5px] mt-2 bg-white px-3.5 py-2.5 rounded-xl border border-gray-100 leading-relaxed shadow-sm">
              "{payload?.note ?? payload?.reason}"
            </p>
          )}

          {!hasPayload ? (
            <p className="text-gray-400 text-xs">Data penawaran tidak tersedia.</p>
          ) : message.message_type === 'offer' && isSeller && !isOwn ? (
            <div className="flex gap-2 pt-3 mt-2 border-t border-gray-100">
              <button
                disabled={isActing || payload?.offered_price == null}
                onClick={async () => {
                  setIsActing(true)
                  const res = await rejectOfferAction(chatId, { reason: 'Maaf, harga belum pas.' })
                  if (res?.success) toast.success('Tawaran ditolak')
                  else toast.error('Gagal menolak')
                  setIsActing(false)
                }}
                className="flex-1 h-10 text-red-600 bg-white border border-red-200 hover:bg-red-50 text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Tolak
              </button>
              <button
                disabled={isActing || payload?.offered_price == null}
                onClick={async () => {
                  setIsActing(true)
                  const res = await acceptOfferAction(chatId, { agreed_price: payload!.offered_price! })
                  if (res?.success) toast.success('Tawaran diterima!')
                  else toast.error('Gagal menerima tawaran')
                  setIsActing(false)
                }}
                className="flex-1 h-10 text-white bg-green-500 hover:bg-green-600 border border-transparent text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-green-500/20"
              >
                Terima
              </button>
            </div>
          ) : null}

          <div className="text-right mt-2 inline-block w-full">
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">{timeStr}</span>
          </div>
        </div>
      </div>
    )
  }

  // Regular Text Message Bubble
  return (
    <div className={`flex w-full group ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-3 self-end mb-0.5 border border-gray-200 bg-white shadow-sm ${!showAvatar && 'opacity-0 invisible'}`}>
          <Image src={otherPerson?.avatar_url || 'https://api.dicebear.com/7.x/mp/svg'} alt="Avatar" width={32} height={32} className="object-cover" />
        </div>
      )}
      
      <div className={`relative max-w-[75%] md:max-w-md px-4 pt-3 pb-2 rounded-[20px] shadow-sm ${
        isOwn 
          ? 'bg-[#6938EF] text-white rounded-br-sm' 
          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]'
      }`}>
         <p className="text-[14.5px] leading-[1.45] break-words whitespace-pre-wrap">{message.content}</p>
         <div className={`text-[10px] mt-1.5 text-right font-medium flex items-center justify-end gap-1 ${isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
            <span className="tracking-wide">{timeStr}</span>
            {isOwn && (
              <svg className="w-3.5 h-3.5 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            )}
         </div>
      </div>
    </div>
  )
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
