import { mockServiceOrders, getOrdersByStatus, getOrdersByMechanic, getOrderByVehicle, getOrderById } from '@/mocks'
import type { ServiceOrder, CreateOrderForm } from '@/types'
import { ServiceStatus } from '@/types'

class OrderService {
  async getAllOrders(params?: { status?: ServiceStatus; mechanic_id?: string }): Promise<ServiceOrder[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    let orders = [...mockServiceOrders]

    if (params?.status) {
      orders = orders.filter(o => o.status === params.status)
    }

    if (params?.mechanic_id) {
      orders = orders.filter(o => o.mechanic_id === params.mechanic_id)
    }

    return orders
  }

  async getOrderById(orderId: string): Promise<ServiceOrder> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const order = getOrderById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }
    return order
  }

  async createOrder(data: CreateOrderForm): Promise<ServiceOrder> {
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock creating a new order
    const newOrder: ServiceOrder = {
      order_id: 'o' + (mockServiceOrders.length + 1),
      customer_id: data.customer_id || '',
      vehicle_id: data.vehicle_id || '',
      mechanic_id: data.mechanic_ids[0] || null,
      created_by: 'u1',
      status: ServiceStatus.MENUNGGU_ANTRIAN,
      entry_type: data.entry_type,
      complaint: data.complaint,
      diagnosis: '',
      entry_date: new Date().toISOString(),
      customer: undefined,
      vehicle: undefined,
      mechanic: undefined,
      order_details: [],
      payment: null
    }

    mockServiceOrders.unshift(newOrder)
    return newOrder
  }

  async updateOrderStatus(orderId: string, status: ServiceStatus, diagnosis?: string): Promise<ServiceOrder> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const order = getOrderById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    order.status = status
    if (diagnosis !== undefined) {
      order.diagnosis = diagnosis
    }

    if (status === ServiceStatus.SELESAI) {
      order.completion_date = new Date().toISOString()
    }

    return order
  }

  async assignMechanic(orderId: string, mechanicIds: string[]): Promise<ServiceOrder> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const order = getOrderById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    order.mechanic_id = mechanicIds[0]
    return order
  }

  async deleteOrder(orderId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockServiceOrders.findIndex(o => o.order_id === orderId)
    if (index === -1) {
      throw new Error('Order not found')
    }

    mockServiceOrders.splice(index, 1)
  }

  async getOrdersByVehicle(plateNumber: string): Promise<ServiceOrder[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getOrderByVehicle(plateNumber)
  }

  // Get orders grouped by status for Kanban board
  async getKanbanData(): Promise<Record<ServiceStatus, ServiceOrder[]>> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      [ServiceStatus.MENUNGGU_ANTRIAN]: getOrdersByStatus(ServiceStatus.MENUNGGU_ANTRIAN),
      [ServiceStatus.PENGECEKAN]: getOrdersByStatus(ServiceStatus.PENGECEKAN),
      [ServiceStatus.DIKERJAKAN]: getOrdersByStatus(ServiceStatus.DIKERJAKAN),
      [ServiceStatus.KONFIRMASI_PART]: getOrdersByStatus(ServiceStatus.KONFIRMASI_PART),
      [ServiceStatus.MENUNGGU_PART]: getOrdersByStatus(ServiceStatus.MENUNGGU_PART),
      [ServiceStatus.SELESAI]: getOrdersByStatus(ServiceStatus.SELESAI)
    }
  }
}

export const orderService = new OrderService()
