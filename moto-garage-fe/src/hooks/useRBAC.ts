import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

export interface Permission {
  view: boolean
  create?: boolean
  update?: boolean
  delete?: boolean
  export?: boolean
}

export interface RolePermissions {
  dashboard: Permission
  orders: Permission
  products: Permission
  customers: Permission
  employees: Permission
  reports: Permission
}

/**
 * Check if user has specific permission for a resource
 */
export function usePermission(resource: keyof RolePermissions): Permission {
  const { user } = useAuthStore()

  return useMemo(() => {
    if (!user?.role?.permissions) {
      return { view: false }
    }

    const permissions = user.role.permissions as Record<string, Permission>
    return permissions[resource] || { view: false }
  }, [user?.role?.permissions, resource])
}

/**
 * Check if user has any of the specified roles
 */
export function useHasRole(roles: UserRole[]): boolean {
  const { user } = useAuthStore()

  return useMemo(() => {
    if (!user?.role) return false
    return roles.includes(user.role.name as UserRole)
  }, [user?.role, roles])
}

/**
 * Check if user is admin
 */
export function useIsAdmin(): boolean {
  return useHasRole(['admin'])
}

/**
 * Check if user is kasir
 */
export function useIsKasir(): boolean {
  return useHasRole(['kasir'])
}

/**
 * Check if user is mekanik
 */
export function useIsMekanik(): boolean {
  return useHasRole(['mekanik'])
}

/**
 * Check if user can perform action on resource
 */
export function useCanPerformAction(
  resource: keyof RolePermissions,
  action: keyof Permission
): boolean {
  const permission = usePermission(resource)
  return !!permission[action]
}

/**
 * Get all permissions for current user
 */
export function usePermissions(): RolePermissions | null {
  const { user } = useAuthStore()

  return useMemo(() => {
    if (!user?.role?.permissions) return null
    return user.role.permissions as RolePermissions
  }, [user?.role?.permissions])
}

/**
 * Check if route is accessible for current user
 */
export function useCanAccessRoute(allowedRoles?: UserRole[]): boolean {
  const { isAuthenticated } = useAuthStore()
  const hasRole = useHasRole(allowedRoles || [])

  if (!allowedRoles || allowedRoles.length === 0) {
    return isAuthenticated
  }

  return isAuthenticated && hasRole
}
