import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { updateProfileAction } from '@/actions/auth.actions'
import { ROUTES } from '@/lib/constants/routes'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export const metadata: Metadata = { title: 'Pengaturan Profil' }

export default async function ProfileSettingsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.LOGIN)

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = data as Profile | null

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <a
          href={ROUTES.PROFILE}
          className="inline-flex text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Kembali ke Profil
        </a>
        <h1 className="text-2xl font-bold text-white">Pengaturan Profil</h1>
        <p className="text-slate-400 text-sm">Perbarui informasi profilmu agar pembeli lebih mudah mengenalmu.</p>
      </div>

      <form
        action={async (formData: FormData) => {
          'use server'
          const result = await updateProfileAction(formData)
          if (result.success) {
            redirect(ROUTES.PROFILE)
          }
        }}
        className="space-y-5 bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        <div>
          <label htmlFor="full_name" className="block text-slate-300 text-sm font-medium mb-1.5">
            Nama Lengkap *
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={profile?.full_name ?? ''}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="campus_email" className="block text-slate-300 text-sm font-medium mb-1.5">
            Email Kampus
          </label>
          <input
            id="campus_email"
            name="campus_email"
            defaultValue={profile?.campus_email ?? user.email ?? ''}
            disabled
            readOnly
            className="w-full bg-white/5 border border-white/10 text-slate-400 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label htmlFor="nim" className="block text-slate-300 text-sm font-medium mb-1.5">
            NIM
          </label>
          <input
            id="nim"
            name="nim"
            defaultValue={profile?.nim ?? ''}
            placeholder="Contoh: 3123500010"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-slate-300 text-sm font-medium mb-1.5">
            Departemen
          </label>
          <input
            id="department"
            name="department"
            defaultValue={profile?.department ?? ''}
            placeholder="Contoh: Teknik Informatika"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-slate-300 text-sm font-medium mb-1.5">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={profile?.bio ?? ''}
            placeholder="Ceritakan singkat tentang dirimu atau barang yang biasa kamu jual..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label htmlFor="whatsapp_number" className="block text-slate-300 text-sm font-medium mb-1.5">
            Nomor WhatsApp
          </label>
          <input
            id="whatsapp_number"
            name="whatsapp_number"
            defaultValue={profile?.whatsapp_number ?? ''}
            placeholder="Contoh: 081234567890"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-600/25"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  )
}
