import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderService, customerService, vehicleService, userService } from '@/services'
import { Input, Textarea, Select, Button } from '@/components/ui'
import type { CreateOrderForm, Customer, Vehicle, User } from '@/types'
import { EntryType } from '@/types'

type FormStep = 'select-customer-option' | 'search-customer' | 'select-vehicle' | 'new-customer-vehicle' | 'order-details'

export function CreateOrder() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Main flow state
  const [currentStep, setCurrentStep] = useState<FormStep>('select-customer-option')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // Search customer
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([])
  const [hasSearchedCustomer, setHasSearchedCustomer] = useState(false)

  // Customer vehicles
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)

  // New customer & vehicle
  const [creatingNew, setCreatingNew] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    full_name: '',
    phone: '',
    address: ''
  })
  const [newVehicle, setNewVehicle] = useState({
    plate_number: '',
    brand_type: ''
  })

  // Order form
  const [formData, setFormData] = useState<CreateOrderForm>({
    entry_type: EntryType.WALK_IN,
    complaint: '',
    mechanic_ids: []
  })

  const entryTypeOptions = [
    { value: EntryType.WALK_IN, label: 'Walk-In (Langsung Datang)' },
    { value: EntryType.BOOKING, label: 'Booking (Sudah Janji)' }
  ]

  // Mechanics data
  const [mechanics, setMechanics] = useState<User[]>([])
  const [loadingMechanics, setLoadingMechanics] = useState(false)

  // Load mechanics on mount
  useEffect(() => {
    loadMechanics()
  }, [])

  const loadMechanics = async () => {
    try {
      setLoadingMechanics(true)
      const data = await userService.getMechanics()
      setMechanics(data)
    } catch (error) {
      console.error('Failed to load mechanics:', error)
    } finally {
      setLoadingMechanics(false)
    }
  }

  // Load customer vehicles when customer is selected
  useEffect(() => {
    if (selectedCustomer && currentStep === 'select-vehicle') {
      loadCustomerVehicles()
    }
  }, [selectedCustomer, currentStep])

  const loadCustomerVehicles = async () => {
    if (!selectedCustomer) return

    try {
      setLoadingVehicles(true)
      // Get all vehicles and filter by customer_id
      const allVehicles = await vehicleService.getAllVehicles()
      const customerVehs = allVehicles.filter(v => v.customer_id === selectedCustomer.customer_id)
      setCustomerVehicles(customerVehs)
    } catch (error) {
      console.error('Error loading vehicles:', error)
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleSearchCustomer = async () => {
    if (!customerSearchQuery.trim()) return

    try {
      setSearchingCustomer(true)
      setHasSearchedCustomer(true)
      const results = await customerService.getAllCustomers(customerSearchQuery)
      setCustomerSearchResults(results)
    } catch (error) {
      console.error('Error searching customer:', error)
    } finally {
      setSearchingCustomer(false)
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearchResults([])
    setCustomerSearchQuery('')
    setCurrentStep('select-vehicle')
  }

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setFormData(prev => ({
      ...prev,
      vehicle_id: vehicle.vehicle_id,
      customer_id: vehicle.customer_id
    }))
    setCurrentStep('order-details')
  }

  const handleAddNewVehicle = () => {
    setCurrentStep('new-customer-vehicle')
  }

  const handleCreateNewVehicle = async () => {
    if (!selectedCustomer) {
      alert('Silakan pilih pelanggan terlebih dahulu')
      return
    }
    if (!newVehicle.plate_number.trim() || !newVehicle.brand_type.trim()) {
      alert('Plat nomor dan jenis motor wajib diisi')
      return
    }

    try {
      setCreatingNew(true)

      const vehicle = await vehicleService.createVehicle({
        customer_id: selectedCustomer.customer_id,
        plate_number: newVehicle.plate_number.toUpperCase(),
        brand_type: newVehicle.brand_type
      })

      setSelectedVehicle(vehicle)
      setFormData(prev => ({
        ...prev,
        vehicle_id: vehicle.vehicle_id,
        customer_id: selectedCustomer.customer_id
      }))

      setCurrentStep('order-details')
      setNewVehicle({ plate_number: '', brand_type: '' })
    } catch (error) {
      console.error('Failed to create vehicle:', error)
      alert('Gagal membuat data kendaraan')
    } finally {
      setCreatingNew(false)
    }
  }

  const handleCreateNewCustomerAndVehicle = async () => {
    if (!newCustomer.full_name.trim() || !newCustomer.phone.trim()) {
      alert('Nama dan telepon pelanggan wajib diisi')
      return
    }
    if (!newVehicle.plate_number.trim() || !newVehicle.brand_type.trim()) {
      alert('Plat nomor dan jenis motor wajib diisi')
      return
    }

    try {
      setCreatingNew(true)

      const customer = await customerService.createCustomer({
        full_name: newCustomer.full_name,
        phone: newCustomer.phone,
        address: newCustomer.address || '',
        is_member: false
      })

      const vehicle = await vehicleService.createVehicle({
        customer_id: customer.customer_id,
        plate_number: newVehicle.plate_number.toUpperCase(),
        brand_type: newVehicle.brand_type
      })

      setSelectedCustomer(customer)
      setSelectedVehicle(vehicle)
      setFormData(prev => ({
        ...prev,
        vehicle_id: vehicle.vehicle_id,
        customer_id: customer.customer_id
      }))

      setCurrentStep('order-details')
      setNewCustomer({ full_name: '', phone: '', address: '' })
      setNewVehicle({ plate_number: '', brand_type: '' })
    } catch (error) {
      console.error('Failed to create customer/vehicle:', error)
      alert('Gagal membuat data pelanggan & kendaraan')
    } finally {
      setCreatingNew(false)
    }
  }

  const handleBackToSearch = () => {
    setCurrentStep('select-customer-option')
    setSelectedCustomer(null)
    setSelectedVehicle(null)
    setCustomerVehicles([])
    setCustomerSearchResults([])
    setHasSearchedCustomer(false)
    setCustomerSearchQuery('')
  }

  const handleChangeCustomer = () => {
    setCurrentStep('search-customer')
    setSelectedCustomer(null)
    setSelectedVehicle(null)
    setCustomerVehicles([])
    setCustomerSearchResults([])
    setHasSearchedCustomer(false)
    setCustomerSearchQuery('')
  }

  const handleBackToVehicleSelect = () => {
    setCurrentStep('select-vehicle')
    setSelectedVehicle(null)
    setNewVehicle({ plate_number: '', brand_type: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const order = await orderService.createOrder(formData)
      navigate(`/orders/${order.order_id}`)
    } catch (error) {
      console.error('Failed to create order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat order'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Buat Order Servis Baru</h1>
        <p className="page-subtitle">Input data order servis baru</p>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '16px',
          alignItems: 'center'
        }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: currentStep === 'select-customer-option' ? '#6366f1' : (currentStep !== 'order-details' ? '#e2e8f0' : '#dcfce7'),
            color: currentStep === 'select-customer-option' ? '#ffffff' : (currentStep !== 'order-details' ? '#64748b' : '#166534')
          }}>
            1. Pelanggan
          </div>
          <div style={{ color: '#cbd5e1' }}>→</div>
          <div style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: currentStep === 'select-vehicle' || currentStep === 'new-customer-vehicle' || currentStep === 'search-customer' ? '#6366f1' : (currentStep === 'order-details' ? '#dcfce7' : '#e2e8f0'),
            color: currentStep === 'select-vehicle' || currentStep === 'new-customer-vehicle' || currentStep === 'search-customer' ? '#ffffff' : (currentStep === 'order-details' ? '#166534' : '#64748b')
          }}>
            2. Motor
          </div>
          <div style={{ color: '#cbd5e1' }}>→</div>
          <div style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: currentStep === 'order-details' ? '#6366f1' : '#e2e8f0',
            color: currentStep === 'order-details' ? '#ffffff' : '#64748b'
          }}>
            3. Detail Order
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {/* STEP 0: Select Customer Option */}
            {currentStep === 'select-customer-option' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>
                  Pilih Opsi Pelanggan
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Search Existing Customer */}
                  <div
                    onClick={() => setCurrentStep('search-customer')}
                    style={{
                      padding: '32px 24px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                      Cari Pelanggan
                    </h4>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                      Cari pelanggan yang sudah terdaftar berdasarkan nama atau nomor telepon
                    </p>
                  </div>

                  {/* Create New Customer */}
                  <div
                    onClick={() => setCurrentStep('new-customer-vehicle')}
                    style={{
                      padding: '32px 24px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>➕</div>
                    <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                      Buat Pelanggan Baru
                    </h4>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                      Tambahkan pelanggan baru beserta data kendaraannya
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Search Customer */}
            {currentStep === 'search-customer' && (
              <div>
                {/* Back Button */}
                <Button
                  type="button"
                  onClick={() => setCurrentStep('select-customer-option')}
                  variant="outline"
                  style={{ marginBottom: '16px' }}
                >
                  ← Kembali
                </Button>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{marginBottom: '10px'}} className="form-label">Cari Pelanggan (Nama atau Telepon)</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Input
                      placeholder="Contoh: Budi atau 62812345678"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      style={{ flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearchCustomer()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleSearchCustomer}
                      disabled={searchingCustomer}
                      variant="secondary"
                    >
                      {searchingCustomer ? 'Mencari...' : 'Cari'}
                    </Button>
                  </div>
                </div>

                {/* Search Results */}
                {customerSearchResults.length > 0 && (
                  <div>
                    <label className="form-label">Hasil Pencarian ({customerSearchResults.length})</label>
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff'
                    }}>
                      {customerSearchResults.map(customer => (
                        <div
                          key={customer.customer_id}
                          onClick={() => handleSelectCustomer(customer)}
                          style={{
                            padding: '16px',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>
                            {customer.full_name}
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            📞 {customer.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results + Option to Create New */}
                {customerSearchResults.length === 0 && customerSearchQuery && !searchingCustomer && hasSearchedCustomer && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#92400e' }}>
                      <strong>Tidak ditemukan pelanggan "{customerSearchQuery}"</strong>
                    </p>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep('new-customer-vehicle')}
                      variant="primary"
                    >
                      + Buat Pelanggan Baru
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2a: Select Vehicle (for existing customer) */}
            {currentStep === 'select-vehicle' && selectedCustomer && (
              <div>
                {/* Selected Customer Info */}
                <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                  <strong>✓ Pelanggan:</strong> {selectedCustomer.full_name} ({selectedCustomer.phone})
                  <button
                    type="button"
                    onClick={handleChangeCustomer}
                    style={{
                      marginLeft: '12px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    Ganti
                  </button>
                </div>

                <label className="form-label">Pilih Motor yang Akan Diservis</label>

                {loadingVehicles ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Memuat daftar motor...
                  </div>
                ) : customerVehicles.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    {customerVehicles.map(vehicle => {
                      const cannotOrder = vehicle.can_order === false
                      return (
                        <div
                          key={vehicle.vehicle_id}
                          onClick={() => !cannotOrder && handleSelectVehicle(vehicle)}
                          style={{
                            padding: '16px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            cursor: cannotOrder ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: '#ffffff',
                            opacity: cannotOrder ? 0.5 : 1,
                            filter: cannotOrder ? 'grayscale(100%)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!cannotOrder) {
                              e.currentTarget.style.borderColor = '#6366f1'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.1)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!cannotOrder) {
                              e.currentTarget.style.borderColor = '#e2e8f0'
                              e.currentTarget.style.boxShadow = 'none'
                            }
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b', marginBottom: '8px' }}>
                            🏍️ {vehicle.brand_type}
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Plat: <strong>{vehicle.plate_number}</strong>
                          </div>
                          {cannotOrder && vehicle.current_order_status && (
                            <div style={{
                              marginTop: '8px',
                              padding: '6px 8px',
                              backgroundColor: '#fee2e2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#dc2626',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              🚫 {vehicle.order_blocked_reason || 'Tidak dapat di-order'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#64748b' }}>
                      Pelanggan ini belum memiliki motor terdaftar
                    </p>
                  </div>
                )}

                {/* Add New Vehicle Button */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#64748b' }}>
                    Motor yang akan diservis belum terdaftar?
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddNewVehicle}
                    variant="outline"
                  >
                    + Tambah Motor Baru
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2b: New Customer & Vehicle OR New Vehicle for Existing Customer */}
            {currentStep === 'new-customer-vehicle' && (
              <div>
                {selectedCustomer ? (
                  // Existing customer - just add vehicle
                  <>
                    <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                      <strong>✓ Pelanggan:</strong> {selectedCustomer.full_name}
                      <button
                        type="button"
                        onClick={handleBackToVehicleSelect}
                        style={{
                          marginLeft: '12px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        ← Kembali
                      </button>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                      Tambah Motor Baru untuk {selectedCustomer.full_name}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                      <Input
                        label="Plat Nomor"
                        placeholder="Contoh: B 1234 ABC"
                        value={newVehicle.plate_number}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, plate_number: e.target.value }))}
                        style={{ textTransform: 'uppercase' }}
                        required
                      />
                      <Input
                        label="Jenis Motor"
                        placeholder="Contoh: Honda Vario 150"
                        value={newVehicle.brand_type}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, brand_type: e.target.value }))}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        type="button"
                        onClick={handleBackToVehicleSelect}
                        variant="outline"
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCreateNewVehicle}
                        disabled={creatingNew}
                        variant="primary"
                      >
                        {creatingNew ? 'Menyimpan...' : 'Simpan & Lanjut'}
                      </Button>
                    </div>
                  </>
                ) : (
                  // New customer
                  <>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                      Buat Pelanggan & Motor Baru
                    </h3>

                    <div style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                        Data Pelanggan
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Input
                          placeholder="Nama lengkap"
                          value={newCustomer.full_name}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, full_name: e.target.value }))}
                        />
                        <Input
                          placeholder="Nomor telepon (62812345678)"
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        />
                        <Input
                          placeholder="Alamat (opsional)"
                          value={newCustomer.address}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                        Data Kendaraan
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Input
                          placeholder="Plat nomor (B 1234 ABC)"
                          value={newVehicle.plate_number}
                          onChange={(e) => setNewVehicle(prev => ({ ...prev, plate_number: e.target.value }))}
                          style={{ textTransform: 'uppercase' }}
                        />
                        <Input
                          placeholder="Jenis motor (Honda Vario 150)"
                          value={newVehicle.brand_type}
                          onChange={(e) => setNewVehicle(prev => ({ ...prev, brand_type: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        type="button"
                        onClick={handleBackToSearch}
                        variant="outline"
                      >
                        ← Kembali
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCreateNewCustomerAndVehicle}
                        disabled={creatingNew}
                        variant="primary"
                      >
                        {creatingNew ? 'Menyimpan...' : 'Simpan & Lanjut'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 3: Order Details */}
            {currentStep === 'order-details' && selectedCustomer && selectedVehicle && (
              <>
                {/* Summary */}
                <div className="alert alert-success" style={{ marginBottom: '24px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    ✓ Pelanggan: {selectedCustomer.full_name}
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    🏍️ {selectedVehicle.brand_type} ({selectedVehicle.plate_number})
                  </div>
                  <button
                    type="button"
                    onClick={handleBackToVehicleSelect}
                    style={{
                      marginTop: '8px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    ← Ganti pilihan
                  </button>
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
                    placeholder={loadingMechanics ? 'Memuat mekanik...' : 'Pilih mekanik (opsional)'}
                    disabled={loadingMechanics}
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
              </>
            )}
          </div>

          {/* Footer Buttons */}
          {currentStep === 'order-details' && (
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
          )}
        </form>
      </div>
    </div>
  )
}
