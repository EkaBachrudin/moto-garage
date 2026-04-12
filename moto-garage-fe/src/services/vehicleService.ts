import { mockVehicles, findVehicleByPlate, getVehiclesByCustomer } from '@/mocks'
import type { Vehicle, CreateVehicleForm } from '@/types'

class VehicleService {
  async getAllVehicles(): Promise<Vehicle[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockVehicles]
  }

  async getVehicleById(vehicleId: string): Promise<Vehicle> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const vehicle = mockVehicles.find(v => v.vehicle_id === vehicleId)
    if (!vehicle) {
      throw new Error('Vehicle not found')
    }
    return vehicle
  }

  async findVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const vehicle = findVehicleByPlate(plateNumber)
    return vehicle || null
  }

  async getVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getVehiclesByCustomer(customerId)
  }

  async createVehicle(data: CreateVehicleForm): Promise<Vehicle> {
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if plate number already exists
    const existingVehicle = findVehicleByPlate(data.plate_number)
    if (existingVehicle) {
      throw new Error('Vehicle with this plate number already exists')
    }

    const newVehicle: Vehicle = {
      vehicle_id: 'v' + (mockVehicles.length + 1),
      customer_id: data.customer_id,
      plate_number: data.plate_number,
      brand_type: data.brand_type
    }

    mockVehicles.push(newVehicle)
    return newVehicle
  }

  async updateVehicle(vehicleId: string, data: Partial<CreateVehicleForm>): Promise<Vehicle> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const vehicle = mockVehicles.find(v => v.vehicle_id === vehicleId)
    if (!vehicle) {
      throw new Error('Vehicle not found')
    }

    Object.assign(vehicle, data)
    return vehicle
  }

  async deleteVehicle(vehicleId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockVehicles.findIndex(v => v.vehicle_id === vehicleId)
    if (index === -1) {
      throw new Error('Vehicle not found')
    }

    mockVehicles.splice(index, 1)
  }
}

export const vehicleService = new VehicleService()
