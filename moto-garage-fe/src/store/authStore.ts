import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginRequest, LoginResponse } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Replace with actual API call
          // const response = await authService.login(credentials)
          const mockResponse: LoginResponse = {
            user: {
              user_id: '1',
              role_id: '1',
              full_name: 'Admin User',
              email: credentials.email,
              phone: '628123456789',
              commission_rate: 0,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              role: {
                role_id: '1',
                name: 'admin',
                description: 'Administrator',
                permissions: {},
                is_active: true,
                created_at: new Date().toISOString()
              }
            },
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token'
          }

          set({
            user: mockResponse.user,
            accessToken: mockResponse.access_token,
            refreshToken: mockResponse.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Replace with actual API call
          // await authService.logout()

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message || 'Logout failed',
            isLoading: false
          })
          throw error
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          // TODO: Replace with actual API call
          // const response = await authService.refreshToken(refreshToken)

          set({
            accessToken: 'new_mock_access_token',
            isLoading: false
          })
        } catch (error: any) {
          // If refresh fails, logout user
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: error.message || 'Session expired'
          })
          throw error
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
