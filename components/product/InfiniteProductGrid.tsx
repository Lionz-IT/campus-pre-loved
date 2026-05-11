'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { getMarketplaceFeedAction } from '@/actions/product.actions'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { ProductCard } from '@/components/ui/Card'
import type { ProductWithSeller } from '@/types'

interface InfiniteProductGridProps {
  initialProducts: ProductWithSeller[]
  filters: {
    category?: string
    search?: string
    sort?: string
    condition?: string
  }
  pageSize: number
}

export default function InfiniteProductGrid({ initialProducts, filters, pageSize }: InfiniteProductGridProps) {
  const [products, setProducts] = useState(initialProducts)
  const [page, setPage] = useState(2)
  const [hasMore, setHasMore] = useState(initialProducts.length >= pageSize)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProducts(initialProducts)
    setPage(2)
    setHasMore(initialProducts.length >= pageSize)
  }, [initialProducts, pageSize])

  const loadMore = useCallback(() => {
    if (isPending || !hasMore) return
    startTransition(async () => {
      const result = await getMarketplaceFeedAction({
        category:  filters.category,
        search:    filters.search,
        sort:      filters.sort,
        condition: filters.condition,
        page,
        limit:     pageSize,
      })
      if (result.success && result.data) {
        if (result.data.length < pageSize) setHasMore(false)
        if (result.data.length > 0) {
          setProducts((prev) => [...prev, ...result.data!])
          setPage((p) => p + 1)
        } else {
          setHasMore(false)
        }
      }
    })
  }, [isPending, hasMore, page, pageSize, filters, startTransition])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.price}
            listingType={product.listing_type}
            imageUrl={product.image_urls[0]}
            sellerName={product.seller.full_name}
            timeAgo={formatRelativeTime(product.created_at)}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {isPending && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memuat lebih banyak...
            </div>
          )}
        </div>
      )}
    </>
  )
}
