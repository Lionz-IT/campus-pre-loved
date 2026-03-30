// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts
// Custom App-level Types (di luar auto-generated database.types.ts)
// ─────────────────────────────────────────────────────────────────────────────

import type { Database } from './database.types'

// ─── Row shortcuts ────────────────────────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Chat    = Database['public']['Tables']['chats']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

// ─── Insert/Update types ──────────────────────────────────────────────────────
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

// ─── Enums (mirroring DB enums) ───────────────────────────────────────────────
export type ProductStatus   = Database['public']['Enums']['product_status']
export type ProductCategory = Database['public']['Enums']['product_category']
export type MessageType     = Database['public']['Enums']['message_type']
export type ListingType     = Database['public']['Enums']['listing_type']

// ─── Enriched types (hasil JOIN query) ───────────────────────────────────────

/** Produk dengan data penjual (untuk feed marketplace) */
export type ProductWithSeller = Product & {
  seller: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'rating' | 'whatsapp_number'>
}

/** Pesan dengan data pengirim (untuk chat room) */
export type MessageWithSender = Message & {
  sender: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

/** Chat room dengan data produk + kedua partisipan */
export type ChatWithDetails = Chat & {
  product: Pick<Product, 'id' | 'title' | 'image_urls' | 'status'>
  buyer:   Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  seller:  Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  last_message?: Pick<Message, 'content' | 'message_type' | 'created_at' | 'is_read'>
}

// ─── Payload Types (JSONB di kolom messages.payload) ─────────────────────────

/** Payload untuk message_type = 'offer' */
export interface OfferPayload {
  offered_price:  number
  original_price?: number
  note?:          string
}

/** Payload untuk message_type = 'offer_accept' */
export interface OfferAcceptPayload {
  agreed_price: number
  meet_point:   string
  meet_time:    string
}

/** Payload untuk message_type = 'offer_reject' */
export interface OfferRejectPayload {
  counter_offer?: number
  reason?:        string
}

/** Payload untuk message_type = 'system' */
export interface SystemMessagePayload {
  event: 'status_changed' | 'booking_cancelled' | 'item_sold'
  from?: ProductStatus
  to?:   ProductStatus
}

/** Union type semua kemungkinan payload */
export type MessagePayload =
  | OfferPayload
  | OfferAcceptPayload
  | OfferRejectPayload
  | SystemMessagePayload

// ─── Server Action Response Type ─────────────────────────────────────────────
export type ActionResult<T = void> =
  | { success: true;  data?: T }
  | { success: false; error: string }
