import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { inventoryService } from '@/services'
import { Input, Button, Select, Card } from '@/components/ui'
import type { CreateProductForm, Supplier, Category } from '@/types'

export function CreateProduct() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState<CreateProductForm>({
    category_id: '',
    supplier_id: '',
    name: '',
    buy_price: 0,
    sell_price: 0,
    stock_qty: 0,
    min_stock: 5,
    unit_buy: 'Pcs',
    unit_sell: 'Pcs',
    conversion: 1
  })

  useEffect(() => {
    loadDropdownData()
  }, [])

  const loadDropdownData = async () => {
    try {
      const [suppliersData, categoriesData] = await Promise.all([
        inventoryService.getAllSuppliers(),
        inventoryService.getAllCategories()
      ])
      setSuppliers(suppliersData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load dropdown data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const product = await inventoryService.createProduct(formData)
      navigate(`/inventory/${product.product_id}`)
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Gagal membuat produk')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = field === 'buy_price' || field === 'sell_price' || field === 'stock_qty' || field === 'min_stock' || field === 'conversion'
      ? parseFloat(e.target.value) || 0
      : e.target.value

    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const unitOptions = [
    { value: 'Pcs', label: 'Pcs (Piece)' },
    { value: 'Dus', label: 'Dus' },
    { value: 'Kaleng', label: 'Kaleng' },
    { value: 'Botol', label: 'Botol' },
    { value: 'Unit', label: 'Unit' },
    { value: 'Lusin', label: 'Lusin' }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tambah Produk Baru</h1>
        <p className="page-subtitle">Input data produk sparepart/aksesoris</p>
      </div>

      <div className="grid grid-cols-3" style={{ gap: '24px' }}>
        {/* Main Form */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card>
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                <div className="form-row form-row-2">
                  <Select
                    label="Kategori"
                    options={categories.map(c => ({ value: c.category_id, label: c.name }))}
                    value={formData.category_id}
                    onChange={handleChange('category_id')}
                    required
                  />

                  <Select
                    label="Supplier"
                    options={suppliers.map(s => ({ value: s.supplier_id, label: s.name }))}
                    value={formData.supplier_id}
                    onChange={handleChange('supplier_id')}
                    required
                  />
                </div>

                <Input
                  label="Nama Barang"
                  placeholder="Masukkan nama barang"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />

                <div className="form-row form-row-2">
                  <Input
                    label="Harga Beli (Modal)"
                    type="number"
                    placeholder="0"
                    value={formData.buy_price}
                    onChange={handleChange('buy_price')}
                    required
                  />

                  <Input
                    label="Harga Jual"
                    type="number"
                    placeholder="0"
                    value={formData.sell_price}
                    onChange={handleChange('sell_price')}
                    required
                  />
                </div>

                <div className="form-row form-row-2">
                  <Input
                    label="Stok Saat Ini"
                    type="number"
                    placeholder="0"
                    value={formData.stock_qty}
                    onChange={handleChange('stock_qty')}
                    required
                  />

                  <Input
                    label="Minimum Stok (Alert)"
                    type="number"
                    placeholder="5"
                    value={formData.min_stock}
                    onChange={handleChange('min_stock')}
                    hint="Stok di bawah angka ini akan memunculkan alert"
                    required
                  />
                </div>
              </div>

              <div className="card-footer">
                <Link to="/inventory" className="btn btn-outline">
                  Batal
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Produk'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar - Unit & Conversion Info */}
        <div>
          <Card title="Satuan & Konversi" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Select
                label="Satuan Beli"
                options={unitOptions}
                value={formData.unit_buy}
                onChange={handleChange('unit_buy')}
                hint="Satuan saat membeli dari supplier"
                required
              />

              <Select
                label="Satuan Jual"
                options={unitOptions}
                value={formData.unit_sell}
                onChange={handleChange('unit_sell')}
                hint="Satuan saat menjual ke pelanggan"
                required
              />

              <Input
                label="Rasio Konversi"
                type="number"
                placeholder="1"
                value={formData.conversion}
                onChange={handleChange('conversion')}
                hint="Berapa unit jual dalam 1 unit beli (contoh: 1 Dus = 12 Pcs)"
                required
              />

              {formData.conversion > 1 && (
                <div className="alert alert-info" style={{ marginTop: '8px' }}>
                  <strong>Info Konversi:</strong><br />
                  1 {formData.unit_buy} = {formData.conversion} {formData.unit_sell}
                </div>
              )}
            </div>
          </Card>

          <Card title="💡 Tips">
            <div style={{ fontSize: '14px', color: 'var(--color-gray-600)', lineHeight: '1.5' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>Harga Jual vs Harga Beli</strong><br />
                Pastikan harga jual sudah termasuk margin yang diinginkan.
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>Minimum Stok</strong><br />
                Setel stok minimum untuk mendapatkan notifikasi saat barang hampir habis.
              </p>
              <p>
                <strong>Konversi Satuan</strong><br />
                Gunakan fitur konversi jika barang dibeli dalam jumlah besar (dus/karung) tapi dijual eceran.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
