import { clsx, type ClassValue } from 'clsx'

// ─── Tailwind class merger ────────────────────────────────────────────────────
// Install clsx jika belum: npm install clsx
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// ─── Format harga ke Rupiah ───────────────────────────────────────────────────
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Harga Barter'
  return new Intl.NumberFormat('id-ID', {
    style:    'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Format tanggal relatif (e.g. "3 jam lalu") ──────────────────────────────
export function formatRelativeTime(date: string | Date): string {
  const now   = new Date()
  const past  = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs  = Math.floor(diffMs / 1000)
  const diffMins  = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays  = Math.floor(diffHours / 24)

  if (diffSecs  < 60)   return 'Baru saja'
  if (diffMins  < 60)   return `${diffMins} menit lalu`
  if (diffHours < 24)   return `${diffHours} jam lalu`
  if (diffDays  < 7)    return `${diffDays} hari lalu`
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(past)
}

// ─── Format tanggal lengkap ───────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day:    'numeric',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// ─── Generate nama file unik untuk Supabase Storage ──────────────────────────
export function generateStorageFileName(userId: string, originalName: string): string {
  const ext  = originalName.split('.').pop() ?? 'jpg'
  const rand = Math.random().toString(36).slice(2, 8)
  const ts   = Date.now()
  // Path: {userId}/{timestamp}_{random}.{ext}
  // → matching Storage RLS policy: foldername[0] = userId
  return `${userId}/${ts}_${rand}.${ext}`
}

// ─── Truncate teks panjang ────────────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

// ─── Ekstrak inisial nama untuk Avatar fallback ───────────────────────────────
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}
