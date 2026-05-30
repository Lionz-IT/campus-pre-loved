'use server'

import { signIn, signOut, auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { registerSchema, loginSchema } from '@/lib/validations/auth.schema'
import type { ActionResult } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'


export async function registerAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    full_name:        formData.get('full_name'),
    department:       formData.get('department'),
    nim:              formData.get('nim'),
    campus_email:     formData.get('campus_email'),
    password:         formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { success: false, error: firstError ?? 'Data tidak valid' }
  }

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.campus_email, parsed.data.campus_email),
    columns: { id: true },
  })
  if (existing) return { success: false, error: 'Email sudah terdaftar' }

  const password_hash = await hash(parsed.data.password, 12)

  await db.insert(profiles).values({
    full_name:    parsed.data.full_name,
    department:   parsed.data.department,
    nim:          parsed.data.nim,
    campus_email: parsed.data.campus_email,
    password_hash,
  })

  return { success: true }
}


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

  try {
    await signIn('credentials', {
      campus_email: parsed.data.campus_email,
      password:     parsed.data.password,
      redirect:     false,
    })
  } catch {
    return { success: false, error: 'Email atau password salah' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}


export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false })
  revalidatePath('/', 'layout')
  redirect(ROUTES.LOGIN)
}


export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user?.id) return { success: false, error: 'Unauthorized' }

  const updates = {
    full_name:       formData.get('full_name') as string,
    nim:             formData.get('nim') as string | null,
    department:      formData.get('department') as string | null,
    bio:             formData.get('bio') as string | null,
    whatsapp_number: formData.get('whatsapp_number') as string | null,
    updated_at:      new Date(),
  }

  await db.update(profiles)
    .set(updates)
    .where(eq(profiles.id, user.id))

  revalidatePath(ROUTES.PROFILE)
  return { success: true }
}
