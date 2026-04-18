import Skeleton from '@/components/ui/Skeleton'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

export default function HomeLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-64 rounded-3xl" />

      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
