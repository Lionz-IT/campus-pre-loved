'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useChat } from '@/hooks/useChat'
import { sendOfferAction } from '@/features/chats/actions'
import { formatPrice, getInitials } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { MessageWithSender, Product } from '@/types'

import MessageBubble from './MessageBubble'
import OfferModal from './OfferModal'

interface ChatRoomProps {
  chatId:          string
  initialMessages: MessageWithSender[]
  currentUserId:   string
  isSeller:        boolean
  product:         Pick<Product, 'id' | 'title' | 'price' | 'status' | 'image_urls'>
  otherPerson:     { id: string, full_name: string, avatar_url: string | null }
}

export default function ChatRoom({ chatId, initialMessages, currentUserId, isSeller, product, otherPerson }: ChatRoomProps) {
  const { messages, sendMessage, isSending, error, bottomRef } = useChat(chatId, initialMessages, currentUserId)
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Hanya diperbolehkan mengupload file gambar!')
      return
    }

    const toastId = toast.loading('Mengunggah gambar...')
    try {
      const supabase = createSupabaseBrowserClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${currentUserId}/${fileName}`

      const { error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        toast.error(`Gagal mengunggah: ${error.message}`, { id: toastId })
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      await sendMessage(publicUrl)
      toast.success('Gambar berhasil dikirim!', { id: toastId })
    } catch (err: any) {
      toast.error(`Terjadi kesalahan: ${err?.message || err}`, { id: toastId })
    } finally {
      e.target.value = ''
    }
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
        
        {messages.map((msg, index) => {
           let showAvatar = true;
           
           if (index > 0 && msg.sender_id !== currentUserId) {
             const prevMsg = messages[index - 1];
             const isSameSender = prevMsg.sender_id === msg.sender_id;
             const timeDiffMs = new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime();
             const isWithin5Mins = timeDiffMs < 5 * 60 * 1000;
             
             const isPrevNormal = prevMsg.message_type === 'text';
             const isCurrentNormal = msg.message_type === 'text';

             if (isSameSender && isWithin5Mins && isPrevNormal && isCurrentNormal) {
               showAvatar = false;
             }
           }
           
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
          <input 
            type="file" 
            id="chat-file-input" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          <div className="flex gap-2 items-end bg-purple-50/10 rounded-2xl border-2 border-purple-400 p-1 shadow-sm transition-all focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100">
            <button 
              onClick={() => document.getElementById('chat-file-input')?.click()}
              className="p-3 text-purple-500 hover:text-purple-600 transition-colors rounded-xl hover:bg-purple-50 flex-shrink-0"
            >
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
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm resize-none outline-none focus:outline-none border-none focus:border-none focus:ring-0 py-3 min-h-[44px] max-h-32"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !inputText.trim()}
              className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl transition-all shadow-sm flex-shrink-0 mb-0.5 mr-0.5"
            >
              {isSending ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
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
      <OfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        productPrice={product.price ?? 0}
        offerPrice={offerPrice}
        setOfferPrice={setOfferPrice}
        offerNote={offerNote}
        setOfferNote={setOfferNote}
        isSubmitting={isSubmitting}
        onSubmit={handleSendOffer}
      />
    </div>
  )
}

