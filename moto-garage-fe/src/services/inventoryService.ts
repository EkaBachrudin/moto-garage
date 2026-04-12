import { mockProducts, mockSuppliers, mockCategories, getLowStockProducts, getProductsByCategory } from '@/mocks'
import type { Product, Supplier, Category, CreateProductForm } from '@/types'

class InventoryService {
  // Products
  async getAllProducts(category?: string, search?: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    let products = [...mockProducts]

    if (category) {
      products = products.filter(p => p.category?.name.toLowerCase() === category.toLowerCase())
    }

    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.supplier?.name.toLowerCase().includes(searchLower)
      )
    }

    return products
  }

  async getProductById(productId: string): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const product = mockProducts.find(p => p.product_id === productId)
    if (!product) {
      throw new Error('Product not found')
    }
    return product
  }

  async createProduct(data: CreateProductForm): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const newProduct: Product = {
      product_id: 'p' + (mockProducts.length + 1),
      category_id: data.category_id,
      supplier_id: data.supplier_id,
      name: data.name,
      buy_price: data.buy_price,
      sell_price: data.sell_price,
      stock_qty: data.stock_qty,
      min_stock: data.min_stock,
      unit_buy: data.unit_buy,
      unit_sell: data.unit_sell,
      conversion: data.conversion
    }

    mockProducts.push(newProduct)
    return newProduct
  }

  async updateProduct(productId: string, data: Partial<CreateProductForm>): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const product = mockProducts.find(p => p.product_id === productId)
    if (!product) {
      throw new Error('Product not found')
    }

    Object.assign(product, data)
    return product
  }

  async deleteProduct(productId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockProducts.findIndex(p => p.product_id === productId)
    if (index === -1) {
      throw new Error('Product not found')
    }

    mockProducts.splice(index, 1)
  }

  async getLowStockProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return getLowStockProducts()
  }

  // Suppliers
  async getAllSuppliers(): Promise<Supplier[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockSuppliers]
  }

  async getSupplierById(supplierId: string): Promise<Supplier> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const supplier = mockSuppliers.find(s => s.supplier_id === supplierId)
    if (!supplier) {
      throw new Error('Supplier not found')
    }
    return supplier
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockCategories]
  }
}

export const inventoryService = new InventoryService()
