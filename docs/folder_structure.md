# Campus Pre-loved Marketplace — Struktur Folder Next.js 16

> **Stack**: Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4 · Supabase SSR

```
campus-preloved/
│
├── 📁 app/                              # Next.js App Router root
│   │
│   ├── 📁 (auth)/                       # Route Group: halaman auth (tidak ada layout header/navbar)
│   │   ├── login/
│   │   │   └── page.tsx                 # Halaman login
│   │   ├── register/
│   │   │   └── page.tsx                 # Halaman registrasi (validasi domain PENS Layer 1)
│   │   ├── verify-email/
│   │   │   └── page.tsx                 # Halaman tunggu verifikasi email
│   │   └── layout.tsx                   # Layout minimal untuk auth (centered card)
│   │
│   ├── 📁 (main)/                       # Route Group: semua halaman yang butuh Navbar + Header
│   │   ├── layout.tsx                   # Layout utama dengan Navbar, header, auth guard
│   │   │
│   │   ├── page.tsx                     # "/" → Marketplace feed (daftar produk)
│   │   │
│   │   ├── 📁 products/
│   │   │   ├── page.tsx                 # "/products" → Browse semua produk + filter
│   │   │   ├── 📁 new/
│   │   │   │   └── page.tsx             # "/products/new" → Form tambah produk (protected)
│   │   │   └── 📁 [id]/
│   │   │       ├── page.tsx             # "/products/[id]" → Detail produk
│   │   │       └── 📁 edit/
│   │   │           └── page.tsx         # "/products/[id]/edit" → Edit produk (owner only)
│   │   │
│   │   ├── 📁 chats/
│   │   │   ├── page.tsx                 # "/chats" → Daftar semua room chat (inbox)
│   │   │   └── 📁 [chatId]/
│   │   │       └── page.tsx             # "/chats/[chatId]" → Room chat + tawar-menawar
│   │   │
│   │   └── 📁 profile/
│   │       ├── page.tsx                 # "/profile" → Profil diri sendiri
│   │       ├── 📁 [userId]/
│   │       │   └── page.tsx             # "/profile/[userId]" → Profil publik user lain
│   │       └── 📁 settings/
│   │           └── page.tsx             # "/profile/settings" → Edit profil
│   │
│   ├── 📁 api/                          # API Routes (Next.js Route Handlers)
│   │   ├── 📁 auth/
│   │   │   └── 📁 callback/
│   │   │       └── route.ts             # Supabase Auth email callback (WAJIB ada)
│   │   └── 📁 storage/
│   │       └── 📁 upload/
│   │           └── route.ts             # Upload foto produk ke Supabase Storage
│   │
│   ├── globals.css                      # Tailwind CSS v4 directives + CSS variables
│   ├── layout.tsx                       # Root layout (html, body, providers)
│   └── not-found.tsx                    # Halaman 404
│
├── 📁 components/                       # Komponen UI (HANYA presentational, tidak ada data fetching)
│   ├── 📁 ui/                           # Komponen atom/primitif yang bisa dipakai ulang
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx                    # Badge status (Tersedia, Di-booking, Terjual)
│   │   ├── Avatar.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx                 # Loading skeleton
│   │   ├── Toast.tsx
│   │   └── index.ts                     # Barrel export semua UI primitives
│   │
│   ├── 📁 layout/                       # Komponen struktur halaman
│   │   ├── Navbar.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── 📁 product/                      # Komponen domain: Produk
│   │   ├── ProductCard.tsx              # Card produk untuk feed/grid
│   │   ├── ProductGrid.tsx              # Grid layout untuk daftar produk
│   │   ├── ProductForm.tsx              # Form tambah/edit produk (React Hook Form + Zod)
│   │   ├── ProductImageUpload.tsx       # Komponen upload foto ke Supabase Storage
│   │   ├── ProductStatusBadge.tsx       # Badge status state machine
│   │   ├── ProductFilter.tsx            # Filter kategori, kondisi, harga
│   │   └── ProductSearchBar.tsx         # Search bar dengan autocomplete
│   │
│   ├── 📁 chat/                         # Komponen domain: Chat & Tawar-menawar
│   │   ├── ChatInbox.tsx                # Daftar room chat
│   │   ├── ChatRoom.tsx                 # Tampilan room chat (Realtime)
│   │   ├── MessageBubble.tsx            # Bubble pesan individual
│   │   ├── MessageInput.tsx             # Input kirim pesan
│   │   ├── OfferCard.tsx                # Tampilan kartu penawaran harga
│   │   └── OfferActions.tsx             # Tombol Terima/Tolak tawaran
│   │
│   └── 📁 auth/                         # Komponen domain: Auth
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx             # Termasuk validasi domain PENS (Layer 1)
│       └── EmailDomainWarning.tsx       # Peringatan jika email bukan domain PENS
│
├── 📁 lib/                              # Utilitas & konfigurasi (non-UI)
│   │
│   ├── 📁 supabase/                     # Supabase clients (@supabase/ssr)
│   │   ├── client.ts                    # Supabase Browser Client (untuk Realtime & Client Components)
│   │   ├── server.ts                    # Supabase Server Client (untuk Server Components & Actions)
│   │   └── middleware.ts                # Supabase session refresh middleware helper
│   │
│   ├── 📁 validations/                  # Zod schemas (Layer 1 validasi)
│   │   ├── auth.schema.ts               # Schema auth + regex domain PENS
│   │   ├── product.schema.ts            # Schema form produk
│   │   └── offer.schema.ts              # Schema payload tawar-menawar
│   │
│   ├── 📁 constants/                    # Konstanta aplikasi
│   │   ├── product.ts                   # PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, dll
│   │   ├── pens.ts                      # PENS_EMAIL_DOMAINS, CAMPUS_LOCATIONS, dll
│   │   └── routes.ts                    # APP_ROUTES object (hindari magic strings)
│   │
│   └── utils.ts                         # Helper umum (cn(), formatPrice(), formatDate(), dll)
│
├── 📁 actions/                          # Next.js Server Actions (semua mutasi data)
│   ├── auth.actions.ts                  # login(), register(), logout(), updateProfile()
│   ├── product.actions.ts               # createProduct(), updateProduct(), deleteProduct(), bookProduct(), cancelBooking(), markAsSold()
│   ├── chat.actions.ts                  # createChatRoom(), sendMessage(), markAsRead()
│   └── offer.actions.ts                 # sendOffer(), acceptOffer(), rejectOffer()
│
├── 📁 hooks/                            # Custom React Hooks (Client-side)
│   ├── useSupabaseRealtime.ts           # Hook abstraksi Supabase Realtime subscription
│   ├── useChat.ts                       # Hook state management chat room
│   ├── useProducts.ts                   # Hook untuk fetch & filter produk
│   └── useAuth.ts                       # Hook session & user state
│
├── 📁 types/                            # TypeScript type definitions
│   ├── database.types.ts                # Auto-generated dari Supabase CLI (jangan edit manual!)
│   ├── supabase.ts                      # Re-export + helper types dari database.types.ts
│   └── index.ts                         # Custom app-level types (OfferPayload, MessageWithSender, dll)
│
├── 📁 middleware.ts                     # Next.js Middleware (auth guard + session refresh)
│
├── 📁 public/                           # Aset statis
│   ├── logo.svg
│   └── placeholder-product.png
│
└── 📁 docs/                             # Dokumentasi proyek
    ├── database_schema.sql              # ← File yang sudah dibuat
    └── folder_structure.md              # ← File ini
```

