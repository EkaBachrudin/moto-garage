import { mockServiceOrders } from '@/mocks'
import type { Payment, CreatePaymentForm, DashboardStats } from '@/types'
import { PaymentStatus, ServiceStatus } from '@/types'

class PaymentService {
  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const order = mockServiceOrders.find(o => o.order_id === orderId)
    return order?.payment || null
  }

  async createPayment(data: CreatePaymentForm): Promise<Payment> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const remainingAmount = data.total_bill - data.discount_amount - data.dp_amount

    const newPayment: Payment = {
      payment_id: 'pay' + Date.now(),
      order_id: data.order_id,
      processed_by: 'u1',
      total_bill: data.total_bill,
      discount_amount: data.discount_amount,
      dp_amount: data.dp_amount,
      remaining_amount: remainingAmount,
      payment_method: data.payment_method,
      payment_status: remainingAmount <= 0 ? PaymentStatus.LUNAS : PaymentStatus.BELUM_LUNAS,
      payment_date: new Date().toISOString()
    }

    // Update order with payment
    const order = mockServiceOrders.find(o => o.order_id === data.order_id)
    if (order) {
      order.payment = newPayment
    }

    return newPayment
  }

  async updatePayment(paymentId: string, data: Partial<CreatePaymentForm>): Promise<Payment> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const order = mockServiceOrders.find(o => o.payment?.payment_id === paymentId)
    if (!order || !order.payment) {
      throw new Error('Payment not found')
    }

    if (data.total_bill !== undefined) order.payment.total_bill = data.total_bill
    if (data.discount_amount !== undefined) order.payment.discount_amount = data.discount_amount
    if (data.dp_amount !== undefined) order.payment.dp_amount = data.dp_amount
    if (data.payment_method !== undefined) order.payment.payment_method = data.payment_method

    // Recalculate remaining amount and status
    const remainingAmount = order.payment.total_bill - order.payment.discount_amount - order.payment.dp_amount
    order.payment.remaining_amount = remainingAmount
    order.payment.payment_status = remainingAmount <= 0 ? PaymentStatus.LUNAS : PaymentStatus.BELUM_LUNAS

    return order.payment
  }

  async getAllPayments(params?: { status?: PaymentStatus; date_from?: string; date_to?: string }): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    let payments = mockServiceOrders
      .map(o => o.payment)
      .filter((p): p is Payment => p !== undefined && p !== null)

    if (params?.status) {
      payments = payments.filter(p => p.payment_status === params.status)
    }

    return payments
  }
}

export const paymentService = new PaymentService()
