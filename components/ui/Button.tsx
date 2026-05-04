import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  fullWidth?: boolean
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--primary)] hover:bg-[var(--primary-light)] active:bg-[var(--primary-dark)] text-white shadow-[var(--shadow-glow)] hover:-translate-y-0.5',
  secondary: 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] active:bg-[var(--border)] text-[var(--foreground)] border border-[var(--border)] shadow-[var(--shadow-subtle)] hover:-translate-y-0.5',
  accent: 'bg-[var(--accent)] hover:bg-[var(--accent-light)] active:bg-[var(--accent-dark)] text-white shadow-sm shadow-amber-500/30 hover:-translate-y-0.5',
  outline: 'bg-transparent hover:bg-[var(--surface-hover)] active:bg-[var(--border)] text-[var(--foreground)] border border-[var(--border)]',
  ghost: 'bg-transparent hover:bg-[var(--surface-hover)] active:bg-[var(--border)] text-[var(--foreground)]',
  danger: 'bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 border border-red-200',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs rounded-xl font-medium',
  md: 'px-5 py-2.5 text-sm rounded-2xl font-semibold',
  lg: 'px-7 py-3.5 text-base rounded-2xl font-bold',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'relative overflow-hidden inline-flex items-center justify-center transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0 disabled:shadow-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      <span className={cn('relative z-10 flex items-center justify-center gap-2', loading && 'opacity-80')}>
        {children}
      </span>
    </button>
  )
}
