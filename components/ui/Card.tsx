import { cn } from '@/lib/utils'
import Image from 'next/image'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
}

export default function Card({ children, className, padding = true, hover = false }: CardProps) {
  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-2xl',
      padding && 'p-5',
      hover && 'hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200',
      className,
    )}>
      {children}
    </div>
  )
}

interface ProductCardProps {
  id: string
  title: string
  price: number | null
  listingType: string
  imageUrl?: string
  sellerName: string
  timeAgo: string
  formatPrice: (amount: number | null | undefined) => string
}

export function ProductCard({ id, title, price, listingType, imageUrl, sellerName, timeAgo, formatPrice }: ProductCardProps) {
  return (
    <a
      href={`/products/${id}`}
      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-200"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        {listingType === 'barter' && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            BARTER
          </span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-gray-900 font-medium text-sm line-clamp-2 leading-snug">{title}</p>
        <p className="text-blue-600 font-bold text-base">
          {listingType === 'barter' ? 'Barter' : formatPrice(price)}
        </p>
        <div className="flex items-center justify-between pt-0.5">
          <p className="text-gray-400 text-xs truncate">{sellerName}</p>
          <p className="text-gray-400 text-xs flex-shrink-0">{timeAgo}</p>
        </div>
      </div>
    </a>
  )
}
