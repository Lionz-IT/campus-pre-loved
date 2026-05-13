'use client'

import { cn, formatPrice } from '@/lib/utils'
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

type ProductStatus = 'available' | 'sold'

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string } | null> = {
  available: null,
  sold: {
    label: 'TERJUAL',
    className: 'bg-red-600 text-white',
  },
}

interface ProductCardProps {
  id: string
  title: string
  price: number | null
  listingType: string
  imageUrl?: string
  sellerName: string
  timeAgo: string
  status?: ProductStatus
}

export function ProductCard({ id, title, price, listingType, imageUrl, sellerName, timeAgo, status = 'available' }: ProductCardProps) {
  const statusConfig = STATUS_CONFIG[status]
  const isSold = status === 'sold'

  return (
    <a
      href={`/products/${id}`}
      className={cn(
        'group bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-hover)] hover:border-[var(--primary)] transition-all duration-300 flex flex-col',
        isSold && 'opacity-75 hover:opacity-90',
      )}
    >
      <div className="aspect-square bg-[var(--surface-hover)] overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover group-hover:scale-105 transition-transform duration-500 ease-out',
              isSold && 'grayscale',
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-[var(--border)]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        {isSold && (
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {statusConfig && (
          <span className={cn('absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-sm shadow-sm z-10', statusConfig.className)}>
            {statusConfig.label}
          </span>
        )}
        <span className="absolute top-2 right-2 bg-amber-400 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-sm shadow-sm">
          {listingType === 'barter' ? 'BARTER' : 'NEGO'}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[var(--text-primary)] font-semibold text-[15px] line-clamp-2 leading-snug group-hover:text-[var(--primary-dark)] transition-colors mb-1">
            {title}
          </p>
          <p className={cn('font-extrabold text-xl mb-2', isSold ? 'text-gray-400 line-through' : 'text-amber-500')}>
            {listingType === 'barter' ? 'Barter' : formatPrice(price)}
          </p>
          <div className="flex items-center text-[var(--text-secondary)] mb-4">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs truncate">Kantin PENS</span>
          </div>
        </div>
        {isSold ? (
          <div className="flex items-center justify-center mt-auto w-full pt-2">
            <span className="text-xs font-semibold text-red-500">Barang sudah terjual</span>
          </div>
        ) : (
          <div className="flex gap-2 mt-auto w-full pt-2">
            <button 
              type="button"
              className="flex-1 px-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors border border-gray-200"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              Tawar Harga
            </button>
            <button 
              type="button"
              className="flex-1 px-2 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat (COD)
            </button>
          </div>
        )}
      </div>
    </a>
  )
}
