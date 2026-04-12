import type { ReactNode } from 'react'

export interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray'
  dot?: boolean
  className?: string
}

export function Badge({
  children,
  variant = 'primary',
  dot = false,
  className = ''
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}
