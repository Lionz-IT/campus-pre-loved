'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews, products, profiles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/lib/constants/routes'
import type { ActionResult } from '@/types'

export async function createReviewAction(
  productId: string,
  sellerId: string,
  rating: number,
  comment: string | null,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  const user = session?.user
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

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { status: true }
  })
  if (!product || product.status !== 'sold') {
    return { success: false, error: 'Produk belum terjual, tidak bisa direview' }
  }

  try {
    const newReview = await db.insert(reviews).values({
      product_id:  productId,
      seller_id:   sellerId,
      reviewer_id: user.id as string,
      rating,
      comment:     comment?.trim() || null,
    }).returning({ id: reviews.id })

    const allReviews = await db.select({ rating: reviews.rating }).from(reviews).where(eq(reviews.seller_id, sellerId))
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
      const averageRating = totalRating / allReviews.length
      
      await db.update(profiles)
        .set({ rating: Math.round(averageRating * 10) / 10 })
        .where(eq(profiles.id, sellerId))
    }

    revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
    revalidatePath('/profile')
    revalidatePath(ROUTES.PROFILE_PUBLIC(sellerId))
    return { success: true, data: { id: newReview[0].id } }
  } catch (err: any) {
    if (err.code === '23505') {
      return { success: false, error: 'Kamu sudah pernah mereview produk ini' }
    }
    return { success: false, error: err.message || 'Gagal menyimpan review' }
  }
}

export async function getProductReviewsAction(productId: string) {
  const data = await db.query.reviews.findMany({
    where: eq(reviews.product_id, productId),
    orderBy: desc(reviews.created_at),
    with: {
        reviewer: { columns: { id: true, full_name: true, avatar_url: true } }
    }
  })

  return { success: true as const, data: data ?? [] }
}

export async function getSellerReviewsAction(sellerId: string) {
  const data = await db.query.reviews.findMany({
    where: eq(reviews.seller_id, sellerId),
    orderBy: desc(reviews.created_at),
    with: {
        product: { columns: { id: true, title: true, image_urls: true } },
        reviewer: { columns: { id: true, full_name: true, avatar_url: true } }
    }
  })

  return { success: true as const, data: data ?? [] }
}

export async function checkCanReviewAction(
  productId: string,
  sellerId: string,
): Promise<ActionResult<{ canReview: boolean; hasReviewed: boolean }>> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: true, data: { canReview: false, hasReviewed: false } }

  if (user.id === sellerId) {
    return { success: true, data: { canReview: false, hasReviewed: false } }
  }

  const [product, existingReview] = await Promise.all([
    db.query.products.findFirst({
        where: eq(products.id, productId),
        columns: { status: true }
    }),
    db.query.reviews.findFirst({
        where: and(eq(reviews.product_id, productId), eq(reviews.reviewer_id, user.id as string)),
        columns: { id: true }
    })
  ])

  const isSold = product?.status === 'sold'
  const hasReviewed = !!existingReview

  return {
    success: true,
    data: { canReview: isSold && !hasReviewed, hasReviewed },
  }
}
