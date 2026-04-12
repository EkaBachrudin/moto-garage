import type { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  containerClassName?: string
}

export function Textarea({
  label,
  error,
  hint,
  required = false,
  size = 'md',
  containerClassName = '',
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  const textareaClasses = [
    'textarea',
    `textarea-${size}`,
    error && 'input-error',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`form-group ${containerClassName}`}>
      {label && (
        <label htmlFor={textareaId} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={textareaClasses}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  )
}
