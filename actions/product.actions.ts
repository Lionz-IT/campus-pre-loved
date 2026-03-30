'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations/product.schema'
import { generateStorageFileName } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'
import type { ActionResult, ProductWithSeller } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── CREATE Produk ─────────────────────────────────────────────────────────────
export async function createProductAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Kamu harus login terlebih dahulu' }

  // Validasi form
  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse({
    ...raw,
    is_negotiable: raw.is_negotiable === 'true',
  })
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { success: false, error: firstError ?? 'Data produk tidak valid' }
  }

  // Upload foto jika ada (maks 5 file)
  const imageFiles = formData.getAll('images') as File[]
  const imageUrls: string[] = []

  for (const file of imageFiles.slice(0, 5)) {
    if (file.size === 0) continue
    const filePath = generateStorageFileName(user.id, file.name)
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)
    if (uploadError) return { success: false, error: `Gagal upload foto: ${uploadError.message}` }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)
    imageUrls.push(publicUrl)
  }

  // Insert produk
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...parsed.data,
      seller_id:  user.id,
      image_urls: imageUrls,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath(ROUTES.HOME)
  revalidatePath(ROUTES.PRODUCTS)
  return { success: true, data: { id: data.id } }
}

// ─── UPDATE Produk ─────────────────────────────────────────────────────────────
export async function updateProductAction(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Pastikan hanya pemilik yang bisa edit (RLS juga menjaga ini)
  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse({
    ...raw,
    is_negotiable: raw.is_negotiable === 'true',
  })
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { success: false, error: firstError ?? 'Data tidak valid' }
  }

  const { error } = await supabase
    .from('products')
    .update(parsed.data)
    .eq('id', productId)
    .eq('seller_id', user.id) // double-check ownership

  if (error) return { success: false, error: error.message }
  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  revalidatePath(ROUTES.PRODUCTS)
  return { success: true }
}

// ─── SOFT DELETE Produk ────────────────────────────────────────────────────────
export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('products')
    .update({ is_deleted: true })
    .eq('id', productId)
    .eq('seller_id', user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath(ROUTES.PRODUCTS)
  revalidatePath(ROUTES.PROFILE)
  redirect(ROUTES.PROFILE)
}

// ─── STATE MACHINE: Booking ────────────────────────────────────────────────────
export async function bookProductAction(
  productId: string,
  chatId: string,
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Update status → 'booked' (DB trigger guard_product_status memvalidasi transisi)
  const { error } = await supabase
    .from('products')
    .update({ status: 'booked', booked_by: user.id })
    .eq('id', productId)
    .eq('status', 'available') // hanya jika masih tersedia

  if (error) return { success: false, error: error.message }

  // Kirim pesan sistem ke chat room
  await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'system',
    content:      'Barang berhasil di-booking. Segera atur jadwal COD!',
    payload:      { event: 'status_changed', from: 'available', to: 'booked' },
  })

  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  return { success: true }
}

// ─── STATE MACHINE: Cancel Booking ────────────────────────────────────────────
export async function cancelBookingAction(
  productId: string,
  chatId: string,
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Update status → 'available' (DB trigger otomatis NULL-kan booked_by)
  const { error } = await supabase
    .from('products')
    .update({ status: 'available' })
    .eq('id', productId)
    .eq('booked_by', user.id) // hanya pembeli yang booking yang bisa cancel

  if (error) return { success: false, error: error.message }

  await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'system',
    content:      'Booking dibatalkan. Barang kembali tersedia.',
    payload:      { event: 'booking_cancelled', from: 'booked', to: 'available' },
  })

  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  return { success: true }
}

// ─── STATE MACHINE: Mark as Sold ──────────────────────────────────────────────
export async function markAsSoldAction(
  productId: string,
  chatId: string,
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Hanya penjual yang bisa tandai terjual
  const { error } = await supabase
    .from('products')
    .update({ status: 'sold' })
    .eq('id', productId)
    .eq('seller_id', user.id)
    .eq('status', 'booked') // harus sudah di-booking dulu

  if (error) return { success: false, error: error.message }

  await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'system',
    content:      '🎉 Transaksi selesai! Barang sudah terjual. Terima kasih!',
    payload:      { event: 'item_sold', from: 'booked', to: 'sold' },
  })

  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  return { success: true }
}

// ─── GET Feed Marketplace ──────────────────────────────────────────────────────
export async function getMarketplaceFeedAction(params?: {
  category?: string
  search?:   string
  page?:     number
  limit?:    number
}): Promise<ActionResult<ProductWithSeller[]>> {
  const supabase = await createSupabaseServerClient()
  const { category, search, page = 1, limit = 20 } = params ?? {}
  const from = (page - 1) * limit
  const to   = from + limit - 1

  let query = supabase
    .from('products')
    .select(`
      *,
      seller:profiles!products_seller_id_fkey (
        id, full_name, avatar_url, rating, whatsapp_number
      )
    `)
    .eq('status', 'available')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (category && category !== 'all') {
    query = query.eq('category', category as never)
  }
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data, error } = await query
  if (error) return { success: false, error: error.message }
  return { success: true, data: data as ProductWithSeller[] }
}
