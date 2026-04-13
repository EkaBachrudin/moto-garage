import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useCanAccessRoute } from '@/hooks'
import type { UserRole } from '@/types'

export interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallback
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const canAccess = useCanAccessRoute(allowedRoles)
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0 && !canAccess) {
    // Show fallback if provided
    if (fallback) {
      return <>{fallback}</>
    }

    // Redirect to dashboard with access denied message
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
