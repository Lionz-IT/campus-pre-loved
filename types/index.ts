




import { profiles, products, chats, messages, wishlists, reviews } from "@/lib/db/schema"
import { InferSelectModel, InferInsertModel } from "drizzle-orm"

export type Profile = InferSelectModel<typeof profiles>
export type Product = InferSelectModel<typeof products>
export type Chat    = InferSelectModel<typeof chats>
export type Message = InferSelectModel<typeof messages>

export type ProductInsert = InferInsertModel<typeof products>
export type ProductUpdate = Partial<InferInsertModel<typeof products>>
export type MessageInsert = InferInsertModel<typeof messages>

export type ProductStatus   = "available" | "sold"
export type ProductCategory = "microcontroller" | "electronic_component" | "module" | "tool" | "book_module" | "laptop_accessory" | "clothing" | "stationery" | "other"
export type MessageType     = "text" | "offer" | "offer_accept" | "offer_reject" | "system"

export type ProductWithSeller = Product & {
  seller: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'rating' | 'whatsapp_number'>
}

export type MessageWithSender = Message & {
  sender: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type ChatWithDetails = Chat & {
  product: Pick<Product, 'id' | 'title' | 'image_urls' | 'status'>
  buyer:   Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  seller:  Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  last_message?: Pick<Message, 'content' | 'message_type' | 'created_at' | 'is_read'>
}

export interface OfferPayload {
  offered_price:  number
  original_price?: number
  note?:          string
}

export interface OfferAcceptPayload {
  agreed_price: number
  meet_point:   string
  meet_time:    string
}

export interface OfferRejectPayload {
  counter_offer?: number
  reason?:        string
}

export interface SystemMessagePayload {
  event: 'status_changed' | 'sale_reverted' | 'item_sold'
  from?: ProductStatus
  to?:   ProductStatus
}

export type MessagePayload =
  | OfferPayload
  | OfferAcceptPayload
  | OfferRejectPayload
  | SystemMessagePayload

export type ActionResult<T = void> =
  | { success: true; data?: T; error?: never; fieldErrors?: never }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// ── Wishlists ──────────────────────────────────────────────

export interface Wishlist {
  id:         string
  user_id:    string
  product_id: string
  created_at: Date
}

export type WishlistProduct = Product & {
  seller: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

// ── Reviews ────────────────────────────────────────────────

export interface Review {
  id:          string
  product_id:  string
  seller_id:   string
  reviewer_id: string
  rating:      number
  comment:     string | null
  created_at:  Date
  updated_at:  Date
}

export type ReviewWithReviewer = Review & {
  reviewer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type ReviewWithProduct = Review & {
  product:  Pick<Product, 'id' | 'title' | 'image_urls'>
  reviewer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}
