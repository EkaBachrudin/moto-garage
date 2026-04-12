import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderService, customerService, vehicleService } from '@/services'
import { Input, Textarea, Select, Button } from '@/components/ui'
import type { CreateOrderForm, Customer, Vehicle, User } from '@/types'
import { EntryType } from '@/types'

export function CreateOrder() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [searchingPlate, setSearchingPlate] = useState(false)
  const [plateNumber, setPlateNumber] = useState('')
  const [foundVehicle, setFoundVehicle] = useState<Vehicle | null>(null)
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)

  const [formData, setFormData] = useState<CreateOrderForm>({
    entry_type: EntryType.WALK_IN,
    complaint: '',
    mechanic_ids: []
  })

  const entryTypeOptions = [
    { value: EntryType.WALK_IN, label: 'Walk-In (Langsung Datang)' },
    { value: EntryType.BOOKING, label: 'Booking (Sudah Janji)' }
  ]

  // Mock mechanics data
  const mechanics: User[] = [
    { user_id: 'm1', role_id: 'r3', full_name: 'Andi Mekanik', email: 'andi@example.com', phone: '628111', commission_rate: 10, is_active: true, created_at: '', updated_at: '' },
    { user_id: 'm2', role_id: 'r3', full_name: 'Budi Mekanik', email: 'budi@example.com', phone: '628222', commission_rate: 10, is_active: true, created_at: '', updated_at: '' }
  ]

  const handleSearchPlate = async () => {
    if (!plateNumber.trim()) return

    try {
      setSearchingPlate(true)
      const vehicle = await vehicleService.findVehicleByPlate(plateNumber)

      if (vehicle) {
        setFoundVehicle(vehicle)
        // Get customer data
        const customer = await customerService.getCustomerById(vehicle.customer_id)
        setFoundCustomer(customer)
        setFormData(prev => ({
          ...prev,
          vehicle_id: vehicle.vehicle_id,
          customer_id: vehicle.customer_id
        }))
      } else {
        setFoundVehicle(null)
        setFoundCustomer(null)
        // Vehicle not found, user can create new one
      }
    } catch (error) {
      console.error('Error searching plate:', error)
    } finally {
      setSearchingPlate(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_id || !formData.vehicle_id) {
      alert('Silakan cari atau buat data kendaraan terlebih dahulu')
      return
    }

    try {
      setLoading(true)
      const order = await orderService.createOrder(formData)
      navigate(`/orders/${order.order_id}`)
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Gagal membuat order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Buat Order Servis Baru</h1>
        <p className="page-subtitle">Input data order servis baru</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {/* Search Vehicle by Plate Number */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Cari Kendaraan (Plat Nomor)</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Input
                  placeholder="Contoh: B 1234 ABC"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  type="button"
                  onClick={handleSearchPlate}
                  disabled={searchingPlate}
                  variant="secondary"
                >
                  {searchingPlate ? 'Mencari...' : 'Cari'}
                </Button>
              </div>

              {foundVehicle && (
                <div className="alert alert-success" style={{ marginTop: '12px' }}>
                  <strong>✓ Kendaraan ditemukan:</strong> {foundVehicle.brand_type} ({foundVehicle.plate_number})
                  {foundCustomer && <span> - Pemilik: {foundCustomer.full_name}</span>}
                </div>
              )}
            </div>

            <div className="form-row form-row-2">
              <Select
                label="Tipe Masuk"
                options={entryTypeOptions}
                value={formData.entry_type}
                onChange={(e) => setFormData(prev => ({ ...prev, entry_type: e.target.value as EntryType }))}
                required
              />

              <Select
                label="Mekanik PIC"
                options={mechanics.map(m => ({ value: m.user_id, label: m.full_name }))}
                value={formData.mechanic_ids[0] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mechanic_ids: [e.target.value] }))}
                placeholder="Pilih mekanik (opsional)"
              />
            </div>

            <Textarea
              label="Keluhan Pelanggan"
              placeholder="Jelaskan keluhan atau permintaan pelanggan..."
              value={formData.complaint}
              onChange={(e) => setFormData(prev => ({ ...prev, complaint: e.target.value }))}
              required
              rows={4}
            />
          </div>

          <div className="card-footer">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/orders')}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Buat Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
