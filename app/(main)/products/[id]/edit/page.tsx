import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateProductAction, deleteProductAction, toggleProductStatusAction } from '@/actions/product.actions'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, CAMPUS_COD_LOCATIONS } from '@/lib/constants/pens'
import { ROUTES } from '@/lib/constants/routes'
import type { Product } from '@/types'
import SubmitButton from '@/components/ui/SubmitButton'
import { InputField, TextareaField, SelectField } from '@/components/ui/Input'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: rawData } = await supabase.from('products').select('title').eq('id', id).single()
  const data = rawData as { title: string } | null
  return {
    title: data?.title ? `Edit: ${data.title}` : 'Edit Produk',
  }
}

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [{ data: { user } }, { data: rawData2, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('products').select('*').eq('id', id).single(),
  ])

  if (!user) redirect(ROUTES.LOGIN)

  const product = rawData2 as Product | null

  if (error || !product) notFound()
  if (product.seller_id !== user.id) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <a href={ROUTES.PRODUCT_DETAIL(id)} className="inline-flex text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors mb-2">
          ← Kembali ke Detail
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
        <p className="text-gray-500 text-sm mt-1">Perbarui detail barang jualanmu</p>
      </div>

      <form action={async (formData: FormData) => {
        'use server'
        const result = await updateProductAction(id, formData)
        if (result.success) {
          const { redirect: redir } = await import('next/navigation')
          redir(ROUTES.PRODUCT_DETAIL(id))
        }
      }} className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6">

        <InputField
          id="title" name="title" required
          label="Judul Iklan"
          defaultValue={product.title}
          placeholder="Contoh: Arduino Uno R3 Bekas Pakai Normal"
        />

        <div>
          <p className="block text-gray-700 text-sm font-medium mb-1.5">Tipe Transaksi <span className="text-red-500">*</span></p>
          <div className="flex gap-3">
            {[{ value: 'sell', label: 'Dijual' }, { value: 'barter', label: 'Barter' }].map((t) => (
              <label key={t.value} className="flex-1 cursor-pointer">
                <input type="radio" name="listing_type" value={t.value} defaultChecked={product.listing_type === t.value} className="sr-only peer" />
                <div className="text-center py-3 rounded-xl border border-gray-200 bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600 text-gray-500 transition-all text-sm font-medium">
                  {t.value === 'sell' ? 'Rp' : '⇄'} {t.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <InputField
          id="price" name="price" type="number" min={0}
          label="Harga (Rp)"
          defaultValue={product.price ?? ''}
          placeholder="Contoh: 85000"
          hint="Kosongkan untuk barter"
        />

        <SelectField id="category" name="category" required label="Kategori" defaultValue={product.category}>
          <option value="">-- Pilih Kategori --</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </SelectField>

        <SelectField id="condition" name="condition" required label="Kondisi Barang" defaultValue={product.condition}>
          {PRODUCT_CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label} — {c.description}</option>
          ))}
        </SelectField>

        <TextareaField
          id="description" name="description" rows={4}
          label="Deskripsi"
          defaultValue={product.description ?? ''}
          placeholder="Jelaskan kondisi, spesifikasi, atau catatan penting tentang barang..."
        />

        <SelectField id="campus_location" name="campus_location" label="Titik COD" defaultValue={product.campus_location ?? ''}>
          {CAMPUS_COD_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </SelectField>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="is_negotiable" value="true" defaultChecked={product.is_negotiable} className="w-4 h-4 rounded accent-blue-600" />
          <span className="text-gray-600 text-sm">Harga bisa nego</span>
        </label>

        <SubmitButton fullWidth size="lg" pendingText="Menyimpan...">
          Simpan Perubahan
        </SubmitButton>
      </form>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Status Barang</h2>
        <p className="text-sm text-gray-500">
          Status saat ini: <span className={product.status === 'available' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{product.status === 'available' ? 'Tersedia' : 'Terjual'}</span>
        </p>
        <form action={async () => {
          'use server'
          const newStatus = product.status === 'available' ? 'sold' : 'available'
          await toggleProductStatusAction(id, newStatus as 'available' | 'sold')
          const { redirect: redir } = await import('next/navigation')
          redir(ROUTES.PRODUCT_EDIT(id))
        }}>
          {product.status === 'available' ? (
            <SubmitButton fullWidth size="lg" variant="accent" pendingText="Memproses...">
              Tandai Sudah Terjual
            </SubmitButton>
          ) : (
            <SubmitButton fullWidth size="lg" pendingText="Memproses...">
              Kembalikan ke Tersedia
            </SubmitButton>
          )}
        </form>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <form action={async () => {
          'use server'
          await deleteProductAction(id)
        }}>
          <SubmitButton variant="danger" fullWidth size="lg" pendingText="Menghapus...">
            Hapus Produk
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
