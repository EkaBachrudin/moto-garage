import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export interface MainLayoutProps {
  userName?: string
  userRole?: string
}

export function MainLayout({ userName, userRole }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="main-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        userRole={userRole as any}
      />

      <div className="main-content">
        <Header
          onMenuClick={toggleSidebar}
          userName={userName}
          userRole={userRole}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1020,
            display: 'none'
          }}
          className="md:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
}
