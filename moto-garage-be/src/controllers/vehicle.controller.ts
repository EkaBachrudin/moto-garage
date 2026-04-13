import { Request, Response } from 'express';
import { query } from '../config/database';

interface CreateVehicleBody {
  customer_id: string;
  plate_number: string;
  brand_type: string;
}

/**
 * GET /api/v1/vehicles
 * Get all vehicles
 */
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const { customer_id } = req.query;

    let sql = `
      SELECT v.vehicle_id, v.customer_id, v.plate_number, v.brand_type,
             c.full_name as customer_name, c.phone as customer_phone,
             COALESCE(so.status, 'Available') as current_order_status,
             so.order_id as active_order_id
      FROM vehicles v
      LEFT JOIN customers c ON v.customer_id = c.customer_id
      LEFT JOIN LATERAL (
        SELECT order_id, status
        FROM service_orders
        WHERE vehicle_id = v.vehicle_id AND status NOT IN ('Selesai', 'Batal')
        ORDER BY entry_date DESC
        LIMIT 1
      ) so ON true
    `;

    const params: any[] = [];

    // Filter by customer_id
    if (customer_id && typeof customer_id === 'string') {
      sql += ` WHERE v.customer_id = $1`;
      params.push(customer_id);
    }

    sql += ` ORDER BY c.full_name ASC, v.plate_number ASC`;

    const result = await query(sql, params);

    // Add can_order flag to each vehicle
    const vehiclesWithStatus = result.rows.map((vehicle: any) => ({
      ...vehicle,
      can_order: !vehicle.active_order_id,
      order_blocked_reason: vehicle.active_order_id
        ? `Kendaraan masih dalam proses service dengan status "${vehicle.current_order_status}"`
        : null
    }));

    return res.status(200).json({
      success: true,
      data: vehiclesWithStatus,
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * GET /api/v1/vehicles/plate/:plate
 * Find vehicle by plate number
 */
export const getVehicleByPlate = async (req: Request, res: Response) => {
  try {
    const { plate } = req.params;

    // Ensure plate is a string
    const plateNumber = Array.isArray(plate) ? plate[0] : plate;

    const result = await query(
      `SELECT v.vehicle_id, v.customer_id, v.plate_number, v.brand_type,
              c.full_name as customer_name, c.phone as customer_phone, c.address as customer_address
       FROM vehicles v
       LEFT JOIN customers c ON v.customer_id = c.customer_id
       WHERE v.plate_number = $1`,
      [plateNumber ? plateNumber.toUpperCase() : '']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get vehicle by plate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * GET /api/v1/vehicles/:id
 * Get vehicle by ID
 */
export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT v.vehicle_id, v.customer_id, v.plate_number, v.brand_type,
              c.full_name as customer_name, c.phone as customer_phone, c.address as customer_address
       FROM vehicles v
       LEFT JOIN customers c ON v.customer_id = c.customer_id
       WHERE v.vehicle_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/vehicles
 * Create new vehicle
 */
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { customer_id, plate_number, brand_type }: CreateVehicleBody = req.body;

    // Validation
    if (!customer_id || !plate_number || !brand_type) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, plate number, and brand type are required',
        error_code: 'VEHICLE_001',
      });
    }

    // Check if customer exists
    const customerCheck = await query(
      'SELECT customer_id FROM customers WHERE customer_id = $1',
      [customer_id]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
        error_code: 'VEHICLE_002',
      });
    }

    // Check if plate number already exists
    const plateCheck = await query(
      'SELECT vehicle_id FROM vehicles WHERE plate_number = $1',
      [plate_number.toUpperCase()]
    );

    if (plateCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Plate number already registered',
        error_code: 'VEHICLE_003',
      });
    }

    // Insert vehicle
    const result = await query(
      `INSERT INTO vehicles (customer_id, plate_number, brand_type)
       VALUES ($1, $2, $3)
       RETURNING vehicle_id, customer_id, plate_number, brand_type`,
      [customer_id, plate_number.toUpperCase(), brand_type]
    );

    const newVehicle = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: newVehicle,
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * PUT /api/v1/vehicles/:id
 * Update vehicle
 */
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customer_id, plate_number, brand_type }: Partial<CreateVehicleBody> = req.body;

    // Check if vehicle exists
    const existingVehicle = await query(
      'SELECT vehicle_id FROM vehicles WHERE vehicle_id = $1',
      [id]
    );

    if (existingVehicle.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Check if customer exists (if updating customer_id)
    if (customer_id) {
      const customerCheck = await query(
        'SELECT customer_id FROM customers WHERE customer_id = $1',
        [customer_id]
      );

      if (customerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          error_code: 'VEHICLE_002',
        });
      }
    }

    // Check if plate number already exists (excluding current vehicle)
    if (plate_number) {
      const plateCheck = await query(
        'SELECT vehicle_id FROM vehicles WHERE plate_number = $1 AND vehicle_id != $2',
        [plate_number.toUpperCase(), id]
      );

      if (plateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Plate number already registered',
          error_code: 'VEHICLE_003',
        });
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (customer_id) {
      updateFields.push(`customer_id = $${paramIndex++}`);
      updateValues.push(customer_id);
    }
    if (plate_number) {
      updateFields.push(`plate_number = $${paramIndex++}`);
      updateValues.push(plate_number.toUpperCase());
    }
    if (brand_type) {
      updateFields.push(`brand_type = $${paramIndex++}`);
      updateValues.push(brand_type);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updateValues.push(id);

    const result = await query(
      `UPDATE vehicles
       SET ${updateFields.join(', ')}
       WHERE vehicle_id = $${paramIndex}
       RETURNING vehicle_id, customer_id, plate_number, brand_type`,
      updateValues
    );

    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * DELETE /api/v1/vehicles/:id
 * Delete vehicle
 */
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if vehicle has any orders
    const checkResult = await query(
      'SELECT COUNT(*) as order_count FROM service_orders WHERE vehicle_id = $1',
      [id]
    );

    const orderCount = parseInt(checkResult.rows[0].order_count);

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle with existing orders',
        error_code: 'VEHICLE_004',
      });
    }

    // Delete vehicle
    await query('DELETE FROM vehicles WHERE vehicle_id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
