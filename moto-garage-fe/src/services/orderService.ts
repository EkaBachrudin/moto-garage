import { apiClient } from './api'
import type { ServiceOrder, CreateOrderForm } from '@/types'
import { ServiceStatus } from '@/types'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  error_code?: string
}

class OrderService {
  // Mapping between backend status and frontend ServiceStatus
  private statusMap: Record<string, string> = {
    'Antri': ServiceStatus.MENUNGGU_ANTRIAN,
    'Pengecekan': ServiceStatus.PENGECEKAN,
    'Dikerjakan': ServiceStatus.DIKERJAKAN,
    'Konfirmasi Part': ServiceStatus.KONFIRMASI_PART,
    'Menunggu Part': ServiceStatus.MENUNGGU_PART,
    'Selesai': ServiceStatus.SELESAI,
    'Batal': ServiceStatus.BATAL,
  }

  // Reverse mapping for API requests (frontend -> backend)
  private reverseStatusMap: Record<string, string> = {
    'Menunggu Antrian': 'Antri',
    'Pengecekan': 'Pengecekan',
    'Sedang Dikerjakan': 'Dikerjakan',
    'Konfirmasi Part': 'Konfirmasi Part',
    'Menunggu Sparepart': 'Menunggu Part',
    'Selesai': 'Selesai',
    'Batal': 'Batal',
  }

  private normalizeStatus(status: string): string {
    return this.statusMap[status] || status
  }

  private denormalizeStatus(status: string): string {
    return this.reverseStatusMap[status] || status
  }

  async getAllOrders(params?: { status?: string; customer_id?: string }): Promise<ServiceOrder[]> {
    // Map frontend status to backend status for API request
    const apiParams = params?.status
      ? { ...params, status: this.denormalizeStatus(params.status) }
      : params

    const response = await apiClient.get<ApiResponse<ServiceOrder[]>>('/orders', apiParams)

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch orders')
    }

    // Normalize status values from backend to match frontend enum
    return response.data.map(order => ({
      ...order,
      status: this.normalizeStatus(order.status)
    }))
  }

  async getOrderById(orderId: string): Promise<ServiceOrder> {
    const response = await apiClient.get<ApiResponse<ServiceOrder>>(`/orders/${orderId}`)

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch order')
    }

    // Normalize status in response
    return {
      ...response.data,
      status: this.normalizeStatus(response.data.status)
    }
  }

  async createOrder(data: CreateOrderForm): Promise<ServiceOrder> {
    const response = await apiClient.post<ApiResponse<ServiceOrder>>('/orders', data)

    if (!response.success) {
      throw new Error(response.message || 'Failed to create order')
    }

    // Normalize status in response
    return {
      ...response.data,
      status: this.normalizeStatus(response.data.status)
    }
  }

  async updateOrderStatus(orderId: string, status: string, diagnosis?: string): Promise<ServiceOrder> {
    const updateData: any = { status: this.denormalizeStatus(status) }
    if (diagnosis !== undefined) {
      updateData.diagnosis = diagnosis
    }

    const response = await apiClient.put<ApiResponse<ServiceOrder>>(`/orders/${orderId}`, updateData)

    if (!response.success) {
      throw new Error(response.message || 'Failed to update order status')
    }

    // Normalize status in response
    return {
      ...response.data,
      status: this.normalizeStatus(response.data.status)
    }
  }

  async assignMechanic(orderId: string, mechanicIds: string[]): Promise<ServiceOrder> {
    const response = await apiClient.put<ApiResponse<ServiceOrder>>(`/orders/${orderId}`, {
      mechanic_id: mechanicIds[0]
    })

    if (!response.success) {
      throw new Error(response.message || 'Failed to assign mechanic')
    }

    // Normalize status in response
    return {
      ...response.data,
      status: this.normalizeStatus(response.data.status)
    }
  }

  async updateOrder(orderId: string, data: Partial<CreateOrderForm> & { status?: string; mechanic_id?: string; diagnosis?: string }): Promise<ServiceOrder> {
    // Denormalize status if present
    const apiData = {
      ...data,
      status: data.status ? this.denormalizeStatus(data.status) : undefined
    }

    const response = await apiClient.put<ApiResponse<ServiceOrder>>(`/orders/${orderId}`, apiData)

    if (!response.success) {
      throw new Error(response.message || 'Failed to update order')
    }

    // Normalize status in response
    return {
      ...response.data,
      status: this.normalizeStatus(response.data.status)
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/orders/${orderId}`)

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete order')
    }
  }

  async getOrdersByVehicle(plateNumber: string): Promise<ServiceOrder[]> {
    // This would need to be implemented in backend or filter on frontend
    const orders = await this.getAllOrders()
    // Filter by plate number - this is a workaround until backend supports it
    return orders.filter(o => o.vehicle?.plate_number === plateNumber)
  }

  // Get orders grouped by status for Kanban board
  async getKanbanData(): Promise<Record<ServiceStatus, ServiceOrder[]>> {
    const allOrders = await this.getAllOrders()

    return {
      [ServiceStatus.MENUNGGU_ANTRIAN]: allOrders.filter(o => o.status === ServiceStatus.MENUNGGU_ANTRIAN),
      [ServiceStatus.PENGECEKAN]: allOrders.filter(o => o.status === ServiceStatus.PENGECEKAN),
      [ServiceStatus.DIKERJAKAN]: allOrders.filter(o => o.status === ServiceStatus.DIKERJAKAN),
      [ServiceStatus.KONFIRMASI_PART]: allOrders.filter(o => o.status === ServiceStatus.KONFIRMASI_PART),
      [ServiceStatus.MENUNGGU_PART]: allOrders.filter(o => o.status === ServiceStatus.MENUNGGU_PART),
      [ServiceStatus.SELESAI]: allOrders.filter(o => o.status === ServiceStatus.SELESAI),
      [ServiceStatus.BATAL]: allOrders.filter(o => o.status === ServiceStatus.BATAL)
    }
  }
}

export const orderService = new OrderService()
