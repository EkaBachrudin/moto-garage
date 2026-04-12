import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { inventoryService } from '@/services'
import type { Product } from '@/types'
import { Table, Button, Input, Select, CategoryBadge, StockBadge } from '@/components/ui'
import type { Column } from '@/components/ui'

const columns: Column<Product>[] = [
  {
    key: 'name',
    title: 'Nama Barang',
    render: (_, record) => (
      <Link to={`/inventory/${record.product_id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>
        {record.name}
      </Link>
    )
  },
  {
    key: 'category',
    title: 'Kategori',
    render: (_, record) => <CategoryBadge category={record.category?.name || 'Sparepart'} />
  },
  {
    key: 'supplier',
    title: 'Supplier',
    render: (_, record) => record.supplier?.name || '-'
  },
  {
    key: 'stock_qty',
    title: 'Stok',
    render: (_, record) => <StockBadge stock={record.stock_qty} minStock={record.min_stock} />
  },
  {
    key: 'sell_price',
    title: 'Harga Jual',
    render: (_, record) => `Rp ${record.sell_price.toLocaleString('id-ID')}`
  },
  {
    key: 'buy_price',
    title: 'Harga Beli',
    render: (_, record) => `Rp ${record.buy_price.toLocaleString('id-ID')}`
  }
]

export function InventoryList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [search, categoryFilter, showLowStockOnly])

  const loadProducts = async () => {
    try {
      setLoading(true)
      let data = await inventoryService.getAllProducts(categoryFilter, search)

      if (showLowStockOnly) {
        data = data.filter(p => p.stock_qty <= p.min_stock)
      }

      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const lowStockCount = products.filter(p => p.stock_qty <= p.min_stock).length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inventaris</h1>
        <p className="page-subtitle">Kelola stok sparepart dan aksesoris</p>
      </div>

      {lowStockCount > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
          ⚠️ <strong>{lowStockCount}</strong> produk dengan stok menipis (perlu restock)
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="card-title" style={{ margin: 0 }}>Daftar Produk</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '200px' }}
            />
            <select
              className="select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '6px 12px', border: '1px solid var(--color-gray-300)', borderRadius: '6px' }}
            >
              <option value="">Semua Kategori</option>
              <option value="Sparepart">Sparepart</option>
              <option value="Aksesoris">Aksesoris</option>
            </select>
            <label className="checkbox-label" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
              />
              <span>Hanya Stok Menipis</span>
            </label>
            <Link to="/inventory/create" className="btn btn-primary">
              + Produk Baru
            </Link>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <Table
            columns={columns}
            data={products}
            keyField="product_id"
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
