import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderService, paymentService } from '@/services'
import type { ServiceOrder, OrderDetail } from '@/types'
import { ServiceStatus, PaymentStatus, OrderDetailType } from '@/types'
import { StatusBadge, Modal, Button, Textarea, Card } from '@/components/ui'

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<ServiceStatus | ''>('')
  const [diagnosis, setDiagnosis] = useState('')

  useEffect(() => {
    if (id) {
      loadOrder(id)
    }
  }, [id])

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true)
      const data = await orderService.getOrderById(orderId)
      setOrder(data)
      setDiagnosis(data.diagnosis || '')
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return

    try {
      setUpdating(true)
      await orderService.updateOrderStatus(order.order_id, newStatus, diagnosis || undefined)
      await loadOrder(order.order_id)
      setShowStatusModal(false)
      setNewStatus('')
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Gagal mengupdate status')
    } finally {
      setUpdating(false)
    }
  }

  const calculateTotal = () => {
    if (!order?.order_details) return 0
    return order.order_details.reduce((sum, detail) => sum + detail.subtotal, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '48px' }}>
        <span className="spinner spinner-lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p style={{ color: 'var(--color-gray-500)' }}>Order tidak ditemukan</p>
          <Link to="/orders" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    )
  }

  const totalAmount = calculateTotal()
  const isUnpaid = order.payment?.payment_status === PaymentStatus.BELUM_LUNAS

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 className="page-title" style={{ margin: 0 }}>Order #{order.order_id}</h1>
              <StatusBadge status={order.status} />
              <span className={`entry-type-badge ${order.entry_type === 'Booking' ? 'booking' : 'walk-in'}`}>
                {order.entry_type}
              </span>
            </div>
            <p className="page-subtitle">
              {new Date(order.entry_date).toLocaleString('id-ID')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="outline"
              onClick={() => navigate('/orders')}
            >
              Kembali
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowStatusModal(true)}
            >
              Update Status
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ gap: '24px' }}>
        {/* Main Content */}
        <div style={{ gridColumn: 'span 2' }}>
          {/* Customer & Vehicle Info */}
          <Card title="Informasi Pelanggan & Kendaraan" style={{ marginBottom: '24px' }}>
            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
                  Nama Pelanggan
                </div>
                <div style={{ fontWeight: '500' }}>{order.customer?.full_name || '-'}</div>
                <div style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>
                  {order.customer?.phone}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
                  Kendaraan
                </div>
                <div style={{ fontWeight: '500' }}>{order.vehicle?.brand_type || '-'}</div>
                <div style={{
                  fontFamily: 'monospace',
                  background: 'var(--color-gray-100)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: '4px'
                }}>
                  {order.vehicle?.plate_number || '-'}
                </div>
              </div>
            </div>
          </Card>

          {/* Complaint & Diagnosis */}
          <Card title="Keluhan & Diagnosa" style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
                Keluhan Pelanggan
              </div>
              <div style={{ background: 'var(--color-gray-50)', padding: '12px', borderRadius: '8px' }}>
                {order.complaint || '-'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
                Hasil Diagnosa Mekanik
              </div>
              <div style={{
                background: order.diagnosis ? 'var(--color-info-light)' : 'var(--color-gray-50)',
                padding: '12px',
                borderRadius: '8px',
                color: order.diagnosis ? 'var(--color-info-hover)' : 'var(--color-gray-400)'
              }}>
                {order.diagnosis || 'Belum ada diagnosa'}
              </div>
            </div>
          </Card>

          {/* Order Details (Items) */}
          <Card
            title="Rincian Pengerjaan"
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: 'var(--color-gray-500)' }}>Total:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', marginLeft: '12px' }}>
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  + Tambah Item
                </Button>
              </div>
            }
          >
            {(!order.order_details || order.order_details.length === 0) ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                Belum ada item ditambahkan
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.order_details.map((detail) => (
                  <div
                    key={detail.detail_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'var(--color-gray-50)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${detail.type === OrderDetailType.JASA ? 'badge-primary' : 'badge-warning'}`}>
                          {detail.type}
                        </span>
                        <strong>{detail.description}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                        {detail.quantity} x Rp {detail.unit_price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600' }}>
                        Rp {detail.subtotal.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Mechanic Assignment */}
          <Card title="Mekanik PIC" style={{ marginBottom: '24px' }}>
            {order.mechanic ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: 'var(--color-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>
                  {order.mechanic.full_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{order.mechanic.full_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                    Komisi: {order.mechanic.commission_rate}%
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-gray-400)', textAlign: 'center', padding: '16px' }}>
                Belum ditugaskan
              </div>
            )}
          </Card>

          {/* Payment Info */}
          <Card title="Pembayaran">
            {order.payment ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-gray-500)' }}>Total Tagihan:</span>
                  <span style={{ fontWeight: '600' }}>
                    Rp {order.payment.total_bill.toLocaleString('id-ID')}
                  </span>
                </div>
                {order.payment.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--color-gray-500)' }}>Diskon:</span>
                    <span style={{ color: 'var(--color-success)' }}>
                      -Rp {order.payment.discount_amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                {order.payment.dp_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--color-gray-500)' }}>DP Sudah Dibayar:</span>
                    <span>
                      Rp {order.payment.dp_amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-gray-200)' }}>
                  <span style={{ fontWeight: '600' }}>Sisa Pembayaran:</span>
                  <span style={{
                    fontWeight: '700',
                    color: isUnpaid ? 'var(--color-error)' : 'var(--color-success)'
                  }}>
                    Rp {order.payment.remaining_amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StatusBadge status={order.payment.payment_status} />
                  <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                    {order.payment.payment_method}
                  </span>
                </div>
                {isUnpaid && order.payment.remaining_amount > 0 && (
                  <Link
                    to={`/payments/create?orderId=${order.order_id}`}
                    className="btn btn-primary btn-block"
                    style={{ marginTop: '16px', textAlign: 'center' }}
                  >
                    Buat Pembayaran
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <p style={{ color: 'var(--color-gray-400)', marginBottom: '12px' }}>
                  Belum ada pembayaran
                </p>
                <Link
                  to={`/payments/create?orderId=${order.order_id}`}
                  className="btn btn-primary btn-block"
                >
                  Buat Pembayaran
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Status Servis"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Status Baru"
            options={Object.values(ServiceStatus).map(status => ({ value: status, label: status }))}
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
            />
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowStatusModal(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleStatusUpdate}
              disabled={!newStatus || updating}
            >
              {updating ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
