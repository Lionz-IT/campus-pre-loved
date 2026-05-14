




import type { Database } from './database.types'


export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Chat    = Database['public']['Tables']['chats']['Row']
export type Message = Database['public']['Tables']['messages']['Row']


export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']


export type ProductStatus   = Database['public']['Enums']['product_status']
export type ProductCategory = Database['public']['Enums']['product_category']
export type MessageType     = Database['public']['Enums']['message_type']




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
  | { success: true;  data?: T }
  | { success: false; error: string }


// ── Wishlists ──────────────────────────────────────────────

export interface Wishlist {
  id:         string
  user_id:    string
  product_id: string
  created_at: string
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
  created_at:  string
  updated_at:  string
}

export type ReviewWithReviewer = Review & {
  reviewer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type ReviewWithProduct = Review & {
  product:  Pick<Product, 'id' | 'title' | 'image_urls'>
  reviewer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}
