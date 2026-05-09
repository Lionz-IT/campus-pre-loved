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
      'bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-subtle)] overflow-hidden',
      padding && 'p-5',
      hover && 'hover:shadow-[var(--shadow-hover)] hover:border-[var(--primary-light)] transition-all duration-200 ease-out',
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
      className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-hover)] hover:border-[var(--primary)] transition-all duration-300 flex flex-col"
    >
      <div className="aspect-square bg-[var(--surface-hover)] overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-[var(--border)]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {listingType === 'barter' && (
          <span className="absolute top-2 left-2 bg-[var(--accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            BARTER
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <p className="text-[var(--text-primary)] font-medium text-sm line-clamp-2 leading-snug group-hover:text-[var(--primary-dark)] transition-colors">
            {title}
          </p>
          <p className="text-[var(--primary)] font-bold text-base mt-1.5">
            {listingType === 'barter' ? 'Barter' : formatPrice(price)}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <p className="text-[var(--text-secondary)] text-xs truncate max-w-[60%]">{sellerName}</p>
          <p className="text-[var(--text-muted)] text-[10px] flex-shrink-0">{timeAgo}</p>
        </div>
      </div>
    </a>
  )
}
