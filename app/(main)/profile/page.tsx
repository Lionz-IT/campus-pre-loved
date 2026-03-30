import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { PRODUCT_STATUS_LABELS } from '@/lib/constants/pens'
import { formatPrice, formatRelativeTime, getInitials } from '@/lib/utils'
import type { Product, Profile } from '@/types'

export const metadata: Metadata = { title: 'Profil Saya' }

const STATUS_COLOR_CLASSES = {
  green: 'bg-green-600/20 text-green-300 border border-green-500/30',
  yellow: 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30',
  gray: 'bg-slate-600/20 text-slate-300 border border-slate-500/30',
} as const

export default async function MyProfilePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.LOGIN)

  const [{ data: profileData }, { data: productsData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileData as Profile | null
  const listings = (productsData ?? []) as Product[]
  const displayName = profile?.full_name ?? user.email?.split('@')[0] ?? 'Pengguna'

  return (
    <div className="space-y-8">
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xl">
                {getInitials(displayName)}
              </div>
            )}

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  {profile?.department || 'Departemen belum diisi'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  NIM: {profile?.nim || '-'}
                </span>
              </div>
              <p className="text-slate-400 text-sm max-w-xl">{profile?.bio || 'Belum menambahkan bio.'}</p>
              <p className="text-slate-400 text-sm">WhatsApp: {profile?.whatsapp_number || '-'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <a
              href={ROUTES.PROFILE_SETTINGS}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all"
            >
              Edit Profil
            </a>

            <form
              action={async () => {
                'use server'
                const { logoutAction } = await import('@/actions/auth.actions')
                await logoutAction()
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-sm font-medium transition-all border border-red-600/30"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Total Listing</p>
            <p className="text-white text-2xl font-bold">{profile?.total_listings ?? 0}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Total Terjual</p>
            <p className="text-white text-2xl font-bold">{profile?.total_sold ?? 0}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Rating</p>
            <p className="text-white text-2xl font-bold">{profile?.rating?.toFixed(1) ?? '0.0'}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Listing Saya</h2>
          <span className="text-sm text-slate-400">{listings.length} item</span>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-400">
            Kamu belum punya listing. Yuk pasang barang pertamamu!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((product) => {
              const status = PRODUCT_STATUS_LABELS[product.status]

              return (
                <a
                  key={product.id}
                  href={ROUTES.PRODUCT_DETAIL(product.id)}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="aspect-square bg-slate-800 overflow-hidden">
                    {product.image_urls[0] ? (
                      <img
                        src={product.image_urls[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">📷</div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <span
                      className={`inline-flex text-[11px] px-2 py-1 rounded-full font-medium ${STATUS_COLOR_CLASSES[status.color]}`}
                    >
                      {status.label}
                    </span>
                    <p className="text-white font-medium text-sm line-clamp-2 leading-snug">{product.title}</p>
                    <p className="text-blue-400 font-bold text-base">
                      {product.listing_type === 'barter' ? '🔄 Barter' : formatPrice(product.price)}
                    </p>
                    <p className="text-slate-500 text-xs">{formatRelativeTime(product.created_at)}</p>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
