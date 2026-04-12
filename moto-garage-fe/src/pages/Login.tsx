import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import './Login.css'

interface LoginFormData {
  email: string
  password: string
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()

    try {
      await login(formData)
      navigate(from, { replace: true })
    } catch (err) {
      // Error is handled by the store
      console.error('Login failed:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏍️ Moto Garage</h1>
          <p>Silakan login untuk melanjutkan</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" name="remember" disabled={isLoading} />
              <span>Ingat saya</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Lupa password?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? <span className="spinner spinner-sm" /> : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>
            Demo: Gunakan email apa saja dengan password apa saja
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
