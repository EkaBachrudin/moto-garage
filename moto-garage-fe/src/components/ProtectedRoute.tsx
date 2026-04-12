import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import type { UserRole } from '@/types'

export interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (allowedRoles && user) {
    const hasAccess = allowedRoles.includes(user.role?.name as UserRole)
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}

// A wrapper component for routes that require specific roles
export function RoleRoute({ children, allowedRoles }: ProtectedRouteProps) {
  return <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>
}
