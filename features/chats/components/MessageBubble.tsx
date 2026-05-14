import { useState } from 'react'
import Image from 'next/image'
import { formatPrice, getInitials } from '@/lib/utils'
import type { MessageWithSender, OfferPayload, OfferAcceptPayload, OfferRejectPayload } from '@/types'
import { acceptOfferAction, rejectOfferAction } from '@/features/chats/actions'

interface MessageBubbleProps {
  message:     MessageWithSender
  isOwn:       boolean
  isSeller:    boolean
  chatId:      string
  otherPerson: { id: string, full_name: string, avatar_url: string | null }
  showAvatar:  boolean
}

export default function MessageBubble({ message, isOwn, isSeller, chatId, otherPerson, showAvatar }: MessageBubbleProps) {
  const [isActing, setIsActing] = useState(false)
  const timeStr = new Date(message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  if (message.message_type === 'system') {
    return (
      <div className="text-center my-4">
        <span className="text-gray-400 text-xs bg-gray-100/80 border border-gray-200 px-4 py-1.5 rounded-full shadow-sm">{message.content}</span>
      </div>
    )
  }

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