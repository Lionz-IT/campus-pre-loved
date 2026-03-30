// ─── PENS Email Domains ───────────────────────────────────────────────────────
export const PENS_EMAIL_DOMAINS = [
  '@mhs.pens.ac.id',
  '@it.student.pens.ac.id',
  '@pens.ac.id',
] as const

export type PensEmailDomain = (typeof PENS_EMAIL_DOMAINS)[number]

// ─── COD Meeting Points di Area PENS ─────────────────────────────────────────
export const CAMPUS_COD_LOCATIONS = [
  'Lobby Gedung A (Teknik Elektro)',
  'Kantin Teknik PENS',
  'Perpustakaan PENS',
  'Lab Elektronika Dasar Lt. 2',
  'Lab Komputer Gedung D',
  'Parkiran Gedung Rektorat',
  'Masjid At-Taqwa PENS',
  'Ruang Himpunan Mahasiswa',
  'Lapangan Basket Dalam',
  'Pintu Gerbang Utama',
] as const

export const PENS_EMAIL_REGEX =
  /^[A-Za-z0-9._%+\-]+@(mhs\.pens\.ac\.id|it\.student\.pens\.ac\.id|pens\.ac\.id)$/i

// ─── Kategori Produk ──────────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  { value: 'microcontroller',      label: 'Mikrokontroler',       emoji: '🤖' },
  { value: 'electronic_component', label: 'Komponen Elektronika', emoji: '⚡' },
  { value: 'module',               label: 'Modul',                emoji: '🔌' },
  { value: 'tool',                 label: 'Alat & Perkakas',      emoji: '🔧' },
  { value: 'book_module',          label: 'Buku & Modul Kuliah',  emoji: '📚' },
  { value: 'laptop_accessory',     label: 'Aksesoris Laptop',     emoji: '💻' },
  { value: 'clothing',             label: 'Pakaian & Merchandise', emoji: '👕' },
  { value: 'stationery',           label: 'Alat Tulis & Gambar',  emoji: '✏️' },
  { value: 'other',                label: 'Lainnya',              emoji: '📦' },
] as const

export type ProductCategoryValue = (typeof PRODUCT_CATEGORIES)[number]['value']

// ─── Kondisi Barang ───────────────────────────────────────────────────────────
export const PRODUCT_CONDITIONS = [
  { value: 'new',       label: 'Baru',             description: 'Belum pernah dipakai, masih ada segel' },
  { value: 'like_new',  label: 'Seperti Baru',     description: 'Pernah dipakai 1-2x, tidak ada cacat' },
  { value: 'good',      label: 'Baik',             description: 'Bekas pakai normal, berfungsi penuh' },
  { value: 'fair',      label: 'Cukup',            description: 'Ada sedikit cacat minor, masih berfungsi' },
  { value: 'poor',      label: 'Kurang',           description: 'Ada kerusakan, perlu perbaikan' },
] as const

export type ProductConditionValue = (typeof PRODUCT_CONDITIONS)[number]['value']

// ─── Status Produk (State Machine) ───────────────────────────────────────────
export const PRODUCT_STATUS_LABELS = {
  available: { label: 'Tersedia',    color: 'green'  },
  booked:    { label: 'Di-booking',  color: 'yellow' },
  sold:      { label: 'Terjual',     color: 'gray'   },
} as const
