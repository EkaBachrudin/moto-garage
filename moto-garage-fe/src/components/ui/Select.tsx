import type { SelectHTMLAttributes, ReactNode } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  options: SelectOption[]
  placeholder?: string
  containerClassName?: string
}

export function Select({
  label,
  error,
  hint,
  required = false,
  size = 'md',
  options = [],
  placeholder,
  containerClassName = '',
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
  const selectClasses = [
    'select',
    `select-${size}`,
    error && 'input-error',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`form-group ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  )
}
