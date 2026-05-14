'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/lib/constants/routes'
import type { ActionResult } from '@/types'


export async function createReviewAction(
  productId: string,
  sellerId: string,
  rating: number,
  comment: string | null,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Kamu harus login terlebih dahulu' }

  if (user.id === sellerId) {
    return { success: false, error: 'Tidak bisa mereview produk sendiri' }
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { success: false, error: 'Rating harus antara 1-5' }
  }

  if (comment && comment.length > 500) {
    return { success: false, error: 'Komentar maksimal 500 karakter' }
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id:  productId,
      seller_id:   sellerId,
      reviewer_id: user.id,
      rating,
      comment:     comment?.trim() || null,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Kamu sudah pernah mereview produk ini' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  return { success: true, data: { id: data.id } }
}


export async function getProductReviewsAction(productId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey!inner (id, full_name, avatar_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: data ?? [] }
}


export async function getSellerReviewsAction(sellerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      product:products!reviews_product_id_fkey!inner (id, title, image_urls),
      reviewer:profiles!reviews_reviewer_id_fkey!inner (id, full_name, avatar_url)
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: data ?? [] }
}


export async function checkCanReviewAction(
  productId: string,
  sellerId: string,
): Promise<ActionResult<{ canReview: boolean; hasReviewed: boolean }>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: true, data: { canReview: false, hasReviewed: false } }

  if (user.id === sellerId) {
    return { success: true, data: { canReview: false, hasReviewed: false } }
  }

  const [{ data: product }, { data: existingReview }] = await Promise.all([
    supabase
      .from('products')
      .select('status')
      .eq('id', productId)
      .single(),
    supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('reviewer_id', user.id)
      .maybeSingle(),
  ])

  const isSold = product?.status === 'sold'
  const hasReviewed = !!existingReview

  return {
    success: true,
    data: { canReview: isSold && !hasReviewed, hasReviewed },
  }
}
