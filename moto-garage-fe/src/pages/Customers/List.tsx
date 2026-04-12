import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { customerService } from '@/services'
import type { Customer } from '@/types'
import { Table, Button, Input } from '@/components/ui'
import type { Column } from '@/components/ui'

const columns: Column<Customer>[] = [
  {
    key: 'full_name',
    title: 'Nama Pelanggan',
    render: (_, record) => (
      <Link to={`/customers/${record.customer_id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>
        {record.full_name}
      </Link>
    )
  },
  {
    key: 'phone',
    title: 'No. WhatsApp',
    render: (_, record) => (
      <a
        href={`https://wa.me/${record.phone.replace(/^0/, '62')}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--color-success)', textDecoration: 'none' }}
      >
        {record.phone}
      </a>
    )
  },
  {
    key: 'address',
    title: 'Alamat',
    render: (_, record) => record.address || '-'
  },
  {
    key: 'is_member',
    title: 'Member',
    render: (_, record) => (
      record.is_member ? (
        <span className="badge badge-success">Member</span>
      ) : (
        <span className="badge badge-gray">Non-Member</span>
      )
    )
  },
  {
    key: 'created_at',
    title: 'Terdaftar',
    render: (_, record) => new Date(record.created_at).toLocaleDateString('id-ID')
  }
]

export function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [search])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerService.getAllCustomers(search || undefined)
      setCustomers(data)
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pelanggan</h1>
        <p className="page-subtitle">Kelola data pelanggan</p>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title" style={{ margin: 0 }}>Daftar Pelanggan</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Input
              placeholder="Cari nama atau no. HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '280px' }}
            />
            <Link to="/customers/create" className="btn btn-primary">
              + Pelanggan Baru
            </Link>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <Table
            columns={columns}
            data={customers}
            keyField="customer_id"
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
