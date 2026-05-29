'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { wishlists, products, profiles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/lib/constants/routes'
import type { ActionResult } from '@/types'


export async function toggleWishlistAction(productId: string): Promise<ActionResult<{ wishlisted: boolean }>> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false, error: 'Kamu harus login terlebih dahulu' }

  const existing = await db.query.wishlists.findFirst({
    where: and(eq(wishlists.user_id, user.id as string), eq(wishlists.product_id, productId)),
  })

  if (existing) {
    await db.delete(wishlists).where(eq(wishlists.id, existing.id))
    revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
    return { success: true, data: { wishlisted: false } }
  }

  await db.insert(wishlists).values({ user_id: user.id as string, product_id: productId })
  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  return { success: true, data: { wishlisted: true } }
}


export async function checkWishlistAction(productId: string): Promise<ActionResult<{ wishlisted: boolean }>> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: true, data: { wishlisted: false } }

  const data = await db.query.wishlists.findFirst({
    where: and(eq(wishlists.user_id, user.id as string), eq(wishlists.product_id, productId)),
  })

  return { success: true, data: { wishlisted: !!data } }
}


export async function getWishlistAction() {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: false as const, error: 'Kamu harus login terlebih dahulu' }

  const data = await db.query.wishlists.findMany({
    where: eq(wishlists.user_id, user.id as string),
    orderBy: desc(wishlists.created_at),
    with: {
      product: {
        with: {
          seller: {
            columns: { id: true, full_name: true, avatar_url: true }
          }
        }
      }
    }
  })

  const productsData = (data ?? []).map((w) => w.product)

  return { success: true as const, data: productsData }
}


export async function getWishlistIdsAction(): Promise<ActionResult<string[]>> {
  const session = await auth()
  const user = session?.user
  if (!user) return { success: true, data: [] }

  const data = await db.select({ product_id: wishlists.product_id })
    .from(wishlists)
    .where(eq(wishlists.user_id, user.id as string))

  return { success: true, data: (data ?? []).map((w) => w.product_id) }
}
