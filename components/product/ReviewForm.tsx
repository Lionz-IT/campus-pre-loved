'use client'

import { useState, useTransition } from 'react'
import { createReviewAction } from '@/features/reviews/actions'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'

interface ReviewFormProps {
  productId: string
  sellerId: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ productId, sellerId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Pilih rating terlebih dahulu')
      return
    }

    startTransition(async () => {
      const result = await createReviewAction(productId, sellerId, rating, comment || null)
      if (result.success) {
        toast.success('Review berhasil dikirim!')
        setRating(0)
        setComment('')
        onReviewSubmitted?.()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
          Komentar <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ceritakan pengalamanmu dengan penjual ini..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        disabled={isPending || rating === 0}
      >
        {isPending ? 'Mengirim...' : 'Kirim Review'}
      </Button>
    </form>
  )
}

