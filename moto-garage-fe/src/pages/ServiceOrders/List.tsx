import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '@/services'
import type { ServiceOrder } from '@/types'
import { ServiceStatus } from '@/types'
import { StatusBadge } from '@/components/ui'
import { Table } from '@/components/ui'
import type { Column } from '@/components/ui'

const columns: Column<ServiceOrder>[] = [
  {
    key: 'order_id',
    title: 'Order ID',
    render: (_, record) => (
      <Link to={`/orders/${record.order_id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
        {record.order_id}
      </Link>
    )
  },
  {
    key: 'customer',
    title: 'Pelanggan',
    render: (_, record) => record.customer?.full_name || '-'
  },
  {
    key: 'plate',
    title: 'Plat Nomor',
    render: (_, record) => (
      <span style={{ fontFamily: 'monospace', background: 'var(--color-gray-100)', padding: '2px 8px', borderRadius: '4px' }}>
        {record.vehicle?.plate_number || '-'}
      </span>
    )
  },
  {
    key: 'vehicle',
    title: 'Kendaraan',
    render: (_, record) => record.vehicle?.brand_type || '-'
  },
  {
    key: 'status',
    title: 'Status',
    render: (_, record) => <StatusBadge status={record.status} />
  },
  {
    key: 'mechanic',
    title: 'Mekanik',
    render: (_, record) => record.mechanic?.full_name || <span style={{ color: 'var(--color-gray-400)' }}>Belum ditugaskan</span>
  },
  {
    key: 'entry_date',
    title: 'Waktu Masuk',
    render: (_, record) => new Date(record.entry_date).toLocaleString('id-ID')
  },
  {
    key: 'entry_type',
    title: 'Tipe',
    render: (_, record) => (
      <span className={`entry-type-badge ${record.entry_type === 'Booking' ? 'booking' : 'walk-in'}`}>
        {record.entry_type}
      </span>
    )
  }
]

export function ServiceOrdersList() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | ''>('')

  useEffect(() => {
    loadOrders()
  }, [filterStatus])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getAllOrders(
        filterStatus ? { status: filterStatus } : undefined
      )
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Daftar Servis</h1>
        <p className="page-subtitle">Kelola semua order servis</p>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title" style={{ margin: 0 }}>Order Servis</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              className="select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ServiceStatus | '')}
              style={{ padding: '6px 12px', border: '1px solid var(--color-gray-300)', borderRadius: '6px' }}
            >
              <option value="">Semua Status</option>
              <option value={ServiceStatus.MENUNGGU_ANTRIAN}>Menunggu Antrian</option>
              <option value={ServiceStatus.PENGECEKAN}>Pengecekan</option>
              <option value={ServiceStatus.DIKERJAKAN}>Sedang Dikerjakan</option>
              <option value={ServiceStatus.KONFIRMASI_PART}>Konfirmasi Part</option>
              <option value={ServiceStatus.MENUNGGU_PART}>Menunggu Sparepart</option>
              <option value={ServiceStatus.SELESAI}>Selesai</option>
            </select>
            <Link to="/orders/create" className="btn btn-primary">
              + Order Baru
            </Link>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <Table
            columns={columns}
            data={orders}
            keyField="order_id"
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
