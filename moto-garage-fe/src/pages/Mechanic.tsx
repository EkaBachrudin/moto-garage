import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderService } from '@/services'
import type { ServiceOrder } from '@/types'
import { ServiceStatus } from '@/types'
import { StatusBadge, Card, Modal, Textarea, Button, Select } from '@/components/ui'

export function MechanicView() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [diagnosis, setDiagnosis] = useState('')
  const [newStatus, setNewStatus] = useState<ServiceStatus | ''>('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadMyJobs()
  }, [])

  const loadMyJobs = async () => {
    try {
      setLoading(true)
      // In a real app, this would filter by current logged-in mechanic
      // For demo, we just get all orders assigned to mechanic m1
      const data = await orderService.getAllOrders({ mechanic_id: 'm1' })
      setOrders(data)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      setUpdating(true)
      await orderService.updateOrderStatus(selectedOrder.order_id, newStatus, diagnosis || undefined)
      await loadMyJobs()
      setShowModal(false)
      setSelectedOrder(null)
      setDiagnosis('')
      setNewStatus('')
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Gagal mengupdate status')
    } finally {
      setUpdating(false)
    }
  }

  const openUpdateModal = (order: ServiceOrder) => {
    setSelectedOrder(order)
    setDiagnosis(order.diagnosis || '')
    setNewStatus('')
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '48px' }}>
        <span className="spinner spinner-lg" />
      </div>
    )
  }

  const activeOrders = orders.filter(o => o.status !== ServiceStatus.SELESAI)
  const completedOrders = orders.filter(o => o.status === ServiceStatus.SELESAI)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tugas Saya</h1>
        <p className="page-subtitle">Daftar pekerjaan yang ditugaskan kepada Anda</p>
      </div>

      {/* Active Jobs */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Pekerjaan Aktif ({activeOrders.length})
        </h2>
        {activeOrders.length === 0 ? (
          <div className="card">
            <div className="card-body text-center" style={{ padding: '48px', color: 'var(--color-gray-400)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <p>Tidak ada pekerjaan aktif saat ini</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2" style={{ gap: '16px' }}>
            {activeOrders.map((order) => (
              <JobCard
                key={order.order_id}
                order={order}
                onUpdate={() => openUpdateModal(order)}
                onViewDetail={() => navigate(`/orders/${order.order_id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs */}
      {completedOrders.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Selesai Hari Ini ({completedOrders.length})
          </h2>
          <div className="grid grid-cols-2" style={{ gap: '16px' }}>
            {completedOrders.map((order) => (
              <JobCard
                key={order.order_id}
                order={order}
                onUpdate={() => openUpdateModal(order)}
                onViewDetail={() => navigate(`/orders/${order.order_id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Update Status Pengerjaan"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--color-gray-50)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {selectedOrder.vehicle?.brand_type}
              </div>
              <div style={{
                fontFamily: 'monospace',
                background: 'var(--color-gray-200)',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                fontSize: '12px'
              }}>
                {selectedOrder.vehicle?.plate_number}
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-gray-500)' }}>
                Keluhan: {selectedOrder.complaint}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
              Status saat ini:
            </div>
            <StatusBadge status={selectedOrder.status} />

            <Select
              label="Status Baru"
              options={getNextStatusOptions(selectedOrder.status)}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ServiceStatus)}
              placeholder="Pilih status baru"
              required
            />

            {newStatus && newStatus !== ServiceStatus.MENUNGGU_ANTRIAN && (
              <Textarea
                label="Diagnosa / Keterangan"
                placeholder="Tambahkan diagnosa atau keterangan..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={4}
                required
              />
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleUpdateStatus}
                disabled={!newStatus || updating}
              >
                {updating ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function JobCard({ order, onUpdate, onViewDetail }: {
  order: ServiceOrder
  onUpdate: () => void
  onViewDetail: () => void
}) {
  return (
    <Card
      flat
      style={{
        border: `1px solid ${getStatusBorderColor(order.status)}`,
        cursor: 'pointer'
      }}
    >
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              {order.vehicle?.brand_type}
            </div>
            <div style={{
              fontFamily: 'monospace',
              background: 'var(--color-gray-100)',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'inline-block',
              fontSize: '12px'
            }}>
              {order.vehicle?.plate_number}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '12px' }}>
          {order.complaint}
        </div>

        {order.diagnosis && (
          <div style={{
            background: 'var(--color-info-light)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            color: 'var(--color-info-hover)',
            marginBottom: '12px'
          }}>
            <strong>Diagnosa:</strong> {order.diagnosis}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetail}
            style={{ flex: 1 }}
          >
            Detail
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onUpdate}
            style={{ flex: 1 }}
          >
            Update
          </Button>
        </div>
      </div>
    </Card>
  )
}

function getNextStatusOptions(currentStatus: ServiceStatus) {
  const statusFlow: Record<ServiceStatus, ServiceStatus[]> = {
    [ServiceStatus.MENUNGGU_ANTRIAN]: [ServiceStatus.PENGECEKAN],
    [ServiceStatus.PENGECEKAN]: [ServiceStatus.DIKERJAKAN, ServiceStatus.KONFIRMASI_PART],
    [ServiceStatus.DIKERJAKAN]: [ServiceStatus.SELESAI, ServiceStatus.KONFIRMASI_PART],
    [ServiceStatus.KONFIRMASI_PART]: [ServiceStatus.DIKERJAKAN, ServiceStatus.MENUNGGU_PART],
    [ServiceStatus.MENUNGGU_PART]: [ServiceStatus.DIKERJAKAN],
    [ServiceStatus.SELESAI]: []
  }

  const nextStatuses = statusFlow[currentStatus] || []
  return nextStatuses.map(status => ({ value: status, label: status }))
}

function getStatusBorderColor(status: ServiceStatus): string {
  const colors: Record<ServiceStatus, string> = {
    [ServiceStatus.MENUNGGU_ANTRIAN]: 'var(--color-gray-300)',
    [ServiceStatus.PENGECEKAN]: 'var(--color-info)',
    [ServiceStatus.DIKERJAKAN]: 'var(--color-warning)',
    [ServiceStatus.KONFIRMASI_PART]: 'var(--color-accent)',
    [ServiceStatus.MENUNGGU_PART]: 'var(--color-error)',
    [ServiceStatus.SELESAI]: 'var(--color-success)'
  }
  return colors[status]
}
