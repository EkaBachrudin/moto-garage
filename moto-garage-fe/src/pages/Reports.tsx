import { useEffect, useState } from 'react'
import { reportService } from '@/services'
import type { DailyReport } from '@/types'
import { Card, Button, Select } from '@/components/ui'

export function Reports() {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<DailyReport | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadReport(selectedDate)
  }, [selectedDate])

  const loadReport = async (date: string) => {
    try {
      setLoading(true)
      const data = await reportService.getDailyReport(date)
      setReport(data)
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '48px' }}>
        <span className="spinner spinner-lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Laporan Harian</h1>
            <p className="page-subtitle">Laporan keuangan dan operasional bengkel</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-gray-300)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <Button variant="outline" onClick={() => window.print()}>
              📄 Cetak Laporan
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Report */}
      <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
        <Card title="💰 Laporan Keuangan">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--color-gray-500)' }}>Omzet (Pendapatan Kotor)</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                Rp {report.omzet.toLocaleString('id-ID')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--color-gray-500)' }}>Laba Kotor</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-success)' }}>
                Rp {report.laba_kotor.toLocaleString('id-ID')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-success-light)', borderRadius: '8px' }}>
              <span style={{ fontWeight: '500', color: 'var(--color-success-hover)' }}>Margin</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-success-hover)' }}>
                {report.omzet > 0 ? Math.round((report.laba_kotor / report.omzet) * 100) : 0}%
              </span>
            </div>
          </div>
        </Card>

        <Card title="🏍️ Laporan Operasional">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--color-gray-500)' }}>Unit Entry</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {report.unit_entry} motor
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--color-gray-500)' }}>Rata-rata per Unit</span>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                Rp {report.unit_entry > 0 ? Math.round(report.omzet / report.unit_entry).toLocaleString('id-ID') : 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card title="📊 Progress Order per Status" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {report.orders_by_status.map((item) => (
            <div
              key={item.status}
              style={{
                padding: '16px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: getStatusColor(item.status)
                }} />
                <span style={{ fontSize: '14px' }}>{item.status}</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Low Stock Alert */}
      {report.low_stock_products.length > 0 && (
        <Card
          title="⚠️ Stok Menipis (Perlu Restock)"
          style={{ border: '1px solid var(--color-warning)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {report.low_stock_products.map((product) => (
              <div
                key={product.product_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--color-warning-light)',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{product.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                    Supplier: {product.supplier?.name || '-'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: product.stock_qty <= 0 ? 'var(--color-error)' : 'var(--color-warning-hover)'
                  }}>
                    {product.stock_qty} / {product.min_stock}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                    {product.unit_sell}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Menunggu Antrian': 'var(--status-menunggu-text)',
    'Pengecekan': 'var(--status-pengecekan-text)',
    'Sedang Dikerjakan': 'var(--status-dikerjakan-text)',
    'Konfirmasi Part': 'var(--status-konfirmasi-text)',
    'Menunggu Sparepart': 'var(--status-menunggu-part-text)',
    'Selesai': 'var(--status-selesai-text)'
  }
  return colors[status] || 'var(--color-gray-400)'
}
