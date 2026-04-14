import { apiClient } from './api'
import type { User } from '@/types'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  error_code?: string
}

interface CreateMechanicForm {
  full_name: string
  email: string
  phone: string
  password: string
  commission_rate: number
}

interface UpdateMechanicForm {
  full_name?: string
  email?: string
  phone?: string
  password?: string
  commission_rate?: number
  is_active?: boolean
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

  async createMechanic(data: CreateMechanicForm): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users/mechanic', data)

    if (!response.success) {
      throw new Error(response.message || 'Failed to create mechanic')
    }

    return response.data
  }

  async updateMechanic(userId: string, data: UpdateMechanicForm): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/mechanic/${userId}`, data)

    if (!response.success) {
      throw new Error(response.message || 'Failed to update mechanic')
    }

    return response.data
  }

  async deleteMechanic(userId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/mechanic/${userId}`)

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete mechanic')
    }
  }
}

export const userService = new UserService()
