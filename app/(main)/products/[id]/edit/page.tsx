import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateProductAction, deleteProductAction } from '@/actions/product.actions'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, CAMPUS_COD_LOCATIONS } from '@/lib/constants/pens'
import { ROUTES } from '@/lib/constants/routes'
import type { Product } from '@/types'

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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: rawData2, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
    
  const product = rawData2 as Product | null

  if (error || !product) notFound()
  if (product.seller_id !== user.id) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">✏️ Edit Produk</h1>
        <p className="text-slate-400 text-sm mt-1">Perbarui detail barang jualanmu</p>
      </div>

      <form action={async (formData: FormData) => {
        'use server'
        const result = await updateProductAction(id, formData)
        if (result.success) {
          const { redirect: redir } = await import('next/navigation')
          redir(ROUTES.PRODUCT_DETAIL(id))
        }
      }} className="space-y-5">

        <div>
          <label htmlFor="title" className="block text-slate-300 text-sm font-medium mb-1.5">
            Judul Iklan *
          </label>
          <input
            id="title" name="title" required
            defaultValue={product.title}
            placeholder="Contoh: Arduino Uno R3 Bekas Pakai Normal"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5">Tipe Transaksi *</label>
          <div className="flex gap-3">
            {[{ value: 'sell', label: '💰 Dijual' }, { value: 'barter', label: '🔄 Barter' }].map((t) => (
              <label key={t.value} className="flex-1 cursor-pointer">
                <input type="radio" name="listing_type" value={t.value} defaultChecked={product.listing_type === t.value} className="sr-only peer" />
                <div className="text-center py-3 rounded-xl border border-white/10 bg-white/5 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:text-blue-400 text-slate-400 transition-all text-sm font-medium">
                  {t.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="price" className="block text-slate-300 text-sm font-medium mb-1.5">
            Harga (Rp) <span className="text-slate-500">— kosongkan untuk barter</span>
          </label>
          <input
            id="price" name="price" type="number" min="0"
            defaultValue={product.price ?? ''}
            placeholder="Contoh: 85000"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-slate-300 text-sm font-medium mb-1.5">Kategori *</label>
          <select
            id="category" name="category" required
            defaultValue={product.category}
            className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">-- Pilih Kategori --</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="block text-slate-300 text-sm font-medium mb-1.5">Kondisi Barang *</label>
          <select
            id="condition" name="condition" required defaultValue={product.condition}
            className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            {PRODUCT_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label} — {c.description}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-slate-300 text-sm font-medium mb-1.5">Deskripsi</label>
          <textarea
            id="description" name="description" rows={4}
            defaultValue={product.description ?? ''}
            placeholder="Jelaskan kondisi, spesifikasi, atau catatan penting tentang barang..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label htmlFor="campus_location" className="block text-slate-300 text-sm font-medium mb-1.5">📍 Titik COD</label>
          <select
            id="campus_location" name="campus_location"
            defaultValue={product.campus_location ?? ''}
            className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            {CAMPUS_COD_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="is_negotiable" value="true" defaultChecked={product.is_negotiable} className="w-4 h-4 rounded accent-blue-600" />
          <span className="text-slate-300 text-sm">Harga bisa nego</span>
        </label>

        <button
          type="submit"
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-600/25"
        >
          💾 Simpan Perubahan
        </button>
      </form>

      <div className="pt-6 border-t border-white/10 mt-8">
        <form action={async () => {
          'use server'
          await deleteProductAction(id)
        }}>
          <button
            type="submit"
            className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium text-sm transition-all border border-red-600/30"
          >
            🗑️ Hapus Produk
          </button>
        </form>
      </div>
    </div>
  )
}
