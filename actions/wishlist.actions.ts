'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/lib/constants/routes'
import type { ActionResult, WishlistProduct } from '@/types'


export async function toggleWishlistAction(productId: string): Promise<ActionResult<{ wishlisted: boolean }>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Kamu harus login terlebih dahulu' }

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
    revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
    return { success: true, data: { wishlisted: false } }
  }

  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: user.id, product_id: productId })

  if (error) return { success: false, error: error.message }
  revalidatePath(ROUTES.PRODUCT_DETAIL(productId))
  return { success: true, data: { wishlisted: true } }
}


export async function checkWishlistAction(productId: string): Promise<ActionResult<{ wishlisted: boolean }>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: true, data: { wishlisted: false } }

  const { data, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  return { success: true, data: { wishlisted: !!data } }
}


export async function getWishlistAction(): Promise<ActionResult<WishlistProduct[]>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Kamu harus login terlebih dahulu' }

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      product_id,
      products:product_id (
        *,
        seller:profiles!products_seller_id_fkey (id, full_name, avatar_url)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  const products = (data ?? [])
    .map((w: Record<string, unknown>) => w.products)
    .filter(Boolean) as WishlistProduct[]

  return { success: true, data: products }
}


export async function getWishlistIdsAction(): Promise<ActionResult<string[]>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: true, data: [] }

  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []).map((w) => w.product_id) }
}
