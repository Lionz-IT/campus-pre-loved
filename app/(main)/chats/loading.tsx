import { ChatItemSkeleton } from '@/components/ui/Skeleton'
import Skeleton from '@/components/ui/Skeleton'

export default function ChatsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ChatItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
