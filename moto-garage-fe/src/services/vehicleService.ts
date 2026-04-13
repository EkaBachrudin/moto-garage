import { apiClient } from './api'
import type { Vehicle, CreateVehicleForm } from '@/types'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  error_code?: string
}

class VehicleService {
  async getAllVehicles(customerId?: string): Promise<Vehicle[]> {
    const params = customerId ? { customer_id: customerId } : undefined
    const response = await apiClient.get<ApiResponse<Vehicle[]>>('/vehicles', params)

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch vehicles')
    }

    return response.data
  }

  async getVehicleById(vehicleId: string): Promise<Vehicle> {
    const response = await apiClient.get<ApiResponse<Vehicle>>(`/vehicles/${vehicleId}`)

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch vehicle')
    }

    return response.data
  }

  async findVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
    try {
      const response = await apiClient.get<ApiResponse<Vehicle>>(`/vehicles/plate/${plateNumber}`)

      if (!response.success) {
        return null
      }

      return response.data
    } catch {
      return null
    }
  }

  async getVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
    return this.getAllVehicles(customerId)
  }

  async createVehicle(data: CreateVehicleForm): Promise<Vehicle> {
    const response = await apiClient.post<ApiResponse<Vehicle>>('/vehicles', data)

    if (!response.success) {
      throw new Error(response.message || 'Failed to create vehicle')
    }

    return response.data
  }

  async updateVehicle(vehicleId: string, data: Partial<CreateVehicleForm>): Promise<Vehicle> {
    const response = await apiClient.put<ApiResponse<Vehicle>>(`/vehicles/${vehicleId}`, data)

    if (!response.success) {
      throw new Error(response.message || 'Failed to update vehicle')
    }

    return response.data
  }

  async deleteVehicle(vehicleId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/vehicles/${vehicleId}`)

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete vehicle')
    }
  }
}

export const vehicleService = new VehicleService()
