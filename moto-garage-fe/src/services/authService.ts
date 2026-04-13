import { apiClient } from './api'
import type { LoginRequest, LoginResponse, User, UserSession } from '@/types'

interface LoginApiResponse {
  success: boolean
  message: string
  data: {
    user: User
    csrf_token: string
  }
}

interface RefreshTokenResponse {
  success: boolean
  data: {
    csrf_token: string
  }
}

interface MeApiResponse {
  success: boolean
  data: {
    user: User
    session: UserSession
  }
}

class AuthService {
  /**
   * Login with email and password
   * Uses HTTP-only cookies for token storage
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginApiResponse>('/auth/login', {
      email: credentials.email.toLowerCase(),
      password: credentials.password,
    })

    if (!response.success) {
      throw new Error(response.message || 'Login failed')
    }

    return {
      user: response.data.user,
      csrf_token: response.data.csrf_token,
    }
  }

  /**
   * Logout current session
   * Clears HTTP-only cookies
   */
  async logout(): Promise<void> {
    await apiClient.post<{ success: boolean; message: string }>('/auth/logout')
  }

  /**
   * Refresh access token using refresh token from HTTP-only cookie
   */
  async refreshToken(): Promise<{ csrf_token: string }> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh')
    return response.data
  }

  /**
   * Get current user session info
   */
  async getCurrentUser(): Promise<{ user: User; session: UserSession }> {
    const response = await apiClient.get<MeApiResponse>('/auth/me')
    return response.data
  }

  /**
   * Revoke all sessions for current user
   */
  async revokeAllSessions(): Promise<{ revoked_count: number }> {
    const response = await apiClient.post<{ success: boolean; message: string; data: { revoked_count: number } }>(
      '/auth/revoke-all'
    )
    return response.data
  }
}

export const authService = new AuthService()
