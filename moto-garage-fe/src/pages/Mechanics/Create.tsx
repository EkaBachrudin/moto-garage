import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userService } from '@/services'
import { Button, Input, Card } from '@/components/ui'

interface FormErrors {
  full_name?: string
  email?: string
  phone?: string
  password?: string
  commission_rate?: string
}

export function CreateMechanic() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    commission_rate: 0
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nama lengkap wajib diisi'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'No. telepon wajib diisi'
    } else if (!/^08\d{8,11}$/.test(formData.phone)) {
      newErrors.phone = 'Format no. telepon tidak valid (dimulai dengan 08)'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password wajib diisi'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter'
    }

    if (formData.commission_rate < 0 || formData.commission_rate > 100) {
      newErrors.commission_rate = 'Komisi harus antara 0-100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)
      await userService.createMechanic(formData)
      navigate('/mechanics')
    } catch (error: any) {
      console.error('Failed to create mechanic:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Gagal menambahkan mekanik'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ paddingBottom: '16px' }}>
        <Link
          to="/mechanics"
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
            textDecoration: 'none',
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
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '24px' }}>Tambah Mekanik</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Tambahkan mekanik baru ke sistem</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <Card>
            <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Informasi Mekanik</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Nama Lengkap <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Input
                  placeholder="Masukkan nama lengkap"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name')(e.target.value)}
                  error={errors.full_name}
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Email <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Input
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email')(e.target.value)}
                  error={errors.email}
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  No. Telepon <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone')(e.target.value)}
                  error={errors.phone}
                  style={{ fontSize: '14px' }}
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Dimulai dengan 08, minimal 10 digit
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => handleChange('password')(e.target.value)}
                  error={errors.password}
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Commission Rate */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Komisi (%) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.commission_rate}
                  onChange={(e) => handleChange('commission_rate')(parseFloat(e.target.value) || 0)}
                  error={errors.commission_rate}
                  style={{ fontSize: '14px' }}
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Persentase komisi dari setiap servis yang dikerjakan (0-100%)
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '12px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <Link
                  to="/mechanics"
                  className="btn btn-outline"
                  style={{ textDecoration: 'none' }}
                >
                  Batal
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  style={{ minWidth: '120px' }}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
