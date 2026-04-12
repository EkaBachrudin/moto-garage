import { NavLink, useLocation } from 'react-router-dom'
import { UserRole } from '@/types'

export interface MenuItem {
  path: string
  label: string
  icon?: string
  roles?: UserRole[]
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/orders', label: 'Servis', icon: '🔧' },
  { path: '/customers', label: 'Pelanggan', icon: '👥' },
  { path: '/inventory', label: 'Inventaris', icon: '📦' },
  { path: '/payments', label: 'Pembayaran', icon: '💳' },
  { path: '/reports', label: 'Laporan', icon: '📈', roles: [UserRole.ADMIN, UserRole.KASIR] },
  { path: '/mechanic', label: 'Tugas Saya', icon: '👨‍🔧', roles: [UserRole.MEKANIK] },
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
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'var(--color-white)' }}>
          🏍️ Moto Garage
        </h2>
      </div>

      <nav className="sidebar-nav">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))

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
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive || isNavActive ? 'var(--color-white)' : 'var(--color-gray-400)',
                    backgroundColor: isActive || isNavActive ? 'var(--color-gray-800)' : 'transparent',
                    transition: 'all 0.15s ease',
                    fontSize: '14px',
                    fontWeight: '500'
                  })}
                  end={item.path === '/dashboard'}
                >
                  {item.icon && <span style={{ fontSize: '18px' }}>{item.icon}</span>}
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'var(--color-error)',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <span>🚪</span>
          <span>Keluar</span>
        </NavLink>
      </div>
    </aside>
  )
}
