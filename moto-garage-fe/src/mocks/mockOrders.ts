import type { ServiceOrder, OrderDetail, Payment } from '@/types'
import { ServiceStatus, EntryType, PaymentMethod, PaymentStatus, OrderDetailType } from '@/types'
import { mockCustomers } from './mockCustomers'
import { mockVehicles } from './mockVehicles'

// Mock order details
const mockOrderDetails: OrderDetail[] = [
  {
    detail_id: 'od1',
    order_id: 'o1',
    type: OrderDetailType.JASA,
    description: 'Ganti Oli + Service Ringan',
    quantity: 1,
    unit_price: 50000,
    subtotal: 50000
  },
  {
    detail_id: 'od2',
    order_id: 'o1',
    type: OrderDetailType.SPAREPART,
    product_id: 'p1',
    description: 'Oli Mesan Honda 10W-30',
    quantity: 1,
    unit_price: 65000,
    subtotal: 65000
  },
  {
    detail_id: 'od3',
    order_id: 'o2',
    type: OrderDetailType.JASA,
    description: 'Ganti Kampas Rem',
    quantity: 1,
    unit_price: 75000,
    subtotal: 75000
  },
  {
    detail_id: 'od4',
    order_id: 'o2',
    type: OrderDetailType.SPAREPART,
    product_id: 'p2',
    description: 'Kampas Rem Depan Beat',
    quantity: 1,
    unit_price: 55000,
    subtotal: 55000
  },
  {
    detail_id: 'od5',
    order_id: 'o3',
    type: OrderDetailType.JASA,
    description: 'Turun Mesin Lengkap',
    quantity: 1,
    unit_price: 500000,
    subtotal: 500000
  },
  {
    detail_id: 'od6',
    order_id: 'o4',
    type: OrderDetailType.JASA,
    description: 'Service Berkala',
    quantity: 1,
    unit_price: 100000,
    subtotal: 100000
  },
  {
    detail_id: 'od7',
    order_id: 'o5',
    type: OrderDetailType.JASA,
    description: 'Ganti Rantai Keteng',
    quantity: 1,
    unit_price: 150000,
    subtotal: 150000
  },
  {
    detail_id: 'od8',
    order_id: 'o5',
    type: OrderDetailType.SPAREPART,
    product_id: 'p4',
    description: 'Rantai Keteng Beat',
    quantity: 1,
    unit_price: 120000,
    subtotal: 120000
  },
  {
    detail_id: 'od9',
    order_id: 'o6',
    type: OrderDetailType.JASA,
    description: 'Ganti Aki',
    quantity: 1,
    unit_price: 50000,
    subtotal: 50000
  },
  {
    detail_id: 'od10',
    order_id: 'o6',
    type: OrderDetailType.SPAREPART,
    product_id: 'p5',
    description: 'Aki Motor Yuasa',
    quantity: 1,
    unit_price: 250000,
    subtotal: 250000
  },
  {
    detail_id: 'od11',
    order_id: 'o7',
    type: OrderDetailType.JASA,
    description: 'Tambal Ban Tubeless',
    quantity: 1,
    unit_price: 25000,
    subtotal: 25000
  }
]

