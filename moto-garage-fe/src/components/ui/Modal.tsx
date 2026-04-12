import { useEffect, type ReactNode } from 'react'
import type { ButtonProps } from './Button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
  footer?: ReactNode
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  showClose?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  closeOnOverlay = true,
  closeOnEscape = true,
  showClose = true,
  className = ''
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleOverlayClick}>
      <div className={`modal modal-${size} ${className}`}>
        {(title || showClose) && (
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            {showClose && (
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export interface ModalFooterProps {
  onClose?: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  confirmProps?: Omit<ButtonProps, 'children'>
  cancelProps?: Omit<ButtonProps, 'children'>
  children?: ReactNode
}

export function ModalFooter({
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmProps = {},
  cancelProps = {},
  children
}: ModalFooterProps) {
  return (
    <>
      {children || (
        <>
          {onClose && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              {...cancelProps}
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
              {...confirmProps}
            >
              {confirmText}
            </button>
          )}
        </>
      )}
    </>
  )
}
