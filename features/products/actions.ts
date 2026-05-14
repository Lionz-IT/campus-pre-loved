'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations/product.schema'
import { generateStorageFileName } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'
import type { ActionResult } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'


export async function createProductAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Kamu harus login terlebih dahulu' }


  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse({
    ...raw,
    is_negotiable: raw.is_negotiable === 'true',
  })
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { success: false, error: firstError ?? 'Data produk tidak valid' }
  }


  const imageFiles = formData.getAll('images') as File[]
  const imageUrls: string[] = []
  
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  for (const file of imageFiles.slice(0, 5)) {
    if (file.size === 0) continue
    if (file.size > MAX_FILE_SIZE) return { success: false, error: `File ${file.name} terlalu besar (maksimal 5MB)` }
    if (!ALLOWED_TYPES.includes(file.type)) return { success: false, error: `Format file ${file.name} tidak didukung` }

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


  const { data, error } = await supabase
    .from('products')
    .insert({
      ...parsed.data,
      seller_id:    user.id,
      image_urls:   imageUrls,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath(ROUTES.HOME)
  revalidatePath(ROUTES.PRODUCTS)
  return { success: true, data: { id: data.id } }
}


export async function updateProductAction(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }


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
    .eq('seller_id', user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  revalidatePath(ROUTES.PRODUCTS)
  return { success: true }
}


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


export async function markAsSoldAction(
  productId: string,
  chatId: string,
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }


  const { error } = await supabase
    .from('products')
    .update({ status: 'sold' })
    .eq('id', productId)
    .eq('seller_id', user.id)
    .eq('status', 'available')

  if (error) return { success: false, error: error.message }

  await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'system',
    content:      'Transaksi selesai! Barang sudah terjual. Terima kasih!',
    payload:      { event: 'item_sold', from: 'available', to: 'sold' },
  })

  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  revalidatePath(ROUTES.HOME)
  revalidatePath(ROUTES.PRODUCTS)
  revalidatePath(ROUTES.PROFILE)
  return { success: true }
}


export async function revertSoldAction(
  productId: string,
  chatId: string,
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('products')
    .update({ status: 'available' })
    .eq('id', productId)
    .eq('seller_id', user.id)
    .eq('status', 'sold')

  if (error) return { success: false, error: error.message }

  await supabase.from('messages').insert({
    chat_id:      chatId,
    sender_id:    user.id,
    message_type: 'system',
    content:      'Penjualan dibatalkan. Barang kembali tersedia.',
    payload:      { event: 'sale_reverted', from: 'sold', to: 'available' },
  })

  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  revalidatePath(ROUTES.HOME)
  revalidatePath(ROUTES.PRODUCTS)
  revalidatePath(ROUTES.PROFILE)
  return { success: true }
}


export async function toggleProductStatusAction(
  productId: string,
  newStatus: 'available' | 'sold',
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('products')
    .update({ status: newStatus })
    .eq('id', productId)
    .eq('seller_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  revalidatePath(ROUTES.PRODUCT_EDIT(productId))
  revalidatePath(ROUTES.HOME)
  revalidatePath(ROUTES.PRODUCTS)
  revalidatePath(ROUTES.PROFILE)
  return { success: true }
}


import type { Database } from '@/types/database.types'

type ProductCategory = Database['public']['Enums']['product_category']

const PRODUCT_WITH_SELLER_SELECT = `
  *,
  seller:profiles!products_seller_id_fkey!inner (
    id, full_name, avatar_url, rating, whatsapp_number
  )
` as const

export async function getMarketplaceFeedAction(params?: {
  category?:  string
  search?:    string
  sort?:      string
  condition?: string
  page?:      number
  limit?:     number
}) {
  const supabase = await createSupabaseServerClient()
  const { category, search, sort, condition, page = 1, limit = 20 } = params ?? {}
  const from = (page - 1) * limit
  const to   = from + limit - 1

  let query = supabase
    .from('products')
    .select(PRODUCT_WITH_SELLER_SELECT)
    .eq('status', 'available')
    .eq('is_deleted', false)
    .range(from, to)

  if (category && category !== 'all') {
    query = query.eq('category', category as ProductCategory)
  }
  if (condition && condition !== 'all') {
    query = query.eq('condition', condition)
  }
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true, nullsFirst: false })
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) return { success: false, error: error.message }
  return { success: true, data: data ?? [] }
}
