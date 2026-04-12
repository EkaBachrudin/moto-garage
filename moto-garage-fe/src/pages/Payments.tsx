import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { paymentService, orderService } from '@/services'
import type { Payment, ServiceOrder } from '@/types'
import { PaymentStatus, PaymentMethod } from '@/types'
import { Table, Button, Input, Select, StatusBadge, Card } from '@/components/ui'
import type { Column } from '@/components/ui'

const columns: Column<Payment>[] = [
  {
    key: 'payment_id',
    title: 'Payment ID',
    render: (_, record) => (
      <Link to={`/orders/${record.order_id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
        {record.payment_id}
      </Link>
    )
  },
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
    key: 'total_bill',
    title: 'Total Tagihan',
    render: (_, record) => `Rp ${record.total_bill.toLocaleString('id-ID')}`
  },
  {
    key: 'dp_amount',
    title: 'DP',
    render: (_, record) => record.dp_amount > 0 ? `Rp ${record.dp_amount.toLocaleString('id-ID')}` : '-'
  },
  {
    key: 'remaining_amount',
    title: 'Sisa',
    render: (_, record) => (
      <span style={{ color: record.remaining_amount > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
        Rp {record.remaining_amount.toLocaleString('id-ID')}
      </span>
    )
  },
  {
    key: 'payment_status',
    title: 'Status',
    render: (_, record) => <StatusBadge status={record.payment_status} />
  },
  {
    key: 'payment_method',
    title: 'Metode',
    render: (_, record) => record.payment_method
  },
  {
    key: 'payment_date',
    title: 'Tanggal',
    render: (_, record) => new Date(record.payment_date).toLocaleDateString('id-ID')
  }
]

export function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const data = await paymentService.getAllPayments()
      setPayments(data)
    } catch (error) {
      console.error('Failed to load payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalOmzet = payments.reduce((sum, p) => sum + p.total_bill, 0)
  const totalLaba = Math.round(totalOmzet * 0.4) // Simplified calculation

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pembayaran</h1>
        <p className="page-subtitle">Riwayat pembayaran dan tagihan</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3" style={{ gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>Total Omzet</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              Rp {totalOmzet.toLocaleString('id-ID')}
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>Estimasi Laba</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-success)' }}>
              Rp {totalLaba.toLocaleString('id-ID')}
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>Total Transaksi</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {payments.length}
            </div>
          </div>
        </Card>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title" style={{ margin: 0 }}>Riwayat Pembayaran</h3>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <Table
            columns={columns}
            data={payments}
            keyField="payment_id"
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export function CreatePayment() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    total_bill: 0,
    discount_amount: 0,
    dp_amount: 0,
    payment_method: PaymentMethod.TUNAI
  })

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId)
    }
  }, [orderId])

  const loadOrder = async (id: string) => {
    try {
      setLoading(true)
      const data = await orderService.getOrderById(id)
      setOrder(data)

      // Calculate total from order details
      const total = data.order_details?.reduce((sum, detail) => sum + detail.subtotal, 0) || 0
      setFormData(prev => ({
        ...prev,
        total_bill: total,
        dp_amount: data.payment?.dp_amount || 0
      }))
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const remainingAmount = formData.total_bill - formData.discount_amount - formData.dp_amount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!order) return

    try {
      setSubmitting(true)
      await paymentService.createPayment({
        order_id: order.order_id,
        ...formData
      })
      window.history.back()
    } catch (error) {
      console.error('Failed to create payment:', error)
      alert('Gagal membuat pembayaran')
    } finally {
      setSubmitting(false)
    }
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
          <Link to="/payments" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Buat Pembayaran</h1>
        <p className="page-subtitle">Order #{order.order_id}</p>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {/* Payment Form */}
        <Card title="Form Pembayaran">
          <form onSubmit={handleSubmit}>
            <div className="card-body">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
                  Pelanggan
                </div>
                <div style={{ fontWeight: '500' }}>{order.customer?.full_name}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
                  Kendaraan
                </div>
                <div style={{ fontWeight: '500' }}>
                  {order.vehicle?.brand_type} ({order.vehicle?.plate_number})
                </div>
              </div>

              <Input
                label="Total Tagihan"
                type="number"
                value={formData.total_bill}
                onChange={(e) => setFormData({ ...formData, total_bill: parseFloat(e.target.value) || 0 })}
                disabled
                style={{ marginBottom: '16px' }}
              />

              <Input
                label="Diskon"
                type="number"
                placeholder="0"
                value={formData.discount_amount}
                onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                style={{ marginBottom: '16px' }}
              />

              <Input
                label="DP (Uang Muka)"
                type="number"
                placeholder="0"
                value={formData.dp_amount}
                onChange={(e) => setFormData({ ...formData, dp_amount: parseFloat(e.target.value) || 0 })}
                style={{ marginBottom: '16px' }}
              />

              <Select
                label="Metode Pembayaran"
                options={[
                  { value: PaymentMethod.TUNAI, label: 'Tunai' },
                  { value: PaymentMethod.DEBIT, label: 'Debit' },
                  { value: PaymentMethod.QRIS, label: 'QRIS' }
                ]}
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                style={{ marginBottom: '16px' }}
              />

              <div style={{
                padding: '16px',
                background: remainingAmount <= 0 ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                  <span>Sisa Pembayaran:</span>
                  <span style={{ color: remainingAmount <= 0 ? 'var(--color-success-hover)' : 'var(--color-warning-hover)' }}>
                    Rp {remainingAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <Link to={`/orders/${order.order_id}`} className="btn btn-outline">
                Batal
              </Link>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Order Details */}
        <Card title="Rincian Order">
          <div className="card-body">
            {(!order.order_details || order.order_details.length === 0) ? (
              <p style={{ color: 'var(--color-gray-400)', textAlign: 'center', padding: '32px' }}>
                Belum ada item
              </p>
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
                    <div>
                      <div style={{ fontWeight: '500' }}>{detail.description}</div>
                      <div style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>
                        {detail.quantity} x Rp {detail.unit_price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600' }}>
                      Rp {detail.subtotal.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
