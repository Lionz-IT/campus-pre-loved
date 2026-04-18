'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

export default function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(defaultValue ?? '')
  const debouncedQuery = useDebounce(query, 350)

  const buildUrl = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.trim()) {
        params.set('q', q.trim())
      } else {
        params.delete('q')
      }
      const qs = params.toString()
      return `/products${qs ? `?${qs}` : ''}`
    },
    [searchParams],
  )

  useEffect(() => {
    // Skip the initial render — only navigate on actual user input changes
    if (debouncedQuery === (defaultValue ?? '')) return
    router.push(buildUrl(debouncedQuery))
  }, [debouncedQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama produk..."
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
        />
      </div>
      <button
        type="button"
        onClick={() => router.push(buildUrl(query))}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
      >
        Cari
      </button>
    </div>
  )
}
