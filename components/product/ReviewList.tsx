import type { ReviewWithReviewer } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import StarRating from '@/components/ui/StarRating'
import EmptyState from '@/components/ui/EmptyState'

interface ReviewListProps {
  reviews: ReviewWithReviewer[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        }
        title="Belum ada review"
        description="Review akan muncul setelah transaksi selesai."
      />
    )
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <span className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
        <div>
          <StarRating value={Math.round(avgRating)} readonly size="sm" />
          <p className="text-xs text-gray-400 mt-0.5">{reviews.length} review</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="flex gap-3">
            <Avatar src={review.reviewer.avatar_url} name={review.reviewer.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{review.reviewer.full_name}</span>
                <span className="text-xs text-gray-400">{formatRelativeTime(review.created_at)}</span>
              </div>
              <StarRating value={review.rating} readonly size="sm" />
              {review.comment && (
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
