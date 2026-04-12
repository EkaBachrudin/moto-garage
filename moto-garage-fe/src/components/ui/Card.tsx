import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  flat?: boolean
  className?: string
  header?: ReactNode
  footer?: ReactNode
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
}

export function Card({
  children,
  title,
  subtitle,
  flat = false,
  className = '',
  header,
  footer,
  headerClassName = '',
  bodyClassName = '',
  footerClassName = ''
}: CardProps) {
  const cardClasses = [
    'card',
    flat && 'card-flat',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cardClasses}>
      {(header || title || subtitle) && (
        <div className={`card-header ${headerClassName}`}>
          {header || (
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          )}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className={`card-footer ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  )
}

export interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`card-body ${className}`}>{children}</div>
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`card-footer ${className}`}>{children}</div>
}
