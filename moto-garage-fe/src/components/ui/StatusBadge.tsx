import { ServiceStatus, PaymentStatus, EntryType, type UserRole } from '@/types'
import type { ReactNode } from 'react'

type StatusType = ServiceStatus | PaymentStatus | EntryType | UserRole

export interface StatusBadgeProps {
  status: StatusType | string
  showDot?: boolean
  className?: string
}

export function StatusBadge({ status, showDot = true, className = '' }: StatusBadgeProps) {
  const getStatusClass = (): string => {
    // Service Status
    if (status === ServiceStatus.MENUNGGU_ANTRIAN) return 'menunggu'
    if (status === ServiceStatus.PENGECEKAN) return 'pengecekan'
    if (status === ServiceStatus.DIKERJAKAN) return 'dikerjakan'
    if (status === ServiceStatus.KONFIRMASI_PART) return 'konfirmasi'
    if (status === ServiceStatus.MENUNGGU_PART) return 'menunggu-part'
    if (status === ServiceStatus.SELESAI) return 'selesai'

    // Payment Status
    if (status === PaymentStatus.LUNAS) return 'lunas'
    if (status === PaymentStatus.BELUM_LUNAS) return 'belum-lunas'

    // Entry Type
    if (status === EntryType.BOOKING) return 'booking'
    if (status === EntryType.WALK_IN) return 'walk-in'

    return ''
  }

  const badgeClass = getStatusClass()

  // Handle different badge types
  const isPaymentStatus = status === PaymentStatus.LUNAS || status === PaymentStatus.BELUM_LUNAS
  const isEntryType = status === EntryType.BOOKING || status === EntryType.WALK_IN

  const baseClass = isPaymentStatus ? 'payment-status-badge' : isEntryType ? 'entry-type-badge' : 'status-badge'

  return (
    <span className={`${baseClass} ${badgeClass} ${className}`}>
      {showDot && <span className="status-dot" />}
      {status}
    </span>
  )
}

export interface CategoryBadgeProps {
  category: 'Sparepart' | 'Aksesoris'
  className?: string
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const categoryClass = category.toLowerCase() === 'sparepart' ? 'sparepart' : 'aksesoris'

  return (
    <span className={`category-badge ${categoryClass} ${className}`}>
      {category}
    </span>
  )
}

export interface StockBadgeProps {
  stock: number
  minStock: number
  className?: string
}

export function StockBadge({ stock, minStock, className = '' }: StockBadgeProps) {
  const getStatus = () => {
    if (stock <= 0) return 'critical'
    if (stock <= minStock) return 'low'
    return 'normal'
  }

  const status = getStatus()

  if (status === 'normal') {
    return (
      <span className={`stock-status normal ${className}`}>
        {stock} unit
      </span>
    )
  }

  return (
    <span className={`stock-badge ${status} ${className}`}>
      {stock} unit
    </span>
  )
}