---

## Penjelasan Arsitektur Kunci

### 🔐 Auth Guard — `middleware.ts`

```typescript
// middleware.ts (root)
import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Jalankan middleware di semua route kecuali aset statis
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

### 🗄️ Supabase Clients — `lib/supabase/`

```typescript
// lib/supabase/server.ts — untuk Server Components & Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:    () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* middleware sudah handle refresh */ }
        },
      },
    }
  )
}
```

```typescript
// lib/supabase/client.ts — untuk Client Components (Realtime)
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

### ✅ Layer 1 Validasi Email PENS — `lib/validations/auth.schema.ts`

```typescript
// lib/validations/auth.schema.ts
import { z } from 'zod'
import { PENS_EMAIL_DOMAINS } from '@/lib/constants/pens'

const PENS_EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@(mhs\.pens\.ac\.id|it\.student\.pens\.ac\.id|pens\.ac\.id)$/

export const registerSchema = z.object({
  full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  campus_email: z
    .string()
    .email('Format email tidak valid')
    .regex(
      PENS_EMAIL_REGEX,
      `Email harus menggunakan domain PENS: ${PENS_EMAIL_DOMAINS.join(', ')}`
    ),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirm_password'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
```

---

### ⚙️ Server Actions — `actions/product.actions.ts`

