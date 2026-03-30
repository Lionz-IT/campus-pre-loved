import { z } from 'zod'

export const productSchema = z
  .object({
    title: z
      .string({ error: 'Judul produk wajib diisi' })
      .min(3, 'Judul minimal 3 karakter')
      .max(120, 'Judul maksimal 120 karakter'),

    description: z
      .string()
      .max(2000, 'Deskripsi maksimal 2000 karakter')
      .optional(),

    price: z.coerce
      .number({ error: 'Harga harus berupa angka' })
      .int('Harga harus bilangan bulat')
      .positive('Harga harus lebih dari 0')
      .optional(),

    listing_type: z.enum(['sell', 'barter'], {
      error: 'Tipe listing wajib dipilih',
    }),

    category: z.enum(
      [
        'microcontroller',
        'electronic_component',
        'module',
        'tool',
        'book_module',
        'laptop_accessory',
        'clothing',
        'stationery',
        'other',
      ],
      { error: 'Kategori wajib dipilih' },
    ),

    condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor'], {
      error: 'Kondisi barang wajib dipilih',
    }),

    campus_location: z.string().optional(),

    is_negotiable: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.listing_type === 'sell') return data.price !== undefined && data.price > 0
      return true
    },
    {
      message: 'Harga wajib diisi untuk tipe jual',
      path: ['price'],
    },
  )

export const offerSchema = z.object({
  offered_price: z.coerce
    .number({ error: 'Harga tawar harus berupa angka' })
    .int()
    .positive('Harga tawar harus lebih dari 0'),

  original_price: z.number().int().positive().optional(),

  note: z.string().max(200, 'Catatan maksimal 200 karakter').optional(),
})

export const offerAcceptSchema = z.object({
  agreed_price: z.coerce.number().int().positive(),
  meet_point: z.string().min(1, 'Titik COD wajib diisi'),
  meet_time: z.string().min(1, 'Waktu COD wajib diisi'),
})

export const offerRejectSchema = z.object({
  counter_offer: z.coerce.number().int().positive().optional(),
  reason: z.string().max(200).optional(),
})

export type ProductFormData  = z.infer<typeof productSchema>
export type OfferPayload      = z.infer<typeof offerSchema>
export type OfferAcceptPayload = z.infer<typeof offerAcceptSchema>
export type OfferRejectPayload = z.infer<typeof offerRejectSchema>