// Mock payments
const mockPayments: Payment[] = [
  {
    payment_id: 'pay1',
    order_id: 'o1',
    processed_by: 'u1',
    total_bill: 115000,
    discount_amount: 0,
    dp_amount: 0,
    remaining_amount: 0,
    payment_method: PaymentMethod.TUNAI,
    payment_status: PaymentStatus.LUNAS,
    payment_date: '2024-04-10T14:30:00Z'
  },
  {
    payment_id: 'pay2',
    order_id: 'o2',
    processed_by: 'u1',
    total_bill: 130000,
    discount_amount: 0,
    dp_amount: 50000,
    remaining_amount: 80000,
    payment_method: PaymentMethod.QRIS,
    payment_status: PaymentStatus.BELUM_LUNAS,
    payment_date: '2024-04-11T10:00:00Z'
  },
  {
    payment_id: 'pay3',
    order_id: 'o3',
    processed_by: 'u1',
    total_bill: 500000,
    discount_amount: 50000,
    dp_amount: 250000,
    remaining_amount: 200000,
    payment_method: PaymentMethod.DEBIT,
    payment_status: PaymentStatus.BELUM_LUNAS,
    payment_date: '2024-04-11T11:30:00Z'
  },
  {
    payment_id: 'pay4',
    order_id: 'o4',
    processed_by: 'u1',
    total_bill: 100000,
    discount_amount: 0,
    dp_amount: 0,
    remaining_amount: 0,
    payment_method: PaymentMethod.QRIS,
    payment_status: PaymentStatus.LUNAS,
    payment_date: '2024-04-12T09:00:00Z'
  },
  {
    payment_id: 'pay5',
    order_id: 'o5',
    processed_by: 'u1',
    total_bill: 270000,
    discount_amount: 0,
    dp_amount: 0,
    remaining_amount: 0,
    payment_method: PaymentMethod.TUNAI,
    payment_status: PaymentStatus.LUNAS,
    payment_date: '2024-04-12T11:00:00Z'
  }
]

