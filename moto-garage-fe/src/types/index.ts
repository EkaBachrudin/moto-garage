// ==================== ENUMS ====================

export enum ServiceStatus {
  MENUNGGU_ANTRIAN = 'Menunggu Antrian',
  PENGECEKAN = 'Pengecekan',
  DIKERJAKAN = 'Sedang Dikerjakan',
  KONFIRMASI_PART = 'Konfirmasi Part',
  MENUNGGU_PART = 'Menunggu Sparepart',
  SELESAI = 'Selesai',
  BATAL = 'Batal'
}

export enum EntryType {
  BOOKING = 'Booking',
  WALK_IN = 'Walk-In'
}

export enum PaymentMethod {
  TUNAI = 'Tunai',
  DEBIT = 'Debit',
  QRIS = 'QRIS'
}

export enum PaymentStatus {
  LUNAS = 'Lunas',
  BELUM_LUNAS = 'Belum Lunas'
}

export enum OrderDetailType {
  JASA = 'Jasa',
  SPAREPART = 'Sparepart'
}

export enum UserRole {
  ADMIN = 'admin',
  KASIR = 'kasir',
  MEKANIK = 'mekanik'
}

export enum ProductCategory {
  SPAREPART = 'Sparepart',
  AKSESORIS = 'Aksesoris'
}

// ==================== AUTH & USER ====================

export interface Role {
  role_id: string
  name: UserRole
  description: string
  permissions: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface User {
  user_id: string
  role_id: string
  full_name: string
  email: string
  phone: string
  commission_rate?: number
  is_active: boolean
  created_at: string
  updated_at: string
  role?: Role
}

export interface UserSession {
  session_id: string
  user_id: string
  refresh_token_hash: string
  device_info: {
    device_type: 'desktop' | 'mobile' | 'tablet'
    os: string
    browser: string
  }
  ip_address: string
  user_agent: string
  is_active: boolean
  expires_at: string
  last_activity_at: string
  created_at: string
}

// ==================== CUSTOMER & VEHICLE ====================

export interface Customer {
  customer_id: string
  full_name: string
  phone: string
  address: string
  is_member: boolean
  created_at: string
}

export interface Vehicle {
  vehicle_id: string
  customer_id: string
  plate_number: string
  brand_type: string
  customer?: Customer
  can_order?: boolean
  order_blocked_reason?: string | null
  current_order_status?: string
  active_order_id?: string | null
}

// ==================== SUPPLIER & PRODUCT ====================

export interface Supplier {
  supplier_id: string
  name: string
  contact_info: string
  address: string
}

export interface Category {
  category_id: string
  name: ProductCategory
}

export interface Product {
  product_id: string
  category_id: string
  supplier_id: string
  name: string
  buy_price: number
  sell_price: number
  stock_qty: number
  min_stock: number
  unit_buy: string
  unit_sell: string
  conversion: number
  supplier?: Supplier
  category?: Category
}

// ==================== SERVICE ORDER ====================

export interface ServiceOrder {
  order_id: string
  order_code: string
  customer_id: string
  vehicle_id: string
  mechanic_id: string
  created_by: string
  status: ServiceStatus
  entry_type: EntryType
  complaint: string
  diagnosis: string
  entry_date: string
  completion_date?: string
  customer?: Customer
  vehicle?: Vehicle
  mechanic?: User
  order_details?: OrderDetail[]
  payment?: Payment
}

export interface OrderDetail {
  detail_id: string
  order_id: string
  type: OrderDetailType
  product_id?: string
  description: string
  quantity: number
  unit_price: number
  subtotal: number
  product?: Product
}

// ==================== PAYMENT ====================

export interface Payment {
  payment_id: string
  order_id: string
  processed_by: string
  total_bill: number
  discount_amount: number
  dp_amount: number
  remaining_amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_date: string
}

// ==================== DASHBOARD & REPORTS ====================

export interface DashboardStats {
  omzet: number
  laba_kotor: number
  unit_entry: number
  low_stock_count: number
  pending_orders: number
  completed_orders: number
}

export interface OrderStatusCount {
  status: ServiceStatus
  count: number
}

export interface DailyReport {
  date: string
  omzet: number
  laba_kotor: number
  unit_entry: number
  orders_by_status: OrderStatusCount[]
  low_stock_products: Product[]
}

// ==================== FORM TYPES ====================

export interface CreateCustomerForm {
  full_name: string
  phone: string
  address: string
  is_member: boolean
}

export interface CreateVehicleForm {
  customer_id: string
  plate_number: string
  brand_type: string
}

export interface CreateOrderForm {
  customer_id?: string
  vehicle_id?: string
  plate_number?: string // For auto-fetch
  entry_type: EntryType
  complaint: string
  mechanic_ids: string[]
}

export interface CreateProductForm {
  category_id: string
  supplier_id: string
  name: string
  buy_price: number
  sell_price: number
  stock_qty: number
  min_stock: number
  unit_buy: string
  unit_sell: string
  conversion: number
}

export interface CreatePaymentForm {
  order_id: string
  total_bill: number
  discount_amount: number
  dp_amount: number
  payment_method: PaymentMethod
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  csrf_token: string
}
