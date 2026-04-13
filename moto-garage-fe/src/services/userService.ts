import { apiClient } from './api'
import type { User } from '@/types'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  error_code?: string
}

class UserService {
  async getAllUsers(role?: string): Promise<User[]> {
    const params = role ? { role } : undefined
    const response = await apiClient.get<ApiResponse<User[]>>('/users', params)

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch users')
    }

    return response.data
  }

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`)

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch user')
    }

    return response.data
  }

  async getMechanics(): Promise<User[]> {
    return this.getAllUsers('mekanik')
  }
}

export const userService = new UserService()
