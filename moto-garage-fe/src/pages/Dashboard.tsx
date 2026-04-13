import { useEffect, useState } from 'react'
import { reportService, orderService } from '@/services'
import type { DashboardStats, ServiceOrder } from '@/types'
import { ServiceStatus } from '@/types'
import {
  DollarSign,
  TrendingUp,
  Car,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Wrench
} from 'lucide-react'
import '@/styles/dashboard.css'

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<Record<ServiceStatus, ServiceOrder[]> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [statsData, ordersData] = await Promise.all([
        reportService.getDashboardStats(),
        orderService.getKanbanData()
      ])
      setStats(statsData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats || !orders) {
    return (
      <div className="dashboard">
        <div className="flex items-center justify-center" style={{ padding: '48px' }}>
          <span className="spinner spinner-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="stat-icon stat-icon-primary">
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Omzet Hari Ini</div>
            <div className="stat-value">Rp {stats.omzet.toLocaleString('id-ID')}</div>
            <div className="stat-change stat-change-positive">
              <CheckCircle2 size={12} strokeWidth={2.5} />
              <span>{stats.completed_orders} unit selesai</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-success animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="stat-icon stat-icon-success">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Laba Kotor</div>
            <div className="stat-value">Rp {stats.laba_kotor.toLocaleString('id-ID')}</div>
            <div className="stat-change stat-change-positive">
              <TrendingUp size={12} strokeWidth={2.5} />
              <span>~40% margin</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-info animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="stat-icon stat-icon-info">
            <Car size={24} strokeWidth={2.5} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Unit Entry</div>
            <div className="stat-value">{stats.unit_entry}</div>
            <div className="stat-change stat-change-neutral">
              <Clock size={12} strokeWidth={2.5} />
              <span>{stats.pending_orders} sedang diproses</span>
            </div>
          </div>
        </div>

        <div className={`stat-card ${stats.low_stock_count > 0 ? 'stat-card-warning' : 'stat-card-success'} animate-slide-up`}
             style={{ animationDelay: '150ms' }}>
          <div className={`stat-icon ${stats.low_stock_count > 0 ? 'stat-icon-warning' : 'stat-icon-success'}`}>
            {stats.low_stock_count > 0 ? (
              <AlertTriangle size={24} strokeWidth={2.5} />
            ) : (
              <CheckCircle2 size={24} strokeWidth={2.5} />
            )}
          </div>
          <div className="stat-content">
            <div className="stat-label">Stok Menipis</div>
            <div className="stat-value">{stats.low_stock_count}</div>
            {stats.low_stock_count > 0 && (
              <div className="stat-change stat-change-negative">
                <AlertTriangle size={12} strokeWidth={2.5} />
                <span>Perlu restock</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        <KanbanColumn
          title="Menunggu Antrian"
          status={ServiceStatus.MENUNGGU_ANTRIAN}
          orders={orders[ServiceStatus.MENUNGGU_ANTRIAN]}
          color="gray"
        />
        <KanbanColumn
          title="Pengecekan"
          status={ServiceStatus.PENGECEKAN}
          orders={orders[ServiceStatus.PENGECEKAN]}
          color="blue"
        />
        <KanbanColumn
          title="Sedang Dikerjakan"
          status={ServiceStatus.DIKERJAKAN}
          orders={orders[ServiceStatus.DIKERJAKAN]}
          color="yellow"
        />
        <KanbanColumn
          title="Konfirmasi Part"
          status={ServiceStatus.KONFIRMASI_PART}
          orders={orders[ServiceStatus.KONFIRMASI_PART]}
          color="orange"
        />
        <KanbanColumn
          title="Menunggu Part"
          status={ServiceStatus.MENUNGGU_PART}
          orders={orders[ServiceStatus.MENUNGGU_PART]}
          color="red"
        />
        <KanbanColumn
          title="Selesai"
          status={ServiceStatus.SELESAI}
          orders={orders[ServiceStatus.SELESAI]}
          color="green"
        />
      </div>
    </div>
  )
}

interface KanbanColumnProps {
  title: string
  status: ServiceStatus
  orders: ServiceOrder[]
  color: string
}

function KanbanColumn({ title, status, orders, color }: KanbanColumnProps) {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <span className="status-dot" style={{ backgroundColor: `var(--status-${status.toLowerCase().replace(' ', '-')}-text)` }} />
          {title}
        </div>
        <span className="kanban-column-count">{orders.length}</span>
      </div>
      <div className="kanban-column-body">
        {orders.length === 0 ? (
          <div className="kanban-empty">
            <span className="kanban-empty-icon">📭</span>
            <span className="kanban-empty-text">Tidak ada order</span>
          </div>
        ) : (
          orders.map(order => (
            <KanbanCard key={order.order_id} order={order} />
          ))
        )}
      </div>
    </div>
  )
}

function KanbanCard({ order }: { order: ServiceOrder }) {
  return (
    <div className="kanban-card">
      <div className="kanban-card-header">
        <div className="kanban-card-title">
          {order.vehicle?.brand_type || 'Unknown Vehicle'}
        </div>
        <span className="kanban-card-plate">{order.vehicle?.plate_number || ''}</span>
      </div>
      <div className="kanban-card-body">
        <div className="kanban-card-customer">
          <User size={12} strokeWidth={2} />
          <span>{order.customer?.full_name || 'Unknown Customer'}</span>
        </div>
        {order.complaint && (
          <div className="kanban-card-complaint">
            "{order.complaint}"
          </div>
        )}
      </div>
      <div className="kanban-card-footer">
        <div className="kanban-card-mechanic">
          {order.mechanic ? (
            <>
              <Wrench size={12} strokeWidth={2} />
              <span>{order.mechanic.full_name}</span>
            </>
          ) : (
            <>
              <Clock size={12} strokeWidth={2} />
              <span>Belum ada mekanik</span>
            </>
          )}
        </div>
        <div className="kanban-card-time">
          {new Date(order.entry_date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}
