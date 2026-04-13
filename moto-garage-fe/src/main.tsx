import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import '@/styles/variables.css'
import '@/styles/layout.css'
import '@/styles/components.css'
import '@/styles/status.css'
import '@/styles/dashboard.css'
import Login from './pages/Login'
import { MainLayout } from './components/layout'
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { ServiceOrdersList, CreateOrder, OrderDetail } from './pages/ServiceOrders'
import { CustomersList, CreateCustomer, CustomerDetail } from './pages/Customers'
import { InventoryList, CreateProduct } from './pages/Inventory'
import { Reports } from './pages/Reports'
import { MechanicView } from './pages/Mechanic'
import { PaymentsList, CreatePayment } from './pages/Payments'
import { useAuthStore } from './store'
import { UserRole } from './types'

// Access Denied Component
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-500 mb-8">You do not have permission to access this page.</p>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}

// App component with auth check
function App() {
  const { isAuthenticated, checkAuth } = useAuthStore()
  const location = useLocation()
  const hasCheckedAuth = useRef(false)
  const isRefreshing = useRef(false)

  useEffect(() => {
    // Only check auth once on mount
    const verifyAuth = async () => {
      if (hasCheckedAuth.current) return
      hasCheckedAuth.current = true

      try {
        await checkAuth()
      } catch (error) {
        // Silently fail - user will need to login
        console.log('Auth check failed, user needs to login')
      }
    }

    // Don't check if on login page
    if (location.pathname !== '/login') {
      verifyAuth()
    }

    // Setup token refresh listener
    const handleUnauthorized = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshing.current) {
        return
      }

      isRefreshing.current = true

      try {
        await useAuthStore.getState().refreshSession()
      } catch {
        // Redirect to login if refresh fails
        if (location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } finally {
        // Allow refresh again after a delay
        setTimeout(() => {
          isRefreshing.current = false
        }, 1000)
      }
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      {/* Protected routes - Base layout */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard - All roles */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Service Orders - All roles can view, Admin & Kasir can create */}
        <Route path="/orders" element={<ServiceOrdersList />} />
        <Route
          path="/orders/create"
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.KASIR]}>
              <CreateOrder />
            </RoleRoute>
          }
        />
        <Route path="/orders/:id" element={<OrderDetail />} />

        {/* Customers - Admin & Kasir only */}
        <Route
          path="/customers"
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.KASIR]}>
              <CustomersList />
            </RoleRoute>
          }
        />
        <Route
          path="/customers/create"
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.KASIR]}>
              <CreateCustomer />
            </RoleRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.KASIR]}>
              <CustomerDetail />
            </RoleRoute>
          }
        />

        {/* Inventory - Admin only (full access), Kasir & Mekanik (view only) */}
        <Route
          path="/inventory"
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.KASIR, UserRole.MEKANIK]}>
              <InventoryList />
            </RoleRoute>
          }
        />
        <Route
          path="/inventory/create"
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN]}>
              <CreateProduct />
            </RoleRoute>
          }
        />

        {/* Payments - Admin & Kasir only */}
        <Route
          path="/payments"
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.KASIR]}>
              <PaymentsList />
            </RoleRoute>
          }
        />
        <Route
          path="/payments/create"
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.KASIR]}>
              <CreatePayment />
            </RoleRoute>
          }
        />

        {/* Reports - Admin & Kasir only */}
        <Route
          path="/reports"
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.KASIR]}>
              <Reports />
            </RoleRoute>
          }
        />

        {/* Mechanic View - Mekanik only */}
        <Route
          path="/mechanic"
          element={
            <RoleRoute allowedRoles={[UserRole.MEKANIK]}>
              <MechanicView />
            </RoleRoute>
          }
        />
      </Route>

      {/* Access Denied Page */}
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
