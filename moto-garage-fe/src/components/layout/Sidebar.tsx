import { NavLink, useLocation } from 'react-router-dom'
import { UserRole } from '@/types'
import {
  LayoutDashboard,
  Wrench,
  Users,
  Package,
  CreditCard,
  BarChart3,
  UserCog,
  LogOut,
  Menu,
  X
} from 'lucide-react'

export interface MenuItem {
  path: string
  label: string
  icon: React.ElementType
  roles?: UserRole[]
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/orders', label: 'Servis', icon: Wrench },
  { path: '/customers', label: 'Pelanggan', icon: Users },
  { path: '/inventory', label: 'Inventaris', icon: Package },
  { path: '/payments', label: 'Pembayaran', icon: CreditCard },
  { path: '/reports', label: 'Laporan', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.KASIR] },
  { path: '/mechanic', label: 'Tugas Saya', icon: UserCog, roles: [UserRole.MEKANIK] },
]

export interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  userRole?: UserRole
}

export function Sidebar({ isOpen = true, onClose, userRole }: SidebarProps) {
  const location = useLocation()

  const filteredItems = menuItems.filter(item => {
    if (!item.roles) return true
    return userRole && item.roles.includes(userRole)
  })

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Wrench size={24} strokeWidth={2} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">Moto Garage</span>
            <span className="sidebar-logo-subtitle">Management System</span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="sidebar-close"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={2} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredItems.map((item, index) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            const Icon = item.icon

            return (
              <li key={item.path} style={{ marginBottom: '4px' }}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className="sidebar-link"
                  style={({ isActive: isNavActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: isActive || isNavActive ? 'var(--color-white)' : 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: isActive || isNavActive
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)'
                      : 'transparent',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: isActive || isNavActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    animationDelay: `${index * 50}ms`
                  })}
                  end={item.path === '/dashboard'}
                >
                  <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/logout"
          onClick={onClose}
          className="sidebar-logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'rgba(239, 68, 68, 0.8)',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'
          }}
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Keluar</span>
        </NavLink>
      </div>
    </aside>
  )
}
