import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createProductAction } from '@/actions/product.actions'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, CAMPUS_COD_LOCATIONS } from '@/lib/constants/pens'
import { ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = { title: 'Jual Barang Baru' }

export default async function NewProductPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">📦 Jual Barang</h1>
        <p className="text-slate-400 text-sm mt-1">Isi detail barang yang ingin kamu jual atau barter</p>
      </div>

      <form action={async (formData: FormData) => {
        'use server'
        const result = await createProductAction(formData)
        if (result.success) {
          const { redirect: redir } = await import('next/navigation')
          redir(ROUTES.PRODUCT_DETAIL(result.data!.id))
        }
      }} className="space-y-5">

        {/* Judul */}
        <div>
          <label htmlFor="title" className="block text-slate-300 text-sm font-medium mb-1.5">
            Judul Iklan *
          </label>
          <input
            id="title" name="title" required
            placeholder="Contoh: Arduino Uno R3 Bekas Pakai Normal"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Tipe Listing */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5">Tipe Transaksi *</label>
          <div className="flex gap-3">
            {[{ value: 'sell', label: '💰 Dijual' }, { value: 'barter', label: '🔄 Barter' }].map((t) => (
              <label key={t.value} className="flex-1 cursor-pointer">
                <input type="radio" name="listing_type" value={t.value} defaultChecked={t.value === 'sell'} className="sr-only peer" />
                <div className="text-center py-3 rounded-xl border border-white/10 bg-white/5 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:text-blue-400 text-slate-400 transition-all text-sm font-medium">
                  {t.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Harga */}
        <div>
          <label htmlFor="price" className="block text-slate-300 text-sm font-medium mb-1.5">
            Harga (Rp) <span className="text-slate-500">— kosongkan untuk barter</span>
          </label>
          <input
            id="price" name="price" type="number" min="0"
            placeholder="Contoh: 85000"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Kategori */}
        <div>
          <label htmlFor="category" className="block text-slate-300 text-sm font-medium mb-1.5">Kategori *</label>
          <select
            id="category" name="category" required
            className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">-- Pilih Kategori --</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
        </div>

        {/* Kondisi */}
        <div>
          <label htmlFor="condition" className="block text-slate-300 text-sm font-medium mb-1.5">Kondisi Barang *</label>
          <select
            id="condition" name="condition" required defaultValue="good"
            className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            {PRODUCT_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label} — {c.description}</option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div>
          <label htmlFor="description" className="block text-slate-300 text-sm font-medium mb-1.5">Deskripsi</label>
          <textarea
            id="description" name="description" rows={4}
            placeholder="Jelaskan kondisi, spesifikasi, atau catatan penting tentang barang..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Lokasi COD */}
        <div>
          <label htmlFor="campus_location" className="block text-slate-300 text-sm font-medium mb-1.5">📍 Titik COD</label>
          <select
            id="campus_location" name="campus_location"
            className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            {CAMPUS_COD_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Foto */}
        <div>
          <label htmlFor="images" className="block text-slate-300 text-sm font-medium mb-1.5">
            Foto Produk <span className="text-slate-500">(maks 5 foto)</span>
          </label>
          <input
            id="images" name="images" type="file" multiple accept="image/*"
            className="w-full bg-white/5 border border-white/10 text-slate-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs"
          />
        </div>

        {/* Bisa Nego */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="is_negotiable" value="true" defaultChecked className="w-4 h-4 rounded accent-blue-600" />
          <span className="text-slate-300 text-sm">Harga bisa nego</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-600/25"
        >
          🚀 Pasang Iklan
        </button>
      </form>
    </div>
  )
}
