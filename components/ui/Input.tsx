import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'

interface BaseFieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
}

interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
}

interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

const fieldBase = 'w-full bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--text-muted)] rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors duration-200 shadow-sm hover:border-slate-300'

export function InputField({ label, hint, error, required, icon, className, id, ...props }: InputFieldProps) {
  return (
    <div className="animate-fade-in">
      {label && (
        <label htmlFor={id} className="block text-[var(--text-primary)] text-sm font-medium mb-1.5">
          {label} {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{icon}</div>}
        <input
          id={id}
          className={cn(fieldBase, icon && 'pl-10', error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]', className)}
          {...props}
        />
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-[var(--text-secondary)]">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}

export function TextareaField({ label, hint, error, required, className, id, ...props }: TextareaFieldProps) {
  return (
    <div className="animate-fade-in">
      {label && (
        <label htmlFor={id} className="block text-[var(--text-primary)] text-sm font-medium mb-1.5">
          {label} {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}
      <textarea
        id={id}
        className={cn(fieldBase, 'resize-none', error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]', className)}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-[var(--text-secondary)]">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}

export function SelectField({ label, hint, error, required, children, className, id, ...props }: SelectFieldProps) {
  return (
    <div className="animate-fade-in">
      {label && (
        <label htmlFor={id} className="block text-[var(--text-primary)] text-sm font-medium mb-1.5">
          {label} {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}
      <select
        id={id}
        className={cn(fieldBase, 'appearance-none bg-no-repeat bg-right pr-10', error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]', className)}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1.5 text-xs text-[var(--text-secondary)]">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}
