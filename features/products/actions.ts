'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, profiles, messages } from '@/lib/db/schema'
import { eq, and, desc, gte, lte, ilike, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import type { ActionResult } from '@/types'
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { productSchema } from '@/lib/validations/product.schema'
import type { Database } from '@/types/database.types'

type ProductCategory = Database['public']['Enums']['product_category']

export async function createProductAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    const user = session?.user
    if (!user) return { success: false, error: 'Kamu harus login terlebih dahulu' }

    const raw = Object.fromEntries(formData)
    const parsed = productSchema.safeParse({
      ...raw,
      is_negotiable: raw.is_negotiable === 'true',
      price: raw.price === '' ? undefined : raw.price,
    })
    
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors).flat()[0]
      return { 
        success: false, 
        error: firstError ?? 'Data produk tidak valid',
        fieldErrors: fieldErrors as Record<string, string[]>
      }
    }

    const imageFiles = formData.getAll('images') as File[]
    const imageUrls: string[] = []
    
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    for (const file of imageFiles.slice(0, 5)) {
      if (file.size === 0) continue
      if (file.size > MAX_FILE_SIZE) return { success: false, error: `File ${file.name} terlalu besar (maksimal 5MB)` }
      if (!ALLOWED_TYPES.includes(file.type)) return { success: false, error: `Format file ${file.name} tidak didukung` }

      const fileName = `${user.id}/${Date.now()}-${file.name}`
      
      const arrayBuffer = await file.arrayBuffer()
      const fileBuffer = Buffer.from(arrayBuffer)
      
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
      }))
      
      const region = process.env.AWS_REGION || 'ap-southeast-3'
      imageUrls.push(`https://${process.env.S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${fileName}`)
    }

    const newProduct = await db.insert(products).values({
        ...parsed.data,
        price: typeof parsed.data.price === 'number' ? parsed.data.price : null,
        seller_id:    user.id as string,
        image_urls:   imageUrls,
    }).returning({ id: products.id })

    if (!newProduct[0]) return { success: false, error: `Gagal menyimpan produk` }
    
    await db.update(profiles)
      .set({ total_listings: sql`${profiles.total_listings} + 1` })
      .where(eq(profiles.id, user.id as string))
    
    revalidatePath(ROUTES.HOME)
    revalidatePath(ROUTES.PRODUCTS)
    return { success: true, data: { id: newProduct[0].id } }
  } catch (err: any) {
    console.error('Error in createProductAction:', err)
    return { success: false, error: err?.message || 'Terjadi kesalahan sistem internal' }
  }
}

export async function updateProductAction(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Unauthorized' }

  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse({
    ...raw,
    is_negotiable: raw.is_negotiable === 'true',
    price: raw.price === '' ? undefined : raw.price,
  })
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { success: false, error: firstError ?? 'Data tidak valid' }
  }

  await db.update(products)
    .set({
      ...parsed.data,
      price: typeof parsed.data.price === 'number' ? parsed.data.price : null,
    })
    .where(and(eq(products.id, productId), eq(products.seller_id, user.id as string)))

  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  revalidatePath(ROUTES.PRODUCTS)
  return { success: true }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Unauthorized' }

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.seller_id, user.id as string)),
    columns: { is_deleted: true }
  })
  if (!product || product.is_deleted) return { success: true }

  await db.update(products)
    .set({ is_deleted: true })
    .where(and(eq(products.id, productId), eq(products.seller_id, user.id as string)))

  await db.update(profiles)
    .set({ total_listings: sql`${profiles.total_listings} - 1` })
    .where(eq(profiles.id, user.id as string))

  revalidatePath(ROUTES.PRODUCTS)
  revalidatePath(ROUTES.PROFILE)
  redirect(ROUTES.PROFILE)
}

