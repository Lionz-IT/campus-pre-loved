
export const PENS_EMAIL_DOMAINS = [
  '@mhs.pens.ac.id',
  '@it.student.pens.ac.id',
  '@pens.ac.id',
] as const

export type PensEmailDomain = (typeof PENS_EMAIL_DOMAINS)[number]


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


export const PRODUCT_CATEGORIES = [
  { value: 'microcontroller',      label: 'Mikrokontroler',       icon: 'cpu'         },
  { value: 'electronic_component', label: 'Komponen Elektronika', icon: 'zap'         },
  { value: 'module',               label: 'Modul',                icon: 'circuit'     },
  { value: 'tool',                 label: 'Alat & Perkakas',      icon: 'wrench'      },
  { value: 'book_module',          label: 'Buku & Modul Kuliah',  icon: 'book'        },
  { value: 'laptop_accessory',     label: 'Aksesoris Laptop',     icon: 'laptop'      },
  { value: 'clothing',             label: 'Pakaian & Merchandise', icon: 'shirt'      },
  { value: 'stationery',           label: 'Alat Tulis & Gambar',  icon: 'pencil'      },
  { value: 'other',                label: 'Lainnya',              icon: 'package'     },
] as const

export type ProductCategoryValue = (typeof PRODUCT_CATEGORIES)[number]['value']


export const PRODUCT_CONDITIONS = [
  { value: 'new',       label: 'Baru',             description: 'Belum pernah dipakai, masih ada segel' },
  { value: 'like_new',  label: 'Seperti Baru',     description: 'Pernah dipakai 1-2x, tidak ada cacat' },
  { value: 'good',      label: 'Baik',             description: 'Bekas pakai normal, berfungsi penuh' },
  { value: 'fair',      label: 'Cukup',            description: 'Ada sedikit cacat minor, masih berfungsi' },
  { value: 'poor',      label: 'Kurang',           description: 'Ada kerusakan, perlu perbaikan' },
] as const

export type ProductConditionValue = (typeof PRODUCT_CONDITIONS)[number]['value']


export const PRODUCT_STATUS_LABELS = {
  available: { label: 'Tersedia',    color: 'green'  },
  sold:      { label: 'Terjual',     color: 'gray'   },
} as const
