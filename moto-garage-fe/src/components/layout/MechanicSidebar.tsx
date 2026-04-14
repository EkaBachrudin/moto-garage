import { NavLink, useLocation } from 'react-router-dom'
import {
  ClipboardCheck,
  Clock,
  History,
  Calendar,
  BarChart3,
  User,
  LogOut,
  X
} from 'lucide-react'

export interface MechanicMenuItem {
  path: string
  label: string
  icon: React.ElementType
  badge?: number
}

const mechanicMenuItems: MechanicMenuItem[] = [
  { path: '/mechanic', label: 'Tugas Saya', icon: ClipboardCheck },
  { path: '/mechanic/history', label: 'Riwayat', icon: History },
  { path: '/mechanic/performance', label: 'Performa', icon: BarChart3 },
  { path: '/mechanic/schedule', label: 'Jadwal', icon: Calendar },
  { path: '/mechanic/profile', label: 'Profil Saya', icon: User },
]

export interface MechanicSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeTasksCount?: number
}

export function MechanicSidebar({ isOpen = true, onClose, activeTasksCount = 0 }: MechanicSidebarProps) {
  const location = useLocation()

  // Update badge for active tasks
  const menuItemsWithBadges = mechanicMenuItems.map(item => {
    if (item.path === '/mechanic' && activeTasksCount > 0) {
      return { ...item, badge: activeTasksCount }
    }
    return item
  })

  return (
    <aside className={`mechanic-sidebar ${isOpen ? 'open' : ''}`} style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: isOpen ? '280px' : '0',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 50,
      overflow: 'hidden',
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            M
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '2px'
            }}>
              Portal Mekanik
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 500
            }}>
              Kelola tugas Anda
            </div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#22c55e',
              marginBottom: '4px'
            }}>
              {activeTasksCount}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500
            }}>
              Tugas Aktif
            </div>
          </div>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#3b82f6',
              marginBottom: '4px'
            }}>
              {new Date().toLocaleDateString('id-ID', { day: 'numeric' })}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500
            }}>
              Tanggal Hari Ini
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItemsWithBadges.map((item, index) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/mechanic' && location.pathname.startsWith(item.path))
            const Icon = item.icon

            return (
              <li key={item.path} style={{ marginBottom: '4px' }}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.2) 100%)'
                      : 'transparent',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                    position: 'relative'
                  }}
                  end={item.path === '/mechanic'}
                >
                  <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <NavLink
          to="/logout"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            textDecoration: 'none',
            color: 'rgba(239, 68, 68, 0.9)',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Keluar</span>
        </NavLink>
      </div>
    </aside>
  )
}
