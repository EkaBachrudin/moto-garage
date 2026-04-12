import type { Product, Supplier, Category } from '@/types'

export const mockSuppliers: Supplier[] = [
  {
    supplier_id: 's1',
    name: 'PT Astra Honda Motor',
    contact_info: '021-12345678',
    address: 'Jl. Industri No. 1, Jakarta'
  },
  {
    supplier_id: 's2',
    name: 'CV Yamaha Motor Parts',
    contact_info: '021-23456789',
    address: 'Jl. Perindustrian No. 5, Bekasi'
  },
  {
    supplier_id: 's3',
    name: 'Toko Sumber Jaya',
    contact_info: '021-34567890',
    address: 'Pasar Senen Blok A No. 10, Jakarta'
  },
  {
    supplier_id: 's4',
    name: 'UD Berkat Motor',
    contact_info: '021-45678901',
    address: 'Jl. Raya Bogor No. 25, Jakarta Timur'
  }
]

export const mockCategories: Category[] = [
  { category_id: 'cat1', name: 'Sparepart' as const },
  { category_id: 'cat2', name: 'Aksesoris' as const }
]

export const mockProducts: Product[] = [
  // Spareparts
  {
    product_id: 'p1',
    category_id: 'cat1',
    supplier_id: 's1',
    name: 'Oli Mesan Honda 10W-30',
    buy_price: 45000,
    sell_price: 65000,
    stock_qty: 24,
    min_stock: 10,
    unit_buy: 'Dus',
    unit_sell: 'Botol',
    conversion: 12,
    category: mockCategories[0],
    supplier: mockSuppliers[0]
  },
  {
    product_id: 'p2',
    category_id: 'cat1',
    supplier_id: 's1',
    name: 'Kampas Rem Depan Beat',
    buy_price: 35000,
    sell_price: 55000,
    stock_qty: 8,
    min_stock: 5,
    unit_buy: 'Pcs',
    unit_sell: 'Pcs',
    conversion: 1,
    category: mockCategories[0],
    supplier: mockSuppliers[0]
  },
  {
    product_id: 'p3',
    category_id: 'cat1',
    supplier_id: 's2',
    name: 'Busi Iridium NGK',
    buy_price: 25000,
    sell_price: 45000,
    stock_qty: 15,
    min_stock: 8,
    unit_buy: 'Pcs',
    unit_sell: 'Pcs',
    conversion: 1,
    category: mockCategories[0],
    supplier: mockSuppliers[1]
  },
  {
    product_id: 'p4',
    category_id: 'cat1',
    supplier_id: 's1',
    name: 'Rantai Keteng Beat',
    buy_price: 75000,
    sell_price: 120000,
    stock_qty: 3,
    min_stock: 5,
    unit_buy: 'Pcs',
    unit_sell: 'Pcs',
    conversion: 1,
    category: mockCategories[0],
    supplier: mockSuppliers[0]
  },
  {
    product_id: 'p5',
    category_id: 'cat1',
    supplier_id: 's3',
    name: 'Aki Motor Yuasa',
    buy_price: 150000,
    sell_price: 250000,
    stock_qty: 6,
    min_stock: 3,
    unit_buy: 'Pcs',
    unit_sell: 'Pcs',
    conversion: 1,
    category: mockCategories[0],
    supplier: mockSuppliers[2]
  },
  // Aksesoris
  {
    product_id: 'p6',
    category_id: 'cat2',
    supplier_id: 's3',
    name: 'Helm Bogo Klasik',
    buy_price: 85000,
    sell_price: 150000,
    stock_qty: 10,
    min_stock: 5,
    unit_buy: 'Pcs',
    unit_sell: 'Pcs',
    conversion: 1,
    category: mockCategories[1],
    supplier: mockSuppliers[2]
  },
  {
    product_id: 'p7',
    category_id: 'cat2',
    supplier_id: 's4',
    name: 'Jas Hujan Axio',
    buy_price: 65000,
    sell_price: 120000,
    stock_qty: 18,
    min_stock: 10,
    unit_buy: 'Pcs',
    unit_sell: 'Pcs',
    conversion: 1,
    category: mockCategories[1],
    supplier: mockSuppliers[3]
  },
  {
    product_id: 'p8',
    category_id: 'cat2',
    supplier_id: 's3',
    name: 'Sarung Tangan Motor',
    buy_price: 25000,
    sell_price: 50000,
    stock_qty: 20,
    min_stock: 10,
    unit_buy: 'Lusin',
    unit_sell: 'Pcs',
    conversion: 12,
    category: mockCategories[1],
    supplier: mockSuppliers[2]
  },
  {
    product_id: 'p9',
    category_id: 'cat1',
    supplier_id: 's2',
    name: 'Bohlam Lampu Depan LED',
    buy_price: 35000,
    sell_price: 60000,
    stock_qty: 2,
    min_stock: 5,
    unit_buy: 'Pcs',
    unit_sell: 'Pcs',
    conversion: 1,
    category: mockCategories[0],
    supplier: mockSuppliers[1]
  },
  {
    product_id: 'p10',
    category_id: 'cat1',
    supplier_id: 's1',
    name: 'Filter Oli Honda',
    buy_price: 15000,
    sell_price: 30000,
    stock_qty: 30,
    min_stock: 15,
    unit_buy: 'Pcs',
    unit_sell: 'Pcs',
    conversion: 1,
    category: mockCategories[0],
    supplier: mockSuppliers[0]
  }
]

// Helper functions
export const getLowStockProducts = (): Product[] => {
  return mockProducts.filter(p => p.stock_qty <= p.min_stock)
}

export const getProductsByCategory = (categoryName: string): Product[] => {
  return mockProducts.filter(p => p.category?.name === categoryName)
}
