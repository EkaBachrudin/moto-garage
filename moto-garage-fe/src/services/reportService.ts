import { mockServiceOrders } from '@/mocks'
import { getLowStockProducts } from '@/mocks'
import type { DashboardStats, DailyReport, OrderStatusCount } from '@/types'
import { ServiceStatus } from '@/types'

class ReportService {
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 300))

    // Calculate omzet (total from completed/paid orders)
    const payments = mockServiceOrders
      .filter(o => o.payment)
      .map(o => o.payment!)

    const omzet = payments.reduce((sum, p) => sum + p.total_bill, 0)

    // Calculate laba kotor (omzet - buy price of parts)
    // This is a simplified calculation
    const labaKotor = Math.round(omzet * 0.4) // Assuming 40% margin

    // Count unit entries today
    const today = new Date().toISOString().split('T')[0]
    const unitEntry = mockServiceOrders.filter(o =>
      o.entry_date.startsWith(today)
    ).length

    // Count low stock products
    const lowStockCount = getLowStockProducts().length

    // Count pending and completed orders
    const pendingOrders = mockServiceOrders.filter(o =>
      o.status !== ServiceStatus.SELESAI
    ).length

    const completedOrders = mockServiceOrders.filter(o =>
      o.status === ServiceStatus.SELESAI
    ).length

    return {
      omzet,
      laba_kotor: labaKotor,
      unit_entry: unitEntry,
      low_stock_count: lowStockCount,
      pending_orders: pendingOrders,
      completed_orders: completedOrders
    }
  }

  async getDailyReport(date?: string): Promise<DailyReport> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const reportDate = date || new Date().toISOString().split('T')[0]

    // Filter orders for the specified date
    const dayOrders = mockServiceOrders.filter(o =>
      o.entry_date.startsWith(reportDate)
    )

    // Calculate omzet
    const payments = dayOrders
      .filter(o => o.payment)
      .map(o => o.payment!)
    const omzet = payments.reduce((sum, p) => sum + p.total_bill, 0)

    // Calculate laba kotor
    const labaKotor = Math.round(omzet * 0.4)

    // Count orders by status
    const statusCounts: OrderStatusCount[] = Object.values(ServiceStatus).map(status => ({
      status,
      count: dayOrders.filter(o => o.status === status).length
    }))

    // Get low stock products
    const lowStockProducts = getLowStockProducts()

    return {
      date: reportDate,
      omzet,
      laba_kotor: labaKotor,
      unit_entry: dayOrders.length,
      orders_by_status: statusCounts,
      low_stock_products
    }
  }

  async getMonthlyReport(year: number, month: number): Promise<{
    total_omzet: number
    total_laba: number
    total_units: number
    daily_breakdown: Array<{ date: string; omzet: number; units: number }>
  }> {
    await new Promise(resolve => setTimeout(resolve, 500))

    // Filter orders for the specified month
    const monthOrders = mockServiceOrders.filter(o => {
      const orderDate = new Date(o.entry_date)
      return orderDate.getFullYear() === year && orderDate.getMonth() === month - 1
    })

    // Calculate totals
    const payments = monthOrders
      .filter(o => o.payment)
      .map(o => o.payment!)
    const totalOmzet = payments.reduce((sum, p) => sum + p.total_bill, 0)
    const totalLaba = Math.round(totalOmzet * 0.4)
    const totalUnits = monthOrders.length

    // Group by date
    const dailyBreakdown: Record<string, { omzet: number; units: number }> = {}

    monthOrders.forEach(order => {
      const date = order.entry_date.split('T')[0]
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = { omzet: 0, units: 0 }
      }
      dailyBreakdown[date].units += 1
      if (order.payment) {
        dailyBreakdown[date].omzet += order.payment.total_bill
      }
    })

    return {
      total_omzet: totalOmzet,
      total_laba: totalLaba,
      total_units: totalUnits,
      daily_breakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({
        date,
        omzet: data.omzet,
        units: data.units
      }))
    }
  }
}

export const reportService = new ReportService()
