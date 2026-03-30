/**
 * PLACEHOLDER — Auto-generated oleh Supabase CLI.
 * Jangan edit file ini secara manual!
 *
 * Cara generate ulang setelah mengubah schema database:
 *   npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
 *
 * Atau menggunakan Supabase CLI lokal:
 *   npx supabase gen types typescript --local > types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:              string
          full_name:       string
          nim:             string | null
          department:      string | null
          campus_email:    string
          bio:             string | null
          avatar_url:      string | null
          whatsapp_number: string | null
          total_listings:  number
          total_sold:      number
          rating:          number | null
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id:              string
          full_name:       string
          campus_email:    string
          nim?:            string | null
          department?:     string | null
          bio?:            string | null
          avatar_url?:     string | null
          whatsapp_number?: string | null
        }
        Update: {
          full_name?:      string
          nim?:            string | null
          department?:     string | null
          bio?:            string | null
          avatar_url?:     string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id:              string
          seller_id:       string
          title:           string
          description:     string | null
          price:           number | null
          listing_type:    Database['public']['Enums']['listing_type']
          category:        Database['public']['Enums']['product_category']
          condition:       string
          status:          Database['public']['Enums']['product_status']
          booked_by:       string | null
          image_urls:      string[]
          campus_location: string | null
          is_negotiable:   boolean
          is_deleted:      boolean
          created_at:      string
          updated_at:      string
        }
        Insert: {
          seller_id:       string
          title:           string
          category:        Database['public']['Enums']['product_category']
          listing_type?:   Database['public']['Enums']['listing_type']
          description?:    string | null
          price?:          number | null
          condition?:      string
          image_urls?:     string[]
          campus_location?: string | null
          is_negotiable?:  boolean
        }
        Update: {
          title?:          string
          description?:    string | null
          price?:          number | null
          category?:       Database['public']['Enums']['product_category']
          condition?:      string
          status?:         Database['public']['Enums']['product_status']
          booked_by?:      string | null
          image_urls?:     string[]
          campus_location?: string | null
          is_negotiable?:  boolean
          is_deleted?:     boolean
        }
        Relationships: [
          { foreignKeyName: 'products_seller_id_fkey'; columns: ['seller_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'products_booked_by_fkey'; columns: ['booked_by']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ]
      }
      chats: {
        Row: {
          id:              string
          product_id:      string
          buyer_id:        string
          seller_id:       string
          last_message_at: string | null
          created_at:      string
        }
        Insert: {
          product_id:  string
          buyer_id:    string
          seller_id:   string
        }
        Update: {
          last_message_at?: string | null
        }
        Relationships: [
          { foreignKeyName: 'chats_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedColumns: ['id'] },
          { foreignKeyName: 'chats_buyer_id_fkey';   columns: ['buyer_id'];   referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'chats_seller_id_fkey';  columns: ['seller_id'];  referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ]
      }
      messages: {
        Row: {
          id:           string
          chat_id:      string
          sender_id:    string
          message_type: Database['public']['Enums']['message_type']
          content:      string | null
          payload:      import('./index').MessagePayload | null
          is_read:      boolean
          created_at:   string
        }
        Insert: {
          chat_id:       string
          sender_id:     string
          message_type?: Database['public']['Enums']['message_type']
          content?:      string | null
          payload?:      Record<string, unknown> | null
          is_read?:      boolean
        }
        Update: {
          is_read?: boolean
        }
        Relationships: [
          { foreignKeyName: 'messages_chat_id_fkey';   columns: ['chat_id'];   referencedRelation: 'chats';    referencedColumns: ['id'] },
          { foreignKeyName: 'messages_sender_id_fkey'; columns: ['sender_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ]
      }
    }
    Views: {
      v_marketplace_feed: {
        Row: {
          id:             string
          title:          string
          price:          number | null
          listing_type:   Database['public']['Enums']['listing_type']
          category:       Database['public']['Enums']['product_category']
          condition:      string
          status:         Database['public']['Enums']['product_status']
          image_urls:     string[]
          is_negotiable:  boolean
          campus_location: string | null
          created_at:     string
          seller_name:    string
          seller_avatar:  string | null
          seller_rating:  number | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      product_status:   'available' | 'booked' | 'sold'
      product_category: 'microcontroller' | 'electronic_component' | 'module' | 'tool' | 'book_module' | 'laptop_accessory' | 'clothing' | 'stationery' | 'other'
      message_type:     'text' | 'offer' | 'offer_accept' | 'offer_reject' | 'system'
      listing_type:     'sell' | 'barter'
    }
    CompositeTypes: Record<string, never>
  }
}
