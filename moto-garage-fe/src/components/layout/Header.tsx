import { useState } from 'react'

export interface HeaderProps {
  onMenuClick?: () => void
  userName?: string
  userRole?: string
}

export function Header({ onMenuClick, userName = 'User', userRole = 'Admin' }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            color: 'var(--color-gray-700)'
          }}
          className="md:hidden"
        >
          ☰
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'var(--color-gray-900)' }}>
          Sistem Manajemen Bengkel
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              background: 'var(--color-white)',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--color-gray-700)'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: 'left', marginLeft: '8px' }}>
              <div style={{ fontWeight: '500', lineHeight: '1.2' }}>{userName}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{userRole}</div>
            </div>
          </button>

          {showDropdown && (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 1040
                }}
                onClick={() => setShowDropdown(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                minWidth: '200px',
                background: 'var(--color-white)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1050,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{userName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{userRole}</div>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <a
                    href="/settings"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      textDecoration: 'none',
                      color: 'var(--color-gray-700)',
                      fontSize: '14px'
                    }}
                  >
                    ⚙️ Pengaturan
                  </a>
                  <a
                    href="/logout"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      textDecoration: 'none',
                      color: 'var(--color-error)',
                      fontSize: '14px'
                    }}
                  >
                    🚪 Keluar
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
