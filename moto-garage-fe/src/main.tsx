import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@/styles/variables.css'
import '@/styles/layout.css'
import '@/styles/components.css'
import '@/styles/status.css'
import '@/styles/dashboard.css'
import Login from './pages/Login'
import { MainLayout } from './components/layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { ServiceOrdersList, CreateOrder, OrderDetail } from './pages/ServiceOrders'
import { CustomersList, CreateCustomer, CustomerDetail } from './pages/Customers'
import { InventoryList, CreateProduct } from './pages/Inventory'
import { Reports } from './pages/Reports'
import { MechanicView } from './pages/Mechanic'
import { PaymentsList, CreatePayment } from './pages/Payments'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1>{title}</h1>
      <p style={{ color: 'var(--color-gray-500)' }}>Halaman ini sedang dalam pengembangan</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Service Orders */}
          <Route path="/orders" element={<ServiceOrdersList />} />
          <Route path="/orders/create" element={<CreateOrder />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* Customers */}
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/create" element={<CreateCustomer />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />

          {/* Inventory */}
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/create" element={<CreateProduct />} />
          <Route path="/inventory/:id" element={<PlaceholderPage title="Detail Produk" />} />
          <Route path="/suppliers" element={<PlaceholderPage title="Supplier" />} />

          {/* Payments */}
          <Route path="/payments" element={<PaymentsList />} />
          <Route path="/payments/create" element={<CreatePayment />} />

          {/* Reports */}
          <Route path="/reports" element={<Reports />} />

          {/* Mechanic View */}
          <Route path="/mechanic" element={<MechanicView />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
