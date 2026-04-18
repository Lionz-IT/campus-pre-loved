import { ProfileSkeleton } from '@/components/ui/Skeleton'
import Skeleton from '@/components/ui/Skeleton'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <ProfileSkeleton />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
