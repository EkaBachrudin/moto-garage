import type { Vehicle } from '@/types'

export const mockVehicles: Vehicle[] = [
  {
    vehicle_id: 'v1',
    customer_id: 'c1',
    plate_number: 'B 1234 ABC',
    brand_type: 'Honda Beat 2020'
  },
  {
    vehicle_id: 'v2',
    customer_id: 'c1',
    plate_number: 'B 1235 ABC',
    brand_type: 'Honda Vario 150 2021'
  },
  {
    vehicle_id: 'v3',
    customer_id: 'c2',
    plate_number: 'B 2345 DEF',
    brand_type: 'Yamaha Mio M3 2019'
  },
  {
    vehicle_id: 'v4',
    customer_id: 'c3',
    plate_number: 'B 3456 GHI',
    brand_type: 'Honda Scoopy 2022'
  },
  {
    vehicle_id: 'v5',
    customer_id: 'c3',
    plate_number: 'B 3457 GHI',
    brand_type: 'Honda PCX 2021'
  },
  {
    vehicle_id: 'v6',
    customer_id: 'c4',
    plate_number: 'B 4567 JKL',
    brand_type: 'Yamaha NMAX 2020'
  },
  {
    vehicle_id: 'v7',
    customer_id: 'c5',
    plate_number: 'B 5678 MNO',
    brand_type: 'Honda Beat 2022'
  },
  {
    vehicle_id: 'v8',
    customer_id: 'c6',
    plate_number: 'B 6789 PQR',
    brand_type: 'Yamaha Fazzio 2023'
  },
  {
    vehicle_id: 'v9',
    customer_id: 'c7',
    plate_number: 'B 7890 STU',
    brand_type: 'Honda Genio 2021'
  },
  {
    vehicle_id: 'v10',
    customer_id: 'c8',
    plate_number: 'B 8901 VWX',
    brand_type: 'Yamaha XSR 155 2022'
  }
]

// Helper function to find vehicle by plate number
export const findVehicleByPlate = (plateNumber: string): Vehicle | undefined => {
  return mockVehicles.find(v => v.plate_number.toLowerCase() === plateNumber.toLowerCase())
}

// Helper function to get vehicles by customer
export const getVehiclesByCustomer = (customerId: string): Vehicle[] => {
  return mockVehicles.filter(v => v.customer_id === customerId)
}
