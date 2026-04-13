import { useState, useEffect } from 'react'
import { Menu, Settings, LogOut, ChevronDown, Bell } from 'lucide-react'

export interface HeaderProps {
  onMenuClick?: () => void
  userName?: string
  userRole?: string
}

export function Header({ onMenuClick, userName = 'User', userRole = 'Admin' }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const initials = userName.charAt(0).toUpperCase()

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <header className="top-header">
      <div className="header-left">
        {/* Hamburger menu only for mobile */}
        {isMobile && (
          <button
            type="button"
            onClick={onMenuClick}
            className="menu-button"
            aria-label="Toggle menu"
          >
            <Menu size={24} strokeWidth={2} />
          </button>
        )}
        <div className="header-title-group">
          <h1 className="header-title">Moto Garage</h1>
        </div>
      </div>

      <div className="header-right">
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
        <div className="user-menu-wrapper">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="user-menu-button"
            aria-expanded={showDropdown}
            aria-haspopup="true"
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
