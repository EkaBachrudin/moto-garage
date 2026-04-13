import { useState } from 'react'
import { Menu, Settings, LogOut, ChevronDown, Bell, Search } from 'lucide-react'

export interface HeaderProps {
  onMenuClick?: () => void
  userName?: string
  userRole?: string
}

export function Header({ onMenuClick, userName = 'User', userRole = 'Admin' }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const initials = userName.charAt(0).toUpperCase()

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onMenuClick}
          className="menu-button"
          aria-label="Toggle menu"
        >
          <Menu size={24} strokeWidth={2} />
        </button>
        <div className="header-title-group">
          <h1 className="header-title">Sistem Manajemen Bengkel</h1>
          <span className="header-subtitle">Moto Garage Management System</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search Bar */}
        <div className="header-search">
          <Search size={18} className="header-search-icon" />
          <input
            type="text"
            placeholder="Cari..."
            className="header-search-input"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="header-icon-button"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={2} />
          <span className="notification-badge" />
        </button>

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="user-menu-button"
          >
            <div className="user-avatar">
              {initials}
            </div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-role">{userRole}</div>
            </div>
            <ChevronDown size={16} className="dropdown-chevron" />
          </button>

          {showDropdown && (
            <>
              <div
                className="dropdown-backdrop"
                onClick={() => setShowDropdown(false)}
              />
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-name">{userName}</div>
                  <div className="dropdown-user-role">{userRole}</div>
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-content">
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      window.location.href = '/settings'
                      setShowDropdown(false)
                    }}
                  >
                    <Settings size={16} strokeWidth={2} />
                    <span>Pengaturan</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item dropdown-item-danger"
                    onClick={() => {
                      window.location.href = '/logout'
                      setShowDropdown(false)
                    }}
                  >
                    <LogOut size={16} strokeWidth={2} />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
