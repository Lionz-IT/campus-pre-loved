'use client'

import { useState, useTransition } from 'react'
import { toggleWishlistAction } from '@/actions/wishlist.actions'

interface WishlistButtonProps {
  productId: string
  initialWishlisted: boolean
  size?: 'sm' | 'md'
}

export default function WishlistButton({ productId, initialWishlisted, size = 'md' }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isPending, startTransition] = useTransition()

  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleWishlistAction(productId)
      if (result.success && result.data) {
        setWishlisted(result.data.wishlisted)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={wishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
      className={`${buttonSize} flex items-center justify-center rounded-full transition-all duration-200 ${
        wishlisted
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <svg
        className={`${iconSize} transition-transform duration-200 ${isPending ? 'scale-90' : wishlisted ? 'scale-110' : 'scale-100'}`}
        viewBox="0 0 24 24"
        fill={wishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={wishlisted ? 0 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
