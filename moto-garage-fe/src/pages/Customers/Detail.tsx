import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { customerService, vehicleService, orderService } from '@/services'
import type { Customer, Vehicle, ServiceOrder } from '@/types'
import { Button, Card, Modal, Input, Select } from '@/components/ui'

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [serviceHistory, setServiceHistory] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showVehicleModal, setShowVehicleModal] = useState(false)

  const [newVehicle, setNewVehicle] = useState({
    plate_number: '',
    brand_type: ''
  })

  useEffect(() => {
    if (id) {
      loadData(id)
    }
  }, [id])

  const loadData = async (customerId: string) => {
    try {
      setLoading(true)
      const [customerData, vehiclesData, ordersData] = await Promise.all([
        customerService.getCustomerById(customerId),
        vehicleService.getVehiclesByCustomer(customerId),
        orderService.getAllOrders()
      ])

      setCustomer(customerData)
      setVehicles(vehiclesData)
      // Filter orders for this customer
      setServiceHistory(ordersData.filter(o => o.customer_id === customerId))
    } catch (error) {
      console.error('Failed to load customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    try {
      await vehicleService.createVehicle({
        customer_id: customer.customer_id,
        plate_number: newVehicle.plate_number,
        brand_type: newVehicle.brand_type
      })
      await loadData(customer.customer_id)
      setShowVehicleModal(false)
      setNewVehicle({ plate_number: '', brand_type: '' })
    } catch (error: any) {
      console.error('Failed to add vehicle:', error)
      alert(error.message || 'Gagal menambah kendaraan')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '48px' }}>
        <span className="spinner spinner-lg" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p style={{ color: 'var(--color-gray-500)' }}>Pelanggan tidak ditemukan</p>
          <Link to="/customers" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 className="page-title" style={{ margin: 0 }}>{customer.full_name}</h1>
              {customer.is_member && (
                <span className="badge badge-success">Member</span>
              )}
            </div>
            <p className="page-subtitle">Pelanggan sejak {new Date(customer.created_at).toLocaleDateString('id-ID')}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="outline"
              onClick={() => navigate('/customers')}
            >
              Kembali
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/orders/create?customerId=${customer.customer_id}`)}
            >
              + Buat Order Servis
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ gap: '24px' }}>
        {/* Main Content */}
        <div style={{ gridColumn: 'span 2' }}>
          {/* Customer Info */}
          <Card title="Informasi Pelanggan" style={{ marginBottom: '24px' }}>
            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
                  No. WhatsApp
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={`https://wa.me/${customer.phone.replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-success)', textDecoration: 'none', fontWeight: '500' }}
                  >
                    {customer.phone}
                  </a>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
                  Alamat
                </div>
                <div style={{ fontWeight: '500' }}>
                  {customer.address || '-'}
                </div>
              </div>
            </div>
          </Card>

          {/* Vehicles */}
          <Card
            title="Daftar Kendaraan"
            footer={
              <Button
                variant="outline"
                onClick={() => setShowVehicleModal(true)}
                style={{ width: '100%' }}
              >
                + Tambah Kendaraan
              </Button>
            }
            style={{ marginBottom: '24px' }}
          >
            {vehicles.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                Belum ada kendaraan terdaftar
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.vehicle_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'var(--color-gray-50)',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        {vehicle.brand_type}
                      </div>
                      <div style={{
                        fontFamily: 'monospace',
                        background: 'var(--color-gray-200)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        fontSize: '12px'
                      }}>
                        {vehicle.plate_number}
                      </div>
                    </div>
                    <Link
                      to={`/orders/create?vehicleId=${vehicle.vehicle_id}`}
                      className="btn btn-primary btn-sm"
                    >
                      + Servis
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Service History */}
          <Card title="Riwayat Servis">
            {serviceHistory.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                Belum ada riwayat servis
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {serviceHistory.map((order) => (
                  <div
                    key={order.order_id}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--color-gray-200)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {order.vehicle?.brand_type} ({order.vehicle?.plate_number})
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                        {new Date(order.entry_date).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <Link
                      to={`/orders/${order.order_id}`}
                      style={{ fontSize: '12px', color: 'var(--color-primary)' }}
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Quick Stats */}
          <Card title="Statistik" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Total Kendaraan:</span>
                <span style={{ fontWeight: '600' }}>{vehicles.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Total Servis:</span>
                <span style={{ fontWeight: '600' }}>{serviceHistory.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Status Member:</span>
                <span style={{ fontWeight: '600' }}>
                  {customer.is_member ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Aksi Cepat">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={`https://wa.me/${customer.phone.replace(/^0/, '62')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-block"
                style={{ textAlign: 'center', textDecoration: 'none' }}
              >
                💬 Chat WhatsApp
              </a>
              <Link
                to={`/orders/create?customerId=${customer.customer_id}`}
                className="btn btn-primary btn-block"
                style={{ textAlign: 'center' }}
              >
                🔧 Buat Order Servis
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title="Tambah Kendaraan"
      >
        <form onSubmit={handleAddVehicle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Plat Nomor"
              placeholder="Contoh: B 1234 ABC"
              value={newVehicle.plate_number}
              onChange={(e) => setNewVehicle({ ...newVehicle, plate_number: e.target.value })}
              required
            />

            <Input
              label="Jenis Motor"
              placeholder="Contoh: Honda Beat 2020"
              value={newVehicle.brand_type}
              onChange={(e) => setNewVehicle({ ...newVehicle, brand_type: e.target.value })}
              required
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVehicleModal(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Simpan
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
