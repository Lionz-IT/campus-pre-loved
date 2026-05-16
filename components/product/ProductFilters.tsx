'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '@/lib/constants/pens'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Terbaru' },
  { value: 'price_asc',  label: 'Termurah' },
  { value: 'price_desc', label: 'Termahal' },
] as const

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [category, setCategory] = useState<string>(searchParams.get('category') || '')
  const [condition, setCondition] = useState<string>(searchParams.get('condition') || '')
  const [sort, setSort] = useState<string>(searchParams.get('sort') || 'newest')
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('max_price') || '')

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (category) params.set('category', category)
    else params.delete('category')
    
    if (condition) params.set('condition', condition)
    else params.delete('condition')
    
    if (sort && sort !== 'newest') params.set('sort', sort)
    else params.delete('sort')
    
    if (minPrice) params.set('min_price', minPrice)
    else params.delete('min_price')
    
    if (maxPrice) params.set('max_price', maxPrice)
    else params.delete('max_price')
    
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }, [category, condition, sort, minPrice, maxPrice, searchParams, router])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    let hasChanges = false;
    
    if ((params.get('category') || '') !== category) hasChanges = true;
    if ((params.get('condition') || '') !== condition) hasChanges = true;
    if ((params.get('sort') || 'newest') !== sort) hasChanges = true;

    if (hasChanges) {
        applyFilters();
    }
  }, [category, condition, sort, applyFilters, searchParams]);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semua Barang</h1>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <span className="text-sm text-gray-600 font-medium">Urutkan:</span>
          <div className="relative">
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
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
      </div>

      <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
        <div>
          <h3 className="font-bold text-[#4C1A57] mb-4 tracking-wide flex justify-between items-center">
            Kategori
            {category && (
              <button onClick={() => setCategory('')} className="text-xs text-gray-400 font-normal hover:text-[#4C1A57]">Reset</button>
            )}
          </h3>
          <div className="space-y-3">
             {PRODUCT_CATEGORIES.map(cat => (
               <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                 <div className="relative flex items-center justify-center">
                   <input 
                    type="radio" 
                    name="category"
                    checked={category === cat.value}
                    onChange={() => setCategory(cat.value)}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#4C1A57] checked:border-[#4C1A57] transition-colors" 
                  />
                   <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </div>
                 <span className="text-sm text-gray-700 group-hover:text-[#4C1A57] transition-colors">{cat.label}</span>
               </label>
             ))}
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="font-bold text-[#4C1A57] mb-4 tracking-wide flex justify-between items-center">
            Rentang Harga
            {(minPrice || maxPrice) && (
              <button onClick={() => {
                setMinPrice('')
                setMaxPrice('')
                const params = new URLSearchParams(searchParams.toString())
                params.delete('min_price')
                params.delete('max_price')
                router.push(`/products?${params.toString()}`)
              }} className="text-xs text-gray-400 font-normal hover:text-[#4C1A57]">Reset</button>
            )}
          </h3>
          <div className="flex items-center gap-2 mb-4">
             <div className="relative flex-1">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
               <input 
                type="number" 
                placeholder="MIN" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4C1A57] focus:border-transparent outline-none" 
              />
             </div>
             <span className="text-gray-400 font-medium">-</span>
             <div className="relative flex-1">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
               <input 
                type="number" 
                placeholder="MAX" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4C1A57] focus:border-transparent outline-none" 
              />
             </div>
          </div>
          <button 
            onClick={applyFilters}
            className="w-full py-2 px-4 bg-white border-2 border-[#4C1A57] text-[#4C1A57] rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors duration-200"
          >
            Terapkan Harga
          </button>
        </div>

        <hr className="border-gray-200" />

        <div>
           <h3 className="font-bold text-[#4C1A57] mb-4 tracking-wide">Kondisi Barang</h3>
           <div className="space-y-3">
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="radio" 
                    name="kondisi" 
                    checked={!condition}
                    onChange={() => setCondition('')}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer checked:border-[#4C1A57] transition-colors" 
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#4C1A57] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-sm text-gray-700 group-hover:text-[#4C1A57] transition-colors font-medium">Semua Kondisi</span>
             </label>
             {PRODUCT_CONDITIONS.map(cond => (
               <label key={cond.value} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="radio" 
                    name="kondisi" 
                    checked={condition === cond.value}
                    onChange={() => setCondition(cond.value)}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer checked:border-[#4C1A57] transition-colors" 
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#4C1A57] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-sm text-gray-700 group-hover:text-[#4C1A57] transition-colors">{cond.label}</span>
               </label>
             ))}
           </div>
        </div>
      </aside>
    </>
  )
}
