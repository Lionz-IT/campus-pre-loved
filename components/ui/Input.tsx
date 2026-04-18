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

const fieldBase = 'w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all'

export function InputField({ label, hint, error, required, icon, className, id, ...props }: InputFieldProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          id={id}
          className={cn(fieldBase, icon && 'pl-10', error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10', className)}
          {...props}
        />
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function TextareaField({ label, hint, error, required, className, id, ...props }: TextareaFieldProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        className={cn(fieldBase, 'resize-none', error && 'border-red-400', className)}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function SelectField({ label, hint, error, required, children, className, id, ...props }: SelectFieldProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        className={cn(fieldBase, 'bg-gray-50', error && 'border-red-400', className)}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}
