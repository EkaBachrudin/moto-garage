import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderService, paymentService, userService } from '@/services'
import type { ServiceOrder, OrderDetail, User } from '@/types'
import { ServiceStatus, PaymentStatus, OrderDetailType, EntryType } from '@/types'
import { StatusBadge, Modal, Button, Textarea } from '@/components/ui'

function getStatusColor(status: ServiceStatus): string {
  const colors: Record<ServiceStatus, string> = {
    [ServiceStatus.MENUNGGU_ANTRIAN]: '#dc2626',
    [ServiceStatus.PENGECEKAN]: '#2563eb',
    [ServiceStatus.DIKERJAKAN]: '#f59e0b',
    [ServiceStatus.KONFIRMASI_PART]: '#ec4899',
    [ServiceStatus.MENUNGGU_PART]: '#8b5cf6',
    [ServiceStatus.SELESAI]: '#16a34a',
    [ServiceStatus.BATAL]: '#64748b'
  }
  return colors[status] || '#64748b'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getEntryTypeStyles(entryType: EntryType) {
  return entryType === EntryType.BOOKING
    ? { background: '#dbeafe', color: '#1e40af', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }
    : { background: '#d1fae5', color: '#065f46', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }
}

function getOrderTypeColor(type: OrderDetailType): { bg: string; text: string; icon: string } {
  if (type === OrderDetailType.JASA) {
    return { bg: '#dbeafe', text: '#1e40af', icon: '🔧' }
  }
  return { bg: '#fef3c7', text: '#92400e', icon: '⚙️' }
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showMechanicModal, setShowMechanicModal] = useState(false)
  const [newStatus, setNewStatus] = useState<ServiceStatus | ''>('')
  const [diagnosis, setDiagnosis] = useState('')
  const [mechanics, setMechanics] = useState<User[]>([])
  const [selectedMechanic, setSelectedMechanic] = useState('')
  const [loadingMechanics, setLoadingMechanics] = useState(false)

  // Initialize newStatus with current order status when modal opens
  useEffect(() => {
    if (showStatusModal && order) {
      setNewStatus(order.status)
      setDiagnosis(order.diagnosis || '')
    }
  }, [showStatusModal, order])

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

    // Check if mechanic is assigned before allowing status update
    if (!order.mechanic || !order.mechanic_id) {
      alert('Tidak dapat mengupdate status! Silakan tugaskan mekanik terlebih dahulu.')
      setShowStatusModal(false)
      return
    }

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

  const loadMechanics = async () => {
    try {
      setLoadingMechanics(true)
      const data = await userService.getMechanics()
      setMechanics(data.filter(m => m.is_active))
    } catch (error) {
      console.error('Failed to load mechanics:', error)
      alert('Gagal memuat daftar mekanik')
    } finally {
      setLoadingMechanics(false)
    }
  }

  const openMechanicModal = async () => {
    await loadMechanics()
    setSelectedMechanic(order?.mechanic_id || '')
    setShowMechanicModal(true)
  }

  const handleAssignMechanic = async () => {
    if (!order || !selectedMechanic) {
      alert('Silakan pilih mekanik terlebih dahulu')
      return
    }

    try {
      setUpdating(true)
      await orderService.assignMechanic(order.order_id, [selectedMechanic])
      await loadOrder(order.order_id)
      setShowMechanicModal(false)
      setSelectedMechanic('')
    } catch (error) {
      console.error('Failed to assign mechanic:', error)
      alert('Gagal menugaskan mekanik')
    } finally {
      setUpdating(false)
    }
  }

  const calculateTotal = () => {
    if (!order?.order_details) return 0
    return order.order_details.reduce((sum, detail) => sum + detail.subtotal, 0)
  }

  const calculateMechanicCommission = () => {
    if (!order?.mechanic?.commission_rate) return 0
    const total = calculateTotal()
    return (total * order.mechanic.commission_rate) / 100
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
              Order Tidak Ditemukan
            </h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Order yang Anda cari tidak ditemukan atau telah dihapus
            </p>
            <Link to="/orders" className="btn btn-primary">
              Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalAmount = calculateTotal()
  const isUnpaid = order.payment?.payment_status === PaymentStatus.BELUM_LUNAS

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ paddingBottom: '16px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            background: 'white',
            color: '#475569',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#4f46e5'
            e.currentTarget.style.color = '#4f46e5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0'
            e.currentTarget.style.color = '#475569'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px' }}>
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Kembali
        </button>

        {/* Order Code and Status */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <h1 className="page-title" style={{ margin: 0, fontSize: '28px' }}>
              {order.order_code}
            </h1>
            <StatusBadge status={order.status} />
            <span style={getEntryTypeStyles(order.entry_type)}>
              {order.entry_type}
            </span>
          </div>
          <p className="page-subtitle">
            {formatDate(order.entry_date)}
          </p>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 1 18 0"/>
              <path d="M9 12h6"/>
            </svg>
            Update Status
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Customer Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>👤</span>
              Pelanggan
            </div>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
                Nama Lengkap
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                {order.customer?.full_name || '-'}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
                No. Telepon
              </div>
              <div style={{ fontSize: '15px', color: '#475569' }}>
                {order.customer?.phone || '-'}
              </div>
            </div>
            {order.customer?.address && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
                  Alamat
                </div>
                <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                  {order.customer.address}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🏍️</span>
              Kendaraan
            </div>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
                Jenis Motor
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                {order.vehicle?.brand_type || '-'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
                Plat Nomor
              </div>
              <span style={{
                fontFamily: 'monospace',
                background: '#f1f5f9',
                color: '#475569',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 600,
                display: 'inline-block'
              }}>
                {order.vehicle?.plate_number || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Mechanic Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>👨‍🔧</span>
              Mekanik PIC
            </div>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            {order.mechanic ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#4f46e5',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 700
                    }}>
                      {order.mechanic.full_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                          {order.mechanic.full_name}
                        </div>
                        <span style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 4px rgba(251, 191, 36, 0.3)'
                        }}>
                          {order.mechanic.commission_rate || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openMechanicModal}
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    Ganti
                  </Button>
                </div>

                {/* Commission Info */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #fbbf24'
                }}>
                 
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#92400e', fontWeight: 600 }}>📈 Estimasi Komisi</span>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#16a34a'
                    }}>
                      Rp {calculateMechanicCommission().toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '8px', textAlign: 'right' }}>
                      dari total Rp {calculateTotal().toLocaleString('id-ID')}
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px dashed #fecaca'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍🔧</div>
                <div style={{ fontSize: '14px', color: '#991b1b', fontWeight: 500, marginBottom: '12px' }}>
                  Belum ada mekanik ditugaskan
                </div>
                <Button
                  variant="primary"
                  onClick={openMechanicModal}
                  style={{ fontSize: '13px' }}
                >
                  + Tugaskan Mekanik
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaint and Diagnosis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Complaint Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#fef2f2' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>💬</span>
              Keluhan Pelanggan
            </div>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{
              fontSize: '15px',
              color: '#1e293b',
              lineHeight: '1.6',
              background: 'white',
              padding: '16px',
              borderRadius: '8px'
            }}>
              {order.complaint || '-'}
            </div>
          </div>
        </div>

        {/* Diagnosis Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: order.diagnosis ? '#dbeafe' : '#f8fafc' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: order.diagnosis ? '#1e40af' : '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>{order.diagnosis ? '🔍' : '📝'}</span>
              Hasil Diagnosa
            </div>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{
              fontSize: '15px',
              color: order.diagnosis ? '#1e293b' : '#94a3b8',
              lineHeight: '1.6',
              background: order.diagnosis ? 'white' : '#f8fafc',
              padding: '16px',
              borderRadius: '8px'
            }}>
              {order.diagnosis || 'Belum ada diagnosa dari mekanik'}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📋</span>
            Rincian Pengerjaan
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '15px', fontWeight: 600, color: '#4f46e5' }}>
            Rp {totalAmount.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="card-body" style={{ padding: '20px' }}>
          {(!order.order_details || order.order_details.length === 0) ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '12px',
              color: '#94a3b8',
              fontSize: '14px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
              Belum ada item ditambahkan
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.order_details.map((detail) => {
                const typeStyle = getOrderTypeColor(detail.type)
                return (
                  <div
                    key={detail.detail_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{
                          background: typeStyle.bg,
                          color: typeStyle.text,
                          fontSize: '11px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {typeStyle.icon}
                          {detail.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                        {detail.description}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>
                        {detail.quantity} x Rp {detail.unit_price.toLocaleString('id-ID')}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#4f46e5' }}>
                        Rp {detail.subtotal.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment Section */}
      <div className="card">
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f0fdf4' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💳</span>
            Pembayaran
          </div>
          {order.payment && (
            <div style={{ marginLeft: 'auto' }}>
              <StatusBadge status={order.payment.payment_status === PaymentStatus.LUNAS ? PaymentStatus.SELESAI : order.payment.payment_status} />
            </div>
          )}
        </div>

        <div className="card-body" style={{ padding: '20px' }}>
          {order.payment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Total Tagihan</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                  Rp {order.payment.total_bill.toLocaleString('id-ID')}
                </span>
              </div>

              {order.payment.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Diskon</span>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#16a34a' }}>
                    -Rp {order.payment.discount_amount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              {order.payment.dp_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: isUnpaid ? '1px solid #f1f5f9' : '1px solid #dcfce7' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>DP Sudah Dibayar</span>
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>
                    Rp {order.payment.dp_amount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Sisa Pembayaran</span>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: isUnpaid ? '#dc2626' : '#16a34a'
                }}>
                  Rp {order.payment.remaining_amount.toLocaleString('id-ID')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Metode: {order.payment.payment_method}
                </span>
              </div>

              {isUnpaid && order.payment.remaining_amount > 0 && (
                <Link
                  to={`/payments/create?orderId=${order.order_id}`}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    width: '100%',
                    padding: '12px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-8V8l8-4-8"/>
                    <path d="M23 4v6h-6"/>
                  </svg>
                  Proses Pembayaran
                </Link>
              )}
            </div>
          ) : (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
              <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
                Belum ada pembayaran
              </p>
              <Link
                to={`/payments/create?orderId=${order.order_id}`}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-8V8l8-4-8"/>
                  <path d="M23 4v6h-6"/>
                </svg>
                Buat Pembayaran
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Status Servis"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Status Servis <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ServiceStatus)}
                style={{
                  width: '100%',
                  padding: '14px 40px 14px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 500,
                  background: 'white',
                  cursor: 'pointer',
                  appearance: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4f46e5'
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                required
              >
                {Object.values(ServiceStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {/* Custom dropdown icon */}
              <div style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#64748b'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              {/* Status indicator dot */}
              {newStatus && (
                <div style={{
                  position: 'absolute',
                  right: '44px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: getStatusColor(newStatus as ServiceStatus),
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px #e2e8f0'
                }} />
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📌</span>
              <span>Status saat ini: <strong style={{ color: getStatusColor(order?.status as ServiceStatus) }}>{order?.status}</strong></span>
            </div>
          </div>

          {newStatus && newStatus !== ServiceStatus.MENUNGGU_ANTRIAN && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Diagnosa / Keterangan
              </label>
              <Textarea
                placeholder="Tambahkan diagnosa atau keterangan..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowStatusModal(false)
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleStatusUpdate}
              disabled={!newStatus || updating}
              style={{ minWidth: '100px' }}
            >
              {updating ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Mechanic Modal */}
      <Modal
        isOpen={showMechanicModal}
        onClose={() => setShowMechanicModal(false)}
        title="Tugaskan Mekanik"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Warning if no mechanic assigned */}
          {!order?.mechananic && (
            <div style={{
              padding: '12px 16px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ fontSize: '13px', color: '#92400e' }}>
                <strong>Perhatian:</strong> Status tidak dapat diupdate sebelum mekanik ditugaskan.
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Pilih Mekanik <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedMechanic}
                onChange={(e) => setSelectedMechanic(e.target.value)}
                disabled={loadingMechanics}
                style={{
                  width: '100%',
                  padding: '14px 40px 14px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 500,
                  background: 'white',
                  cursor: 'pointer',
                  appearance: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4f46e5'
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                required
              >
                <option value="">Pilih mekanik...</option>
                {mechanics.map(mechanic => (
                  <option key={mechanic.user_id} value={mechanic.user_id}>
                    {mechanic.full_name} (Komisi: {mechanic.commission_rate}%)
                  </option>
                ))}
              </select>
              <div style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#64748b'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            {loadingMechanics && (
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Memuat daftar mekanik...
              </div>
            )}
            {!loadingMechanics && mechanics.length === 0 && (
              <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px' }}>
                Tidak ada mekanik aktif tersedia
              </div>
            )}

            {/* Commission Preview */}
            {selectedMechanic && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: '10px',
                border: '1px solid #86efac'
              }}>
                <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600, marginBottom: '8px' }}>
                  💰 Estimasi Komisi Mekanik
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#15803d' }}>
                    Total Order: <strong>Rp {calculateTotal().toLocaleString('id-ID')}</strong>
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>
                    Rp {((calculateTotal() * (mechanics.find(m => m.user_id === selectedMechanic)?.commission_rate || 0)) / 100).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Current mechanic info */}
          {order?.mechanic && (
            <div style={{
              padding: '12px 16px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px', fontWeight: 600 }}>
                Mekanik Saat Ini:
              </div>
              <div style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: 500 }}>
                {order.mechanic.full_name}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowMechanicModal(false)
                setSelectedMechanic('')
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAssignMechanic}
              disabled={!selectedMechanic || updating}
              style={{ minWidth: '120px' }}
            >
              {updating ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
