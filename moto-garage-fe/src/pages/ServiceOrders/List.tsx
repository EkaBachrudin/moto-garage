import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '@/services'
import type { ServiceOrder } from '@/types'
import { ServiceStatus, EntryType } from '@/types'
import { StatusBadge } from '@/components/ui'

const getEntryTypeStyles = (entryType: EntryType) => {
  return entryType === EntryType.BOOKING
    ? { background: '#dbeafe', color: '#1e40af' }
    : { background: '#d1fae5', color: '#065f46' }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateInput(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const STATUS_OPTIONS = [
  { value: ServiceStatus.MENUNGGU_ANTRIAN, label: 'Antri' },
  { value: ServiceStatus.PENGECEKAN, label: 'Pengecekan' },
  { value: ServiceStatus.DIKERJAKAN, label: 'Dikerjakan' },
  { value: ServiceStatus.KONFIRMASI_PART, label: 'Konfirmasi Part' },
  { value: ServiceStatus.MENUNGGU_PART, label: 'Menunggu Part' },
  { value: ServiceStatus.SELESAI, label: 'Selesai' },
  { value: ServiceStatus.BATAL, label: 'Batal' }
]

export function ServiceOrdersList() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatuses, setFilterStatuses] = useState<ServiceStatus[]>([])
  const [startDate, setStartDate] = useState(formatDateInput(new Date().toString()))
  const [endDate, setEndDate] = useState(formatDateInput(new Date().toString()))
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFilter = (status: ServiceStatus) => {
    setFilterStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status)
      }
      return [...prev, status]
    })
  }

  const clearAllFilters = () => {
    setFilterStatuses([])
  }

  const selectAllFilters = () => {
    setFilterStatuses(STATUS_OPTIONS.map(opt => opt.value))
  }

  const resetDateFilter = () => {
    setStartDate(formatDateInput(new Date().toString()))
    setEndDate(formatDateInput(new Date().toString()))
  }

  const filteredOrders = orders.filter(order => {
    // Date filter
    if (startDate || endDate) {
      const orderDate = new Date(order.entry_date)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      // Set start to beginning of day
      if (start) start.setHours(0, 0, 0, 0)
      // Set end to end of day
      if (end) end.setHours(23, 59, 59, 999)

      if (start && orderDate < start) return false
      if (end && orderDate > end) return false
    }

    // Status filter
    if (filterStatuses.length > 0 && !filterStatuses.includes(order.status)) {
      return false
    }

    // Search filter
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      order.order_code?.toLowerCase().includes(query) ||
      order.customer?.full_name?.toLowerCase().includes(query) ||
      order.vehicle?.plate_number?.toLowerCase().includes(query) ||
      order.vehicle?.brand_type?.toLowerCase().includes(query)
    )
  })

  const stats = {
    total: filteredOrders.length,
    antri: filteredOrders.filter(o => o.status === ServiceStatus.MENUNGGU_ANTRIAN).length,
    proses: filteredOrders.filter(o => [
      ServiceStatus.PENGECEKAN,
      ServiceStatus.DIKERJAKAN,
      ServiceStatus.KONFIRMASI_PART,
      ServiceStatus.MENUNGGU_PART
    ].includes(o.status)).length,
    selesai: filteredOrders.filter(o => o.status === ServiceStatus.SELESAI).length
  }

  // Format date range for display
  const getDateRangeDisplay = () => {
    const start = startDate ? new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
    const end = endDate ? new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

    if (start === end) {
      return start
    }
    return `${start} - ${end}`
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Daftar Servis</h1>
            <p className="page-subtitle">Kelola semua order servis</p>
          </div>
          <Link to="/orders/create" className="btn btn-primary btn-lg">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M10 5v10M5 10h10"/>
            </svg>
            Order Baru
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '24px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 500 }}>Total Order</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{stats.total}</div>
          </div>
          <div style={{
            padding: '20px',
            backgroundColor: '#fef2f2',
            borderRadius: '12px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '13px', color: '#991b1b', marginBottom: '8px', fontWeight: 500 }}>Menunggu Antrian</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#dc2626' }}>{stats.antri}</div>
          </div>
          <div style={{
            padding: '20px',
            backgroundColor: '#eff6ff',
            borderRadius: '12px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ fontSize: '13px', color: '#1e40af', marginBottom: '8px', fontWeight: 500 }}>Dalam Proses</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb' }}>{stats.proses}</div>
          </div>
          <div style={{
            padding: '20px',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '13px', color: '#166534', marginBottom: '8px', fontWeight: 500 }}>Selesai</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#16a34a' }}>{stats.selesai}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Date Filter Row */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Dari:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Sampai:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                📅 {getDateRangeDisplay()}
              </div>
            </div>

            {/* Status Filter Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                Status: {filterStatuses.length > 0 && <span style={{
                  background: '#4f46e5',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>{filterStatuses.length}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {filterStatuses.length > 0 && (
                  <>
                    <button
                      onClick={clearAllFilters}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '13px' }}
                    >
                      Clear
                    </button>
                    <button
                      onClick={selectAllFilters}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '13px' }}
                    >
                      Pilih Semua
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Status Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map((option) => {
                const isActive = filterStatuses.includes(option.value)
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter(option.value)}
                    style={{
                      padding: '8px 16px',
                      border: `1px solid ${isActive ? '#4f46e5' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      backgroundColor: isActive ? '#4f46e5' : 'white',
                      color: isActive ? 'white' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#cbd5e1'
                        e.currentTarget.style.backgroundColor = '#f8fafc'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.backgroundColor = 'white'
                      }
                    }}
                  >
                    {isActive && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="m6 10 3 3 5-5"/>
                      </svg>
                    )}
                    {option.label}
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                width: '18px',
                height: '18px'
              }} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Cari order, pelanggan, atau plat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Active Filters Display */}
            {(filterStatuses.length > 0 || startDate !== formatDateInput(new Date().toString()) || endDate !== formatDateInput(new Date().toString())) && (
              <div style={{
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>
                  Filter Aktif:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {/* Date Filter Badge */}
                  {(startDate !== formatDateInput(new Date().toString()) || endDate !== formatDateInput(new Date().toString())) && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        background: '#0891b2',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      📅 {getDateRangeDisplay()}
                      <button
                        onClick={resetDateFilter}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          marginLeft: '2px'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M6 6l8 8M14 6l-8 8"/>
                        </svg>
                      </button>
                    </span>
                  )}
                  {/* Status Filter Badges */}
                  {filterStatuses.map((status) => (
                    <span
                      key={status}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        background: '#4f46e5',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {STATUS_OPTIONS.find(opt => opt.value === status)?.label}
                      <button
                        onClick={() => toggleFilter(status)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          marginLeft: '2px'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M6 6l8 8M14 6l-8 8"/>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Info */}
      {filteredOrders.length > 0 && (
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', marginBottom: '8px' }}>
          Menampilkan {filteredOrders.length} order
          {filterStatuses.length > 0 && ` dengan ${filterStatuses.length} filter status`}
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="card">
          <div className="card-body" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Memuat data...</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{marginTop: '12px'}}>
          <div className="card-body" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}>
              Tidak ditemukan
            </h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              {searchQuery || filterStatuses.length > 0 || startDate !== formatDateInput(new Date().toString()) || endDate !== formatDateInput(new Date().toString())
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai dengan membuat order servis baru'}
            </p>
            {!searchQuery && filterStatuses.length === 0 && startDate === formatDateInput(new Date().toString()) && endDate === formatDateInput(new Date().toString()) && (
              <Link to="/orders/create" className="btn btn-primary">
                + Buat Order Baru
              </Link>
            )}
            {(searchQuery || filterStatuses.length > 0 || startDate !== formatDateInput(new Date().toString()) || endDate !== formatDateInput(new Date().toString())) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterStatuses([])
                  setStartDate(formatDateInput(new Date().toString()))
                  setEndDate(formatDateInput(new Date().toString()))
                }}
                className="btn btn-outline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {/* Desktop Table */}
            <div className="desktop-only" style={{ display: 'none' }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '140px' }}>Order</th>
                      <th style={{ minWidth: '180px' }}>Pelanggan</th>
                      <th style={{ minWidth: '200px' }}>Kendaraan</th>
                      <th>Status</th>
                      <th style={{ minWidth: '150px' }}>Mekanik</th>
                      <th style={{ minWidth: '140px' }}>Waktu Masuk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.order_id}>
                        <td>
                          <Link
                            to={`/orders/${order.order_id}`}
                            style={{
                              color: '#4f46e5',
                              textDecoration: 'none',
                              fontWeight: 600,
                              fontFamily: 'monospace',
                              fontSize: '14px'
                            }}
                          >
                            {order.order_code}
                          </Link>
                          <div style={{ marginTop: '6px' }}>
                            <span
                              style={{
                                ...getEntryTypeStyles(order.entry_type),
                                fontSize: '11px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 500
                              }}
                            >
                              {order.entry_type}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: '#1e293b' }}>{order.customer?.full_name || '-'}</div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                            {order.customer?.phone || '-'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: '#1e293b' }}>{order.vehicle?.brand_type || '-'}</div>
                          <div style={{ marginTop: '4px' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              {order.vehicle?.plate_number || '-'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td>
                          <div style={{ fontSize: '14px', color: '#475569' }}>
                            {order.mechanic?.full_name || (
                              <span style={{ color: '#94a3b8' }}>Belum ditugaskan</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            {formatDate(order.entry_date)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-only" style={{ display: 'none', padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredOrders.map((order) => (
                  <Link
                    key={order.order_id}
                    to={`/orders/${order.order_id}`}
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4f46e5'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#4f46e5',
                          fontSize: '15px',
                          marginBottom: '6px'
                        }}>
                          {order.order_code}
                        </div>
                        <span
                          style={{
                            ...getEntryTypeStyles(order.entry_type),
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        >
                          {order.entry_type}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Customer Section */}
                    <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
                        PELANGGAN
                      </div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>
                        {order.customer?.full_name || '-'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                        {order.customer?.phone || '-'}
                      </div>
                    </div>

                    {/* Vehicle Section */}
                    <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>
                        KENDARAAN
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>🏍️</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>
                            {order.vehicle?.brand_type || '-'}
                          </div>
                          <span style={{
                            fontFamily: 'monospace',
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            display: 'inline-block',
                            marginTop: '4px'
                          }}>
                            {order.vehicle?.plate_number || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <div style={{ color: '#64748b' }}>
                        {formatDate(order.entry_date)}
                      </div>
                      <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>👨‍🔧</span>
                        <span>{order.mechanic?.full_name || 'Belum ditugaskan'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for Responsive */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-only {
            display: block !important;
          }
          .mobile-only {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }

        /* Date input styling */
        input[type="date"] {
          position: relative;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.6;
        }

        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
