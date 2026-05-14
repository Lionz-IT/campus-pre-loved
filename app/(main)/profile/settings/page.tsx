import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { updateProfileAction } from '@/features/auth/actions'
import { ROUTES } from '@/lib/constants/routes'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import SubmitButton from '@/components/ui/SubmitButton'
import { InputField, TextareaField } from '@/components/ui/Input'

export const metadata: Metadata = { title: 'Pengaturan Profil' }

export default async function ProfileSettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.LOGIN)

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = data as Profile | null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <a
          href={ROUTES.PROFILE}
          className="inline-flex text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          ← Kembali ke Profil
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
        <p className="text-gray-500 text-sm">Perbarui informasi profilmu agar pembeli lebih mudah mengenalmu.</p>
      </div>

      <form
        action={async (formData: FormData) => {
          'use server'
          const result = await updateProfileAction(formData)
          if (result.success) {
            redirect(ROUTES.PROFILE)
          }
        }}
        className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6"
      >
        <InputField
          id="full_name" name="full_name" required
          label="Nama Lengkap"
          defaultValue={profile?.full_name ?? ''}
        />

        <InputField
          id="campus_email" name="campus_email"
          label="Email Kampus"
          defaultValue={profile?.campus_email ?? user.email ?? ''}
          disabled readOnly
          hint="Email kampus tidak bisa diubah"
        />

        <InputField
          id="nim" name="nim"
          label="NRP"
          defaultValue={profile?.nim ?? ''}
          placeholder="Contoh: 3123500010"
        />

        <InputField
          id="department" name="department"
          label="Departemen"
          defaultValue={profile?.department ?? ''}
          placeholder="Contoh: Teknik Informatika"
        />

        <TextareaField
          id="bio" name="bio" rows={4}
          label="Bio"
          defaultValue={profile?.bio ?? ''}
          placeholder="Ceritakan singkat tentang dirimu atau barang yang biasa kamu jual..."
        />

        <InputField
          id="whatsapp_number" name="whatsapp_number"
          label="Nomor WhatsApp"
          defaultValue={profile?.whatsapp_number ?? ''}
          placeholder="Contoh: 081234567890"
        />

        <SubmitButton fullWidth size="lg" pendingText="Menyimpan...">
          Simpan Perubahan
        </SubmitButton>
      </form>
    </div>
  )
}

