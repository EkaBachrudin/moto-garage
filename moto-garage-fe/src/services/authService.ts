import { apiClient, mockDelay } from './api'
import type { LoginRequest, LoginResponse, User } from '@/types'

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    await mockDelay(500)

    // Mock login - accept any email/password for demo
    // In production, this would call the actual API
    if (credentials.email && credentials.password) {
      const mockResponse: LoginResponse = {
        user: {
          user_id: 'u1',
          role_id: 'r1',
          full_name: 'Admin User',
          email: credentials.email,
          phone: '628123456789',
          commission_rate: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: {
            role_id: 'r1',
            name: 'admin',
            description: 'Administrator',
            permissions: {},
            is_active: true,
            created_at: new Date().toISOString()
          }
        },
        access_token: 'mock_access_token_' + Date.now(),
        refresh_token: 'mock_refresh_token_' + Date.now()
      }
      return mockResponse
    }

    throw new Error('Invalid credentials')
  }

  async logout(): Promise<void> {
    await mockDelay(300)
    // In production, this would call the actual API
    return Promise.resolve()
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    await mockDelay(300)
    // In production, this would call the actual API
    return {
      access_token: 'new_mock_access_token_' + Date.now()
    }
  }

  async getCurrentUser(): Promise<User> {
    await mockDelay(300)
    // In production, this would call the actual API
    const mockUser: User = {
      user_id: 'u1',
      role_id: 'r1',
      full_name: 'Admin User',
      email: 'admin@example.com',
      phone: '628123456789',
      commission_rate: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: {
        role_id: 'r1',
        name: 'admin',
        description: 'Administrator',
        permissions: {},
        is_active: true,
        created_at: new Date().toISOString()
      }
    }
    return mockUser
  }
}

export const authService = new AuthService()
