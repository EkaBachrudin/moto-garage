import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '@/services'
import type { User } from '@/types'
import { Table, Button, Input, Modal } from '@/components/ui'
import type { Column } from '@/components/ui'

const columns: Column<User>[] = [
  {
    key: 'full_name',
    title: 'Nama Mekanik',
    render: (_, record) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 700
        }}>
          {record.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{record.full_name}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{record.email}</div>
        </div>
      </div>
    )
  },
  {
    key: 'phone',
    title: 'No. Telepon',
    render: (_, record) => (
      <a
        href={`https://wa.me/${record.phone.replace(/^0/, '62')}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#16a34a', textDecoration: 'none' }}
      >
        {record.phone}
      </a>
    )
  },
  {
    key: 'commission_rate',
    title: 'Komisi',
    render: (_, record) => (
      <span style={{
        background: '#dbeafe',
        color: '#1e40af',
        fontSize: '12px',
        padding: '4px 10px',
        borderRadius: '6px',
        fontWeight: 600
      }}>
        {record.commission_rate || 0}%
      </span>
    )
  },
  {
    key: 'is_active',
    title: 'Status',
    render: (_, record) => (
      record.is_active ? (
        <span className="badge badge-success">Aktif</span>
      ) : (
        <span className="badge badge-gray">Non-Aktif</span>
      )
    )
  },
  {
    key: 'actions',
    title: 'Aksi',
    render: (_, record) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link
          to={`/mechanics/${record.user_id}/edit`}
          className="btn btn-sm btn-outline"
          style={{ fontSize: '13px', padding: '6px 12px' }}
        >
          Edit
        </Link>
      </div>
    )
  }
]

export function MechanicsList() {
  const [mechanics, setMechanics] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState(false)
  const [mechanicToDelete, setMechanicToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadMechanics()
  }, [search])

  const loadMechanics = async () => {
    try {
      setLoading(true)
      const data = await userService.getMechanics()
      const filtered = search
        ? data.filter(m =>
            m.full_name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.phone.includes(search)
          )
        : data
      setMechanics(filtered)
    } catch (error) {
      console.error('Failed to load mechanics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!mechanicToDelete) return

    try {
      setDeleting(true)
      await userService.deleteMechanic(mechanicToDelete.user_id)
      await loadMechanics()
      setDeleteModal(false)
      setMechanicToDelete(null)
    } catch (error) {
      console.error('Failed to delete mechanic:', error)
      alert('Gagal menghapus mekanik')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="page-header" style={{ paddingBottom: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '24px' }}>Mekanik</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Kelola data mekanik dan komisi</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h3 className="card-title" style={{ margin: 0 }}>Daftar Mekanik</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Input
              placeholder="Cari nama, email, atau no. HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '300px' }}
            />
            <Link to="/mechanics/create" className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Mekanik Baru
            </Link>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <Table
            columns={columns}
            data={mechanics}
            keyField="user_id"
            loading={loading}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Hapus Mekanik"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: '#fef2f2',
            borderRadius: '12px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <p style={{ color: '#991b1b', fontSize: '15px', fontWeight: 500, margin: 0 }}>
              Apakah Anda yakin ingin menghapus mekanik ini?
            </p>
            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '8px', margin: 0 }}>
              <strong>{mechanicToDelete?.full_name}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModal(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: '#dc2626',
                borderColor: '#dc2626',
                minWidth: '100px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b91c1c'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dc2626'
              }}
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
