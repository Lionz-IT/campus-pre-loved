import { z } from 'zod'

const PENS_EMAIL_REGEX =
  /^[A-Za-z0-9._%+\-]+@(mhs\.pens\.ac\.id|it\.student\.pens\.ac\.id|pens\.ac\.id)$/i

export const registerSchema = z
  .object({
    full_name: z
      .string({ error: 'Nama lengkap wajib diisi' })
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),

    campus_email: z
      .string({ error: 'Email kampus wajib diisi' })
      .email('Format email tidak valid')
      .regex(
        PENS_EMAIL_REGEX,
        'Email harus menggunakan domain PENS (@mhs.pens.ac.id, @it.student.pens.ac.id, atau @pens.ac.id)',
      ),

    password: z
      .string({ error: 'Password wajib diisi' })
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),

    confirm_password: z.string({ error: 'Konfirmasi password wajib diisi' }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirm_password'],
  })

export const loginSchema = z.object({
  campus_email: z
    .string({ error: 'Email kampus wajib diisi' })
    .email('Format email tidak valid')
    .regex(PENS_EMAIL_REGEX, 'Gunakan email domain PENS kamu'),

  password: z.string({ error: 'Password wajib diisi' }).min(1, 'Password wajib diisi'),
})

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
