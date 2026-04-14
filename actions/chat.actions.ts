'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { offerSchema, offerAcceptSchema, offerRejectSchema } from '@/lib/validations/product.schema'
import type { ActionResult, ChatWithDetails, MessageWithSender } from '@/types'
import { ROUTES } from '@/lib/constants/routes'
import { revalidatePath } from 'next/cache'


export async function createChatRoomAction(
  productId: string,
  sellerId:  string,
): Promise<ActionResult<{ chatId: string }>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Kamu harus login terlebih dahulu' }
  if (user.id === sellerId) return { success: false, error: 'Kamu tidak bisa chat dengan dirimu sendiri' }


  const { data, error } = await supabase
    .from('chats')
    .upsert(
      { product_id: productId, buyer_id: user.id, seller_id: sellerId },
      { onConflict: 'product_id,buyer_id', ignoreDuplicates: false },
    )
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: { chatId: data.id } }
}


export async function getMyChatsAction(): Promise<ActionResult<ChatWithDetails[]>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      product:products!chats_product_id_fkey ( id, title, image_urls, status ),
      buyer:profiles!chats_buyer_id_fkey     ( id, full_name, avatar_url ),
      seller:profiles!chats_seller_id_fkey   ( id, full_name, avatar_url )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as ChatWithDetails[] }
}


export async function getChatMessagesAction(
  chatId: string,
): Promise<ActionResult<MessageWithSender[]>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey ( id, full_name, avatar_url )
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as MessageWithSender[] }
}


export async function sendMessageAction(
  chatId:  string,
  content: string,
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'text',
    content:      content.trim(),
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}


export async function sendOfferAction(
  chatId:  string,
  payload: { offered_price: number; original_price?: number; note?: string },
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = offerSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.offered_price?.[0] ?? 'Data penawaran tidak valid' }
  }

  const { error } = await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'offer',
    payload:      parsed.data,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}


export async function acceptOfferAction(
  chatId:  string,
  payload: { agreed_price: number; meet_point: string; meet_time: string },
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = offerAcceptSchema.safeParse(payload)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { success: false, error: firstError ?? 'Data tidak valid' }
  }

  const { error } = await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'offer_accept',
    payload:      parsed.data,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}


export async function rejectOfferAction(
  chatId:  string,
  payload: { counter_offer?: number; reason?: string },
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = offerRejectSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  const { error } = await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'offer_reject',
    payload:      parsed.data,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}


export async function markMessagesReadAction(chatId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('chat_id', chatId)
    .eq('is_read', false)
    .neq('sender_id', user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath(ROUTES.CHAT_ROOM(chatId))
  return { success: true }
}
