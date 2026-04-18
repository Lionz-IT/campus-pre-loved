import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  name: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <div className={cn('relative rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0', sizeClasses[size], className)}>
        <Image src={src} alt={name} fill sizes="80px" className="object-cover" />
      </div>
    )
  }

  return (
    <div className={cn(
      'rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0',
      sizeClasses[size],
      className,
    )}>
      {getInitials(name)}
    </div>
  )
}
