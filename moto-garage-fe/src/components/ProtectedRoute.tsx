import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useCanAccessRoute } from '@/hooks'
import type { UserRole } from '@/types'
import { MainLayout } from './layout'

export interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles?: UserRole[]
  fallback?: React.ReactNode
}

// Component for providing MainLayout with user context (used at top level)
export function LayoutRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <MainLayout userName={user?.full_name} userRole={user?.role?.name}>
      {children || <Outlet />}
    </MainLayout>
  )
}

// Component for role-based access control (used for specific routes)
export function ProtectedRoute({
  children,
  allowedRoles,
  fallback
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const canAccess = useCanAccessRoute(allowedRoles)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !canAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Navigate
        to="/dashboard"
        state={{
          accessDenied: true,
          message: 'You do not have permission to access this page.'
        }}
        replace
      />
    )
  }

  return <>{children}</>
}

// A wrapper component for routes that require specific roles
export function RoleRoute({ children, allowedRoles }: ProtectedRouteProps) {
  return <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>
}
