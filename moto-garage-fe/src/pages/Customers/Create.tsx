import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { customerService } from '@/services'
import { Input, Textarea, Button } from '@/components/ui'
import type { CreateCustomerForm } from '@/types'

export function CreateCustomer() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<CreateCustomerForm>({
    full_name: '',
    phone: '',
    address: '',
    is_member: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const customer = await customerService.createCustomer(formData)
      navigate(`/customers/${customer.customer_id}`)
    } catch (error) {
      console.error('Failed to create customer:', error)
      alert('Gagal membuat pelanggan')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateCustomerForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tambah Pelanggan Baru</h1>
        <p className="page-subtitle">Input data pelanggan baru</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap pelanggan"
              value={formData.full_name}
              onChange={handleChange('full_name')}
              required
            />

            <Input
              label="No. WhatsApp"
              placeholder="Contoh: 628123456789"
              value={formData.phone}
              onChange={handleChange('phone')}
              hint="Gunakan format internasional (62...) tanpa +"
              required
            />

            <Textarea
              label="Alamat"
              placeholder="Masukkan alamat lengkap"
              value={formData.address}
              onChange={handleChange('address')}
              rows={3}
            />

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_member}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_member: e.target.checked }))}
                />
                <span>Jadikan sebagai Member (diskon repeat order)</span>
              </label>
            </div>
          </div>

          <div className="card-footer">
            <Link to="/customers" className="btn btn-outline">
              Batal
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Pelanggan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