// Mock service orders with different statuses
export const mockServiceOrders: ServiceOrder[] = [
  {
    order_id: 'o1',
    customer_id: 'c1',
    vehicle_id: 'v1',
    mechanic_id: 'm1',
    created_by: 'u1',
    status: ServiceStatus.SELESAI,
    entry_type: EntryType.WALK_IN,
    complaint: 'Motor terasa berat saat digunakan',
    diagnosis: 'Perlu ganti oli dan service ringan',
    entry_date: '2024-04-10T08:00:00Z',
    completion_date: '2024-04-10T14:30:00Z',
    customer: mockCustomers[0],
    vehicle: mockVehicles[0],
    mechanic: {
      user_id: 'm1',
      role_id: 'r3',
      full_name: 'Andi Mekanik',
      email: 'andi@example.com',
      phone: '628111111111',
      commission_rate: 10,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    order_details: [mockOrderDetails[0], mockOrderDetails[1]],
    payment: mockPayments[0]
  },
  {
    order_id: 'o2',
    customer_id: 'c2',
    vehicle_id: 'v3',
    mechanic_id: 'm1',
    created_by: 'u1',
    status: ServiceStatus.DIKERJAKAN,
    entry_type: EntryType.BOOKING,
    complaint: 'Rem kurang pakem',
    diagnosis: 'Kampas rem sudah tipis, perlu diganti',
    entry_date: '2024-04-11T09:00:00Z',
    customer: mockCustomers[1],
    vehicle: mockVehicles[2],
    mechanic: {
      user_id: 'm1',
      role_id: 'r3',
      full_name: 'Andi Mekanik',
      email: 'andi@example.com',
      phone: '628111111111',
      commission_rate: 10,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    order_details: [mockOrderDetails[2], mockOrderDetails[3]],
    payment: mockPayments[1]
  },
  {
    order_id: 'o3',
    customer_id: 'c3',
    vehicle_id: 'v4',
    mechanic_id: 'm2',
    created_by: 'u1',
    status: ServiceStatus.MENUNGGU_PART,
    entry_type: EntryType.WALK_IN,
    complaint: 'Motor berasap dan tenaga berkurang',
    diagnosis: 'Piston sudah aus, perlu turun mesin. Piston set saat ini kosong.',
    entry_date: '2024-04-11T11:00:00Z',
    customer: mockCustomers[2],
    vehicle: mockVehicles[3],
    mechanic: {
      user_id: 'm2',
      role_id: 'r3',
      full_name: 'Budi Mekanik',
      email: 'budi@example.com',
      phone: '628222222222',
      commission_rate: 10,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    order_details: [mockOrderDetails[4]],
    payment: mockPayments[2]
  },
  {
    order_id: 'o4',
    customer_id: 'c4',
    vehicle_id: 'v6',
    mechanic_id: 'm1',
    created_by: 'u1',
    status: ServiceStatus.PENGECEKAN,
    entry_type: EntryType.BOOKING,
    complaint: 'Service berkala 5000km',
    diagnosis: '',
    entry_date: '2024-04-12T08:00:00Z',
    customer: mockCustomers[3],
    vehicle: mockVehicles[5],
    mechanic: {
      user_id: 'm1',
      role_id: 'r3',
      full_name: 'Andi Mekanik',
      email: 'andi@example.com',
      phone: '628111111111',
      commission_rate: 10,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    order_details: [mockOrderDetails[5]],
    payment: mockPayments[3]
  },
  {
    order_id: 'o5',
    customer_id: 'c5',
    vehicle_id: 'v7',
    mechanic_id: 'm2',
    created_by: 'u1',
    status: ServiceStatus.SELESAI,
    entry_type: EntryType.WALK_IN,
    complaint: 'Rantai keteng berasa kasar',
    diagnosis: 'Rantai keteng sudah aus dan perlu diganti',
    entry_date: '2024-04-12T09:30:00Z',
    completion_date: '2024-04-12T11:00:00Z',
    customer: mockCustomers[4],
    vehicle: mockVehicles[6],
    mechanic: {
      user_id: 'm2',
      role_id: 'r3',
      full_name: 'Budi Mekanik',
      email: 'budi@example.com',
      phone: '628222222222',
      commission_rate: 10,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    order_details: [mockOrderDetails[6], mockOrderDetails[7]],
    payment: mockPayments[4]
  },
  {
    order_id: 'o6',
    customer_id: 'c6',
    vehicle_id: 'v8',
    mechanic_id: 'm1',
    created_by: 'u1',
    status: ServiceStatus.KONFIRMASI_PART,
    entry_type: EntryType.BOOKING,
    complaint: 'Aki soak, motor sulit starter',
    diagnosis: 'Aki sudah mati, perlu ganti aki baru',
    entry_date: '2024-04-12T10:30:00Z',
    customer: mockCustomers[5],
    vehicle: mockVehicles[7],
    mechanic: {
      user_id: 'm1',
      role_id: 'r3',
      full_name: 'Andi Mekanik',
      email: 'andi@example.com',
      phone: '628111111111',
      commission_rate: 10,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    order_details: [mockOrderDetails[8], mockOrderDetails[9]],
    payment: mockPayments[2]
  },
  {
    order_id: 'o7',
    customer_id: 'c7',
    vehicle_id: 'v9',
    mechanic_id: null,
    created_by: 'u1',
    status: ServiceStatus.MENUNGGU_ANTRIAN,
    entry_type: EntryType.WALK_IN,
    complaint: 'Ban bocor',
    diagnosis: '',
    entry_date: '2024-04-12T12:00:00Z',
    customer: mockCustomers[6],
    vehicle: mockVehicles[8],
    mechanic: null,
    order_details: [mockOrderDetails[10]],
    payment: null
  },
  {
    order_id: 'o8',
    customer_id: 'c8',
    vehicle_id: 'v10',
    mechanic_id: null,
    created_by: 'u1',
    status: ServiceStatus.MENUNGGU_ANTRIAN,
    entry_type: EntryType.BOOKING,
    complaint: 'Request service kaki-kaki',
    diagnosis: '',
    entry_date: '2024-04-12T13:00:00Z',
    customer: mockCustomers[7],
    vehicle: mockVehicles[9],
    mechanic: null,
    order_details: [],
    payment: null
  }
]

// Helper functions
export const getOrdersByStatus = (status: ServiceStatus): ServiceOrder[] => {
  return mockServiceOrders.filter(o => o.status === status)
}

export const getOrdersByMechanic = (mechanicId: string): ServiceOrder[] => {
  return mockServiceOrders.filter(o => o.mechanic_id === mechanicId)
}

export const getOrderByVehicle = (plateNumber: string): ServiceOrder[] => {
  return mockServiceOrders.filter(o =>
    o.vehicle?.plate_number.toLowerCase() === plateNumber.toLowerCase()
  )
}

export const getOrderById = (orderId: string): ServiceOrder | undefined => {
  return mockServiceOrders.find(o => o.order_id === orderId)
}
