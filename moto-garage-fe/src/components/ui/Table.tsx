import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  title: string
  render?: (value: any, record: T, index: number) => ReactNode
  sortable?: boolean
  width?: string
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: string
  loading?: boolean
  empty?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Table<T extends Record<string, any>>({
  columns,
  data = [],
  keyField,
  loading = false,
  empty,
  size = 'md',
  className = ''
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="card flex items-center justify-center" style={{ padding: '48px' }}>
        <span className="spinner spinner-lg" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center" style={{ padding: '48px' }}>
          {empty || (
            <div>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>📭</p>
              <p style={{ color: 'var(--color-gray-500)', fontSize: '14px' }}>
                Tidak ada data
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const tableClasses = [
    'table',
    `table-${size}`,
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="table-container">
      <table className={tableClasses}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => (
            <tr key={record[keyField] || index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render
                    ? column.render(record[column.key], record, index)
                    : record[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
