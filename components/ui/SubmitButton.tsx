'use client'

import { useFormStatus } from 'react-dom'
import Button from '@/components/ui/Button'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface SubmitButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
  pendingText?: string
}

export default function SubmitButton({
  children,
  pendingText = 'Memproses...',
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" loading={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  )
}
