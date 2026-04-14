import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { userService } from '@/services'
import type { User } from '@/types'
import { Button, Input, Card, Modal } from '@/components/ui'

interface FormErrors {
  full_name?: string
  email?: string
  phone?: string
  password?: string
  commission_rate?: string
}

export function EditMechanic() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mechanic, setMechanic] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    commission_rate: 0,
    is_active: true
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (id) {
      loadMechanic(id)
    }
  }, [id])

  const loadMechanic = async (mechanicId: string) => {
    try {
      setLoading(true)
      const data = await userService.getUserById(mechanicId)
      setMechanic(data)
      setFormData({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        password: '',
        commission_rate: data.commission_rate || 0,
        is_active: data.is_active
      })
    } catch (error) {
      console.error('Failed to load mechanic:', error)
      alert('Gagal memuat data mekanik')
      navigate('/mechanics')
    } finally {
      setLoading(false)
    }
  }

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

    if (formData.password && formData.password.length < 6) {
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
      setSaving(true)
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        commission_rate: formData.commission_rate,
        is_active: formData.is_active
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      await userService.updateMechanic(id!, updateData)
      navigate('/mechanics')
    } catch (error: any) {
      console.error('Failed to update mechanic:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Gagal mengupdate mekanik'
      alert(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return

    try {
      setSaving(true)
      await userService.deleteMechanic(id)
      navigate('/mechanics')
    } catch (error: any) {
      console.error('Failed to delete mechanic:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Gagal menghapus mekanik'
      alert(errorMsg)
    } finally {
      setSaving(false)
      setShowDeleteModal(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (!mechanic) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🔧</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
              Mekanik Tidak Ditemukan
            </h3>
            <Link to="/mechanics" className="btn btn-primary">
              Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>
    )
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
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
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
              color: 'white',
              fontSize: '20px',
              fontWeight: 700
            }}>
              {mechanic.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="page-title" style={{ margin: 0, fontSize: '24px' }}>{mechanic.full_name}</h1>
              <p className="page-subtitle" style={{ margin: 0 }}>Edit informasi mekanik</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            style={{
              borderColor: '#dc2626',
              color: '#dc2626'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Hapus
          </Button>
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
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  value={formData.password}
                  onChange={(e) => handleChange('password')(e.target.value)}
                  error={errors.password}
                  style={{ fontSize: '14px' }}
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Minimal 6 karakter. Biarkan kosong jika tidak ingin mengubah password.
                </div>
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
              </div>

              {/* Active Status */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active')(e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#4f46e5'
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>
                    Mekanik Aktif
                  </span>
                </label>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', marginLeft: '32px' }}>
                  Non-aktifkan jika mekanik tidak tersedia untuk mengerjakan servis
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
                  disabled={saving}
                  style={{ minWidth: '120px' }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Mekanik"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: '#fef2f2',
            borderRadius: '12px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <p style={{ color: '#991b1b', fontSize: '15px', fontWeight: 500, margin: 0 }}>
              Apakah Anda yakin ingin menghapus mekanik ini?
            </p>
            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '8px', margin: 0 }}>
              <strong>{mechanic.full_name}</strong>
            </p>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '12px', margin: 0 }}>
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleDelete}
              disabled={saving}
              style={{
                background: '#dc2626',
                borderColor: '#dc2626',
                minWidth: '100px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b91c1c'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dc2626'
              }}
            >
              {saving ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
