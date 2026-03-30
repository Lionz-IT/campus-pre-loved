'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { registerSchema, loginSchema } from '@/lib/validations/auth.schema'
import type { ActionResult } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    full_name:        formData.get('full_name'),
    campus_email:     formData.get('campus_email'),
    password:         formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  }

  // Layer 1: Validasi Zod (termasuk domain email PENS)
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { success: false, error: firstError ?? 'Data tidak valid' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    email:    parsed.data.campus_email,
    password: parsed.data.password,
    options: {
      data:             { full_name: parsed.data.full_name },
      emailRedirectTo:  `${process.env.NEXT_PUBLIC_SITE_URL}${ROUTES.AUTH_CALLBACK}`,
    },
  })

  if (error) return { success: false, error: error.message }
  // Trigger di DB akan otomatis membuat row di public.profiles
  return { success: true }
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    campus_email: formData.get('campus_email'),
    password:     formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { success: false, error: firstError ?? 'Data tidak valid' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email:    parsed.data.campus_email,
    password: parsed.data.password,
  })

  if (error) return { success: false, error: 'Email atau password salah' }

  revalidatePath('/', 'layout')
  redirect(ROUTES.HOME)
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect(ROUTES.LOGIN)
}

// ─── Update Profile ───────────────────────────────────────────────────────────
export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const updates = {
    full_name:       formData.get('full_name') as string,
    nim:             formData.get('nim') as string | null,
    department:      formData.get('department') as string | null,
    bio:             formData.get('bio') as string | null,
    whatsapp_number: formData.get('whatsapp_number') as string | null,
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath(ROUTES.PROFILE)
  return { success: true }
}
