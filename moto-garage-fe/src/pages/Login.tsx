import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Wrench, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
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
      <div className="login-background" />
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Wrench size={32} strokeWidth={2.5} />
          </div>
          <h1>Moto Garage</h1>
          <p>Silakan login untuk melanjutkan</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} strokeWidth={2} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <Mail size={18} strokeWidth={2} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
                disabled={isLoading}
                className="input-with-prefix"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} strokeWidth={2} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="input-with-prefix"
              />
            </div>
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
            {isLoading ? (
              <span className="spinner spinner-sm" />
            ) : (
              <>
                <span>Login</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Credentials:</p>
          <div className="demo-credentials">
            <div className="credential-item">
              <span className="role-badge admin">Admin</span>
              <code>admin@motogarage.com</code> / <code>Admin123!</code>
            </div>
            <div className="credential-item">
              <span className="role-badge kasir">Kasir</span>
              <code>kasir@motogarage.com</code> / <code>Kasir123!</code>
            </div>
            <div className="credential-item">
              <span className="role-badge mekanik">Mekanik</span>
              <code>mekanik@motogarage.com</code> / <code>Mekanik123!</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