export async function markAsSoldAction(
  productId: string,
  chatId: string,
  quantitySold: number = 1
): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Unauthorized' }

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.seller_id, user.id as string)),
    columns: { stock: true }
  })
    
  if (!product) return { success: false, error: 'Produk tidak ditemukan' }
  if (product.stock < quantitySold) return { success: false, error: 'Stok tidak mencukupi' }

  await db.update(products)
    .set({ 
      stock: product.stock - quantitySold,
      status: (product.stock - quantitySold) <= 0 ? 'sold' : 'available'
    })
    .where(and(eq(products.id, productId), eq(products.seller_id, user.id as string)))

  await db.update(profiles)
    .set({ total_sold: sql`${profiles.total_sold} + ${quantitySold}` })
    .where(eq(profiles.id, user.id as string))

  await db.insert(messages).values({
    chat_id:      chatId,
    sender_id:    user.id as string,
    message_type: 'system',
    content:      `Transaksi selesai! Barang sudah terjual (${quantitySold} item). Terima kasih!`,
    payload:      { event: 'item_sold', from: 'available', to: 'sold', quantity: quantitySold },
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
  quantityToReturn: number = 1
): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.seller_id, user.id as string)),
    columns: { stock: true }
  })
    
  if (!product) return { success: false, error: 'Produk tidak ditemukan' }

  await db.update(products)
    .set({ 
      stock: product.stock + quantityToReturn,
      status: 'available'
    })
    .where(and(eq(products.id, productId), eq(products.seller_id, user.id as string)))

  await db.update(profiles)
    .set({ total_sold: sql`${profiles.total_sold} - ${quantityToReturn}` })
    .where(eq(profiles.id, user.id as string))

  await db.insert(messages).values({
    chat_id:      chatId,
    sender_id:    user.id as string,
    message_type: 'system',
    content:      `Penjualan dibatalkan. Barang (${quantityToReturn} item) kembali tersedia ke stok.`,
    payload:      { event: 'sale_reverted', from: 'sold', to: 'available', quantity: quantityToReturn },
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
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Unauthorized' }

  await db.update(products)
    .set({ status: newStatus })
    .where(and(eq(products.id, productId), eq(products.seller_id, user.id as string)))

  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  revalidatePath(ROUTES.PRODUCT_EDIT(productId))
  revalidatePath(ROUTES.HOME)
  revalidatePath(ROUTES.PRODUCTS)
  revalidatePath(ROUTES.PROFILE)
  return { success: true }
}

export async function getMarketplaceFeedAction(params?: {
  category?:  string
  search?:    string
  sort?:      string
  condition?: string
  min_price?: string
  max_price?: string
  page?:      number
  limit?:     number
}) {
  const { category, search, sort, condition, min_price, max_price, page = 1, limit = 20 } = params ?? {}
  const offset = (page - 1) * limit

  const conditions = [
    eq(products.status, 'available'),
    eq(products.is_deleted, false)
  ]

  if (category && category !== 'all') {
    const categories = category.split(',') as ProductCategory[]
    conditions.push(inArray(products.category, categories))
  }
  if (condition && condition !== 'all') {
    conditions.push(eq(products.condition, condition))
  }
  if (min_price) {
    conditions.push(gte(products.price, parseInt(min_price, 10)))
  }
  if (max_price) {
    conditions.push(lte(products.price, parseInt(max_price, 10)))
  }
  if (search) {
    conditions.push(ilike(products.title, `%${search}%`))
  }

  let query = db.select({
      id: products.id,
      title: products.title,
      price: products.price,
      listing_type: products.listing_type,
      category: products.category,
      condition: products.condition,
      status: products.status,
      image_urls: products.image_urls,
      is_negotiable: products.is_negotiable,
      campus_location: products.campus_location,
      created_at: products.created_at,
      seller_id: products.seller_id,
      seller_name: profiles.full_name,
      seller_avatar: profiles.avatar_url,
      seller_rating: profiles.rating,
  })
  .from(products)
  .innerJoin(profiles, eq(products.seller_id, profiles.id))
  .where(and(...conditions))
  .limit(limit)
  .offset(offset)
  .orderBy(
    sort === 'price_asc' ? products.price : 
    sort === 'price_desc' ? desc(products.price) : 
    desc(products.created_at)
  )

  try {
    const data = await query
    return { success: true, data: data ?? [] }
  } catch (error: any) {
    console.error('Error in getMarketplaceFeedAction:', error)
    return { success: false, error: error.message || 'Gagal mengambil data dari database' }
  }
}
