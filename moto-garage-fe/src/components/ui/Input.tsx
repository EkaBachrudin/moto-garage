import type { InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  startIcon?: ReactNode
  endIcon?: ReactNode
  containerClassName?: string
}

export function Input({
  label,
  error,
  hint,
  required = false,
  size = 'md',
  startIcon,
  endIcon,
  containerClassName = '',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const inputClasses = [
    'input',
    `input-${size}`,
    error && 'input-error',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`form-group ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <div className="input-wrapper" style={{ position: 'relative' }}>
        {startIcon && (
          <span className="input-start-icon" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-gray-400)',
            pointerEvents: 'none'
          }}>
            {startIcon}
          </span>
        )}
        <input
          id={inputId}
          className={inputClasses}
          style={startIcon ? { paddingLeft: '40px' } : endIcon ? { paddingRight: '40px' } : undefined}
          {...props}
        />
        {endIcon && (
          <span className="input-end-icon" style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-gray-400)',
            pointerEvents: 'none'
          }}>
            {endIcon}
          </span>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  )
}
