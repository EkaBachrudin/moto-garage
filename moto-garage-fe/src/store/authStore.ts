import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginRequest } from '@/types'
import { authService } from '@/services/authService'
import { apiClient } from '@/services/api'

export interface AuthState {
  user: User | null
  csrfToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      csrfToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(credentials)

          set({
            user: response.user,
            csrfToken: response.csrf_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })
        try {
          await authService.logout()

          set({
            user: null,
            csrfToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          // Clear local state even if API call fails
          set({
            user: null,
            csrfToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Logout failed',
          })
        }
      },

      refreshSession: async () => {
        // Prevent multiple refresh attempts
        const state = get()
        if (state.isLoading) {
          return
        }

        set({ isLoading: true })

        // Tell API client we're refreshing
        apiClient.setRefreshingState(true)

        try {
          const response = await authService.refreshToken()

          set({
            csrfToken: response.csrf_token,
            isLoading: false,
            error: null,
          })

          apiClient.setRefreshingState(false)
        } catch (error: any) {
          apiClient.setRefreshingState(false)

          // If refresh fails, clear auth state
          set({
            user: null,
            csrfToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Session expired',
          })
          throw error
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuth: async () => {
        try {
          const { user } = await authService.getCurrentUser()

          set({
            user,
            isAuthenticated: true,
            error: null,
          })

          return true
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
          })

          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
