import { Request, Response } from 'express';
import { query } from '../config/database';
import { generateOrderCode } from '../utils/orderCode';

interface CreateOrderBody {
  customer_id: string;
  vehicle_id: string;
  entry_type: 'Booking' | 'Walk-In';
  complaint: string;
  mechanic_ids?: string[];
}

interface UpdateOrderBody {
  status?: string;
  mechanic_id?: string;
  diagnosis?: string;
}

/**
 * GET /api/v1/orders
 * Get all orders with optional filters
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, customer_id } = req.query;

    let sql = `
      SELECT so.order_id, so.order_code, so.customer_id, so.vehicle_id, so.mechanic_id, so.created_by,
             so.status, so.entry_type, so.complaint, so.diagnosis,
             so.entry_date, so.completion_date,
             c.customer_id as cust_id, c.full_name as customer_name, c.phone as customer_phone,
             v.vehicle_id as veh_id, v.plate_number, v.brand_type,
             m.user_id as mech_id, m.full_name as mechanic_name
      FROM service_orders so
      LEFT JOIN customers c ON so.customer_id = c.customer_id
      LEFT JOIN vehicles v ON so.vehicle_id = v.vehicle_id
      LEFT JOIN users m ON so.mechanic_id = m.user_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by status
    if (status && typeof status === 'string') {
      sql += ` AND so.status = $${paramIndex++}`;
      params.push(status);
    }

    // Filter by customer_id
    if (customer_id && typeof customer_id === 'string') {
      sql += ` AND so.customer_id = $${paramIndex++}`;
      params.push(customer_id);
    }

    sql += ` ORDER BY so.entry_date DESC`;

    const result = await query(sql, params);

    // Format response to match frontend structure
    const formattedData = result.rows.map(row => ({
      order_id: row.order_id,
      order_code: row.order_code,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      mechanic_id: row.mechanic_id,
      mechanic_ids: row.mechanic_id ? [row.mechanic_id] : [],
      created_by: row.created_by,
      status: row.status,
      entry_type: row.entry_type,
      complaint: row.complaint,
      diagnosis: row.diagnosis,
      entry_date: row.entry_date,
      completion_date: row.completion_date,
      created_at: row.entry_date, // Use entry_date as created_at fallback
      updated_at: row.entry_date, // Use entry_date as updated_at fallback
      customer: {
        customer_id: row.cust_id,
        full_name: row.customer_name,
        phone: row.customer_phone,
      },
      vehicle: {
        vehicle_id: row.veh_id,
        plate_number: row.plate_number,
        brand_type: row.brand_type,
      },
      mechanic: row.mechanic_name ? {
        user_id: row.mech_id,
        full_name: row.mechanic_name,
      } : null,
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * GET /api/v1/orders/:id
 * Get order by ID
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT so.order_id, so.order_code, so.customer_id, so.vehicle_id, so.mechanic_id, so.created_by,
              so.status, so.entry_type, so.complaint, so.diagnosis,
              so.entry_date, so.completion_date,
              c.customer_id as cust_id, c.full_name as customer_name, c.phone as customer_phone, c.address as customer_address,
              v.vehicle_id as veh_id, v.plate_number, v.brand_type,
              m.user_id as mech_id, m.full_name as mechanic_name, m.phone as mechanic_phone
       FROM service_orders so
       LEFT JOIN customers c ON so.customer_id = c.customer_id
       LEFT JOIN vehicles v ON so.vehicle_id = v.vehicle_id
       LEFT JOIN users m ON so.mechanic_id = m.user_id
       WHERE so.order_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const row = result.rows[0];

    // Format response
    const order = {
      order_id: row.order_id,
      order_code: row.order_code,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      mechanic_id: row.mechanic_id,
      mechanic_ids: row.mechanic_id ? [row.mechanic_id] : [],
      created_by: row.created_by,
      status: row.status,
      entry_type: row.entry_type,
      complaint: row.complaint,
      diagnosis: row.diagnosis,
      entry_date: row.entry_date,
      completion_date: row.completion_date,
      created_at: row.entry_date, // Use entry_date as created_at fallback
      updated_at: row.entry_date, // Use entry_date as updated_at fallback
      customer: {
        customer_id: row.cust_id,
        full_name: row.customer_name,
        phone: row.customer_phone,
        address: row.customer_address,
      },
      vehicle: {
        vehicle_id: row.veh_id,
        plate_number: row.plate_number,
        brand_type: row.brand_type,
      },
      mechanic: row.mechanic_name ? {
        user_id: row.mech_id,
        full_name: row.mechanic_name,
        phone: row.mechanic_phone,
      } : null,
    };

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/orders
 * Create new order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer_id, vehicle_id, entry_type, complaint, mechanic_ids }: CreateOrderBody = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!customer_id || !vehicle_id || !entry_type || !complaint) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, vehicle ID, entry type, and complaint are required',
        error_code: 'ORDER_001',
      });
    }

    // Validate entry_type
    if (!['Booking', 'Walk-In'].includes(entry_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry type. Must be "Booking" or "Walk-In"',
        error_code: 'ORDER_002',
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
        error_code: 'ORDER_003',
      });
    }

    // Check if vehicle exists
    const vehicleCheck = await query(
      'SELECT vehicle_id, plate_number, brand_type FROM vehicles WHERE vehicle_id = $1',
      [vehicle_id]
    );

    if (vehicleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
        error_code: 'ORDER_004',
      });
    }

    // Check if vehicle has an active order (not 'Selesai' or 'Batal')
    const activeOrderCheck = await query(
      `SELECT order_id, status
       FROM service_orders
       WHERE vehicle_id = $1 AND status NOT IN ('Selesai', 'Batal')
       ORDER BY entry_date DESC
       LIMIT 1`,
      [vehicle_id]
    );

    if (activeOrderCheck.rows.length > 0) {
      const activeOrder = activeOrderCheck.rows[0];
      return res.status(400).json({
        success: false,
        message: `Motor dengan plat ${vehicleCheck.rows[0].plate_number} masih ada dalam antrian dengan status "${activeOrder.status}". Silakan selesaikan order terlebih dahulu.`,
        error_code: 'ORDER_009',
        active_order_id: activeOrder.order_id,
        current_status: activeOrder.status,
      });
    }

    // Validate mechanic if provided
    let mechanicId = null;
    if (mechanic_ids && mechanic_ids.length > 0) {
      const mechanicCheck = await query(
        `SELECT u.user_id, r.name as role_name
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.role_id
         WHERE u.user_id = $1 AND u.is_active = true`,
        [mechanic_ids[0]]
      );

      if (mechanicCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mechanic not found or inactive',
          error_code: 'ORDER_005',
        });
      }

      // Check if role is 'mekanik'
      if (mechanicCheck.rows[0].role_name !== 'mekanik') {
        return res.status(400).json({
          success: false,
          message: 'Selected user is not a mechanic',
          error_code: 'ORDER_006',
        });
      }

      mechanicId = mechanic_ids[0];
    }

    // Insert order
    const orderCode = await generateOrderCode();
    const result = await query(
      `INSERT INTO service_orders (order_code, customer_id, vehicle_id, mechanic_id, created_by, status, entry_type, complaint)
       VALUES ($1, $2, $3, $4, $5, 'Antri', $6, $7)
       RETURNING order_id, order_code, customer_id, vehicle_id, mechanic_id, status, entry_type, complaint, entry_date`,
      [orderCode, customer_id, vehicle_id, mechanicId, userId, entry_type, complaint]
    );

    const newOrder = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...newOrder,
        mechanic_ids: mechanicId ? [mechanicId] : [],
        created_at: newOrder.entry_date, // Use entry_date as created_at
        updated_at: newOrder.entry_date, // Use entry_date as updated_at
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * PUT /api/v1/orders/:id
 * Update order
 */
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, mechanic_id, diagnosis }: UpdateOrderBody = req.body;

    // Check if order exists
    const existingOrder = await query(
      'SELECT order_id FROM service_orders WHERE order_id = $1',
      [id]
    );

    if (existingOrder.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Validate status
    const validStatuses = ['Antri', 'Pengecekan', 'Dikerjakan', 'Konfirmasi Part', 'Menunggu Part', 'Selesai', 'Batal'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        error_code: 'ORDER_007',
      });
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);

      // Set completion_date when status is 'Selesai'
      if (status === 'Selesai') {
        updateFields.push(`completion_date = NOW()`);
      }
    }

    if (mechanic_id) {
      // Validate mechanic
      const mechanicCheck = await query(
        `SELECT u.user_id, r.name as role_name
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.role_id
         WHERE u.user_id = $1 AND u.is_active = true`,
        [mechanic_id]
      );

      if (mechanicCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mechanic not found or inactive',
          error_code: 'ORDER_005',
        });
      }

      if (mechanicCheck.rows[0].role_name !== 'mekanik') {
        return res.status(400).json({
          success: false,
          message: 'Selected user is not a mechanic',
          error_code: 'ORDER_006',
        });
      }

      updateFields.push(`mechanic_id = $${paramIndex++}`);
      updateValues.push(mechanic_id);
    }

    if (diagnosis !== undefined) {
      updateFields.push(`diagnosis = $${paramIndex++}`);
      updateValues.push(diagnosis);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updateValues.push(id);

    const result = await query(
      `UPDATE service_orders
       SET ${updateFields.join(', ')}
       WHERE order_id = $${paramIndex}
       RETURNING order_id, customer_id, vehicle_id, mechanic_id, status, entry_type, complaint, diagnosis, entry_date, completion_date`,
      updateValues
    );

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: {
        ...result.rows[0],
        mechanic_ids: result.rows[0].mechanic_id ? [result.rows[0].mechanic_id] : [],
        created_at: result.rows[0].entry_date, // Use entry_date as created_at
        updated_at: result.rows[0].entry_date, // Use entry_date as updated_at
      },
    });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * DELETE /api/v1/orders/:id
 * Delete order
 */
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const existingOrder = await query(
      'SELECT order_id, status FROM service_orders WHERE order_id = $1',
      [id]
    );

    if (existingOrder.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order has payments
    const paymentCheck = await query(
      'SELECT payment_id FROM payments WHERE order_id = $1',
      [id]
    );

    if (paymentCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete order with existing payments',
        error_code: 'ORDER_008',
      });
    }

    // Delete order details first
    await query('DELETE FROM order_details WHERE order_id = $1', [id]);

    // Delete order
    await query('DELETE FROM service_orders WHERE order_id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
