'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { chats, messages, products, profiles } from '@/lib/db/schema'
import { eq, and, desc, or, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/lib/constants/routes'
import type { ActionResult } from '@/types'
import { offerSchema, offerAcceptSchema, offerRejectSchema } from '@/lib/validations/product.schema'


export async function createChatRoomAction(
  productId: string,
  sellerId:  string,
): Promise<ActionResult<{ chatId: string }>> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Kamu harus login terlebih dahulu' }
  if (user.id === sellerId) return { success: false, error: 'Kamu tidak bisa chat dengan dirimu sendiri' }

  const newChat = await db.insert(chats)
    .values({ product_id: productId, buyer_id: user.id as string, seller_id: sellerId })
    .onConflictDoUpdate({
      target: [chats.product_id, chats.buyer_id],
      set: { product_id: productId }
    })
    .returning({ id: chats.id })

  if (!newChat[0]) return { success: false, error: 'Gagal membuat atau mendapatkan chat' }
  return { success: true, data: { chatId: newChat[0].id } }
}

export async function getMyChatsAction() {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false as const, error: 'Unauthorized' }

  const data = await db.query.chats.findMany({
    where: or(eq(chats.buyer_id, user.id as string), eq(chats.seller_id, user.id as string)),
    orderBy: desc(chats.last_message_at),
    with: {
        product: { columns: { id: true, title: true, image_urls: true, status: true } },
        buyer: { columns: { id: true, full_name: true, avatar_url: true } },
        seller: { columns: { id: true, full_name: true, avatar_url: true } }
    }
  })

  return { success: true as const, data: data ?? [] }
}

export async function getChatMessagesAction(chatId: string) {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false as const, error: 'Unauthorized' }

  const data = await db.query.messages.findMany({
    where: eq(messages.chat_id, chatId),
    orderBy: desc(messages.created_at),
    with: {
      sender: { columns: { id: true, full_name: true, avatar_url: true } }
    }
  })

  return { success: true as const, data: data ?? [] }
}

export async function sendMessageAction(chatId: string, content: string) {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false as const, error: 'Unauthorized' }

  const newMessage = await db.insert(messages).values({
    chat_id:      chatId,
    sender_id:    user.id as string,
    message_type: 'text',
    content:      content.trim(),
  }).returning()

  await db.update(chats)
    .set({ last_message_at: new Date() })
    .where(eq(chats.id, chatId))
  
  revalidatePath(ROUTES.CHAT_ROOM(chatId))
  return { success: true as const, data: newMessage[0] }
}

export async function sendOfferAction(
  chatId:  string,
  payload: { offered_price: number; original_price?: number; note?: string },
): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = offerSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.offered_price?.[0] ?? 'Data penawaran tidak valid' }
  }

  await db.insert(messages).values({
    chat_id:      chatId,
    sender_id:    user.id as string,
    message_type: 'offer',
    payload:      parsed.data,
  })

  return { success: true }
}

export async function acceptOfferAction(
  chatId:  string,
  payload: { agreed_price: number; meet_point: string; meet_time: string },
): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = offerAcceptSchema.safeParse(payload)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { success: false, error: firstError ?? 'Data tidak valid' }
  }

  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
    columns: { product_id: true, seller_id: true }
  })

  if (!chat) return { success: false, error: 'Chat tidak ditemukan' }
  if (user.id !== chat.seller_id) return { success: false, error: 'Hanya penjual yang dapat menerima tawaran' }

  await db.update(products)
    .set({ status: 'sold' })
    .where(eq(products.id, chat.product_id))

  await db.insert(messages).values({
    chat_id:      chatId,
    sender_id:    user.id as string,
    message_type: 'offer_accept',
    payload:      parsed.data,
  })
  
  revalidatePath(ROUTES.CHAT_ROOM(chatId))
  revalidatePath('/chats')
  return { success: true }
}

export async function rejectOfferAction(
  chatId:  string,
  payload: { counter_offer?: number; reason?: string },
): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = offerRejectSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  await db.insert(messages).values({
    chat_id:      chatId,
    sender_id:    user.id as string,
    message_type: 'offer_reject',
    payload:      parsed.data,
  })

  return { success: true }
}

export async function markMessagesReadAction(chatId: string): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Unauthorized' }

  await db.update(messages)
    .set({ is_read: true })
    .where(and(eq(messages.chat_id, chatId), eq(messages.is_read, false), eq(messages.sender_id, user.id as string)))

  revalidatePath(ROUTES.CHAT_ROOM(chatId))
  return { success: true }
}

export async function getUnreadCountAction(): Promise<ActionResult<number>> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: true, data: 0 }

  const userChats = await db.select({ id: chats.id }).from(chats).where(or(eq(chats.buyer_id, user.id as string), eq(chats.seller_id, user.id as string)))
  if (userChats.length === 0) return { success: true, data: 0 }

  const chatIds = userChats.map((c) => c.id)
  
  const unreadMessages = await db.select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(
        inArray(messages.chat_id, chatIds),
        eq(messages.is_read, false),
        eq(messages.sender_id, user.id as string)
    ))

  return { success: true, data: Number(unreadMessages[0].count) ?? 0 }
}
