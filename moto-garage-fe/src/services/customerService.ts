import { mockCustomers } from '@/mocks'
import type { Customer, CreateCustomerForm } from '@/types'

class CustomerService {
  async getAllCustomers(search?: string): Promise<Customer[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    let customers = [...mockCustomers]

    if (search) {
      const searchLower = search.toLowerCase()
      customers = customers.filter(c =>
        c.full_name.toLowerCase().includes(searchLower) ||
        c.phone.includes(search) ||
        c.address.toLowerCase().includes(searchLower)
      )
    }

    return customers
  }

  async getCustomerById(customerId: string): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const customer = mockCustomers.find(c => c.customer_id === customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }
    return customer
  }

  async createCustomer(data: CreateCustomerForm): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const newCustomer: Customer = {
      customer_id: 'c' + (mockCustomers.length + 1),
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      is_member: data.is_member,
      created_at: new Date().toISOString()
    }

    mockCustomers.push(newCustomer)
    return newCustomer
  }

  async updateCustomer(customerId: string, data: Partial<CreateCustomerForm>): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const customer = mockCustomers.find(c => c.customer_id === customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }

    Object.assign(customer, data)
    return customer
  }

  async deleteCustomer(customerId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockCustomers.findIndex(c => c.customer_id === customerId)
    if (index === -1) {
      throw new Error('Customer not found')
    }

    mockCustomers.splice(index, 1)
  }
}

export const customerService = new CustomerService()