```typescript
// actions/product.actions.ts
'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations/product.schema'
import { revalidatePath } from 'next/cache'

// CREATE produk
export async function createProduct(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = productSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('products')
    .insert({ ...parsed.data, seller_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/')
  return { data }
}

// State Machine: Booking produk
export async function bookProduct(productId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('products')
    .update({ status: 'booked', booked_by: user.id })
    .eq('id', productId)
    .eq('status', 'available') // double-check di aplikasi (DB trigger juga menjaga)

  if (error) return { error: error.message }
  revalidatePath(`/products/${productId}`)
  return { success: true }
}

// State Machine: Cancel booking (kembali ke available)
export async function cancelBooking(productId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('products')
    .update({ status: 'available' }) // DB trigger otomatis NULL-kan booked_by
    .eq('id', productId)
    .eq('booked_by', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/products/${productId}`)
  return { success: true }
}
```

---

### 💬 Tawar-menawar — `actions/offer.actions.ts`

```typescript
// actions/offer.actions.ts
'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { OfferPayload } from '@/types'

// Kirim penawaran harga (type: 'offer')
export async function sendOffer(chatId: string, payload: OfferPayload) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'offer',
    payload:      payload,   // { offered_price, original_price, note }
  })

  return error ? { error: error.message } : { success: true }
}

// Terima tawaran (type: 'offer_accept')
export async function acceptOffer(chatId: string, agreedPrice: number, meetDetails: object) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'offer_accept',
    payload:      { agreed_price: agreedPrice, ...meetDetails },
  })

  return error ? { error: error.message } : { success: true }
}
```

---

### 📡 Realtime Hook — `hooks/useChat.ts`

```typescript
// hooks/useChat.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Message = Database['public']['Tables']['messages']['Row']

export function useChat(chatId: string, initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [chatId, supabase])

  const sendMessage = useCallback(async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('messages').insert({
      chat_id:      chatId,
      sender_id:    user.id,
      message_type: 'text',
      content,
    })
  }, [chatId, supabase])

  return { messages, sendMessage }
}
```

---

### 🌍 Konstanta PENS — `lib/constants/pens.ts`

```typescript
// lib/constants/pens.ts
export const PENS_EMAIL_DOMAINS = [
  '@mhs.pens.ac.id',
  '@it.student.pens.ac.id',
  '@pens.ac.id',
] as const

export const PENS_CAMPUS_LOCATIONS = [
  'Lobby Gedung A',
  'Kantin Teknik',
  'Perpustakaan PENS',
  'Lab Elektronika Lt. 2',
  'Parkiran Belakang',
  'Masjid Kampus',
] as const

export const PRODUCT_CATEGORIES = [
  { value: 'microcontroller',       label: 'Mikrokontroler 🤖' },
  { value: 'electronic_component',  label: 'Komponen Elektronika ⚡' },
  { value: 'module',                label: 'Modul 🔌' },
  { value: 'tool',                  label: 'Alat & Perkakas 🔧' },
  { value: 'book_module',           label: 'Buku & Modul Kuliah 📚' },
  { value: 'laptop_accessory',      label: 'Aksesoris Laptop 💻' },
  { value: 'clothing',              label: 'Pakaian & Merchandise 👕' },
  { value: 'stationery',            label: 'Alat Tulis & Gambar ✏️' },
  { value: 'other',                 label: 'Lainnya 📦' },
] as const
```

---

## 🔑 Environment Variables — `.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Hanya dipakai di Server Actions / API Routes (tidak expose ke client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 📋 Alur Data Ringkas

```
Browser Request
  │
  ├─ Server Component (RSC)
  │     └─ lib/supabase/server.ts  ─→  Supabase DB (RLS aktif)
  │
  ├─ Form Submit (mutation)
  │     └─ actions/*.actions.ts    ─→  Supabase DB  ─→  revalidatePath()
  │
  └─ Realtime (chat)
        └─ hooks/useChat.ts        ─→  Supabase Realtime (WebSocket)
```
