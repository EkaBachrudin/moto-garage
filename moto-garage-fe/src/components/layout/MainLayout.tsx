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

      {/* Mobile sidebar overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
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
    </div>
  )
}
