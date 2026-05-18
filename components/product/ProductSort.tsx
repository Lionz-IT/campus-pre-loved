'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Terbaru' },
  { value: 'price_asc',  label: 'Termurah' },
  { value: 'price_desc', label: 'Termahal' },
] as const

export default function ProductSort() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'newest'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value !== 'newest') {
      params.set('sort', e.target.value)
    } else {
      params.delete('sort')
    }
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 relative">
      <span className="text-sm text-gray-600 font-medium">Urutkan:</span>
      <div className="relative">
        <select 
          value={currentSort}
          onChange={handleChange}
          className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1A57] focus:border-transparent cursor-pointer font-medium"
        >
          {SORT_OPTIONS.map(opt => (
             <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  )
}
