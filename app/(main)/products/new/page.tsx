import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createProductAction } from '@/features/products/actions'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, CAMPUS_COD_LOCATIONS } from '@/lib/constants/pens'
import { ROUTES } from '@/lib/constants/routes'
import SubmitButton from '@/components/ui/SubmitButton'
import { InputField, TextareaField, SelectField } from '@/components/ui/Input'

export const metadata: Metadata = { title: 'Jual Barang Baru' }

export default async function NewProductPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jual Barang</h1>
        <p className="text-gray-500 text-sm mt-1">Isi detail barang yang ingin kamu jual</p>
      </div>

      <form action={async (formData: FormData) => {
        'use server'
        const result = await createProductAction(formData)
        if (result.success) {
          const { redirect: redir } = await import('next/navigation')
          redir(ROUTES.PRODUCT_DETAIL(result.data!.id))
        }
      }} className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6">

        <InputField
          id="title" name="title" required
          label="Judul Iklan"
          placeholder="Contoh: Arduino Uno R3 Bekas Pakai Normal"
        />

        <InputField
          id="price" name="price" type="number" min={0}
          label="Harga (Rp)"
          placeholder="Contoh: 85000"
        />

        <SelectField id="category" name="category" required label="Kategori">
          <option value="">-- Pilih Kategori --</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </SelectField>

        <SelectField id="condition" name="condition" required label="Kondisi Barang" defaultValue="good">
          {PRODUCT_CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label} — {c.description}</option>
          ))}
        </SelectField>

        <TextareaField
          id="description" name="description" rows={4}
          label="Deskripsi"
          placeholder="Jelaskan kondisi, spesifikasi, atau catatan penting tentang barang..."
        />

        <SelectField id="campus_location" name="campus_location" label="Titik COD">
          {CAMPUS_COD_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </SelectField>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Foto Produk <span className="text-gray-400">(maks 5 foto)</span>
          </label>
          <input
            id="images" name="images" type="file" multiple accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all cursor-pointer"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="is_negotiable" value="true" defaultChecked className="w-4 h-4 rounded accent-blue-600" />
          <span className="text-gray-600 text-sm">Harga bisa nego</span>
        </label>

        <SubmitButton fullWidth size="lg" variant="accent" pendingText="Memasang iklan...">
          Pasang Iklan
        </SubmitButton>
      </form>
    </div>
  )
}

