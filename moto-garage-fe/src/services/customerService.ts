import { apiClient } from './api'
import type { Customer, CreateCustomerForm } from '@/types'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  error_code?: string
}

class CustomerService {
  async getAllCustomers(search?: string): Promise<Customer[]> {
    const params = search ? { search } : undefined
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers', params)

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch customers')
    }

    return response.data
  }

  async getCustomerById(customerId: string): Promise<Customer> {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${customerId}`)

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch customer')
    }

    return response.data
  }

  async createCustomer(data: CreateCustomerForm): Promise<Customer> {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data)

    if (!response.success) {
      throw new Error(response.message || 'Failed to create customer')
    }

    return response.data
  }

  async updateCustomer(customerId: string, data: Partial<CreateCustomerForm>): Promise<Customer> {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${customerId}`, data)

    if (!response.success) {
      throw new Error(response.message || 'Failed to update customer')
    }

    return response.data
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/customers/${customerId}`)

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete customer')
    }
  }
}

export const customerService = new CustomerService()
