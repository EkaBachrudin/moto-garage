import { Request, Response } from 'express';
import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

interface CreateCustomerBody {
  full_name: string;
  phone: string;
  address?: string;
  is_member?: boolean;
}

/**
 * GET /api/v1/customers
 * Get all customers with optional search
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let sql = `
      SELECT customer_id, full_name, phone, address, is_member, created_at
      FROM customers
    `;

    const params: any[] = [];

    // Search by name or phone
    if (search && typeof search === 'string') {
      sql += ` WHERE full_name ILIKE $1 OR phone ILIKE $2`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY full_name ASC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * GET /api/v1/customers/:id
 * Get customer by ID
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT customer_id, full_name, phone, address, is_member, created_at
       FROM customers
       WHERE customer_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/customers
 * Create new customer
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { full_name, phone, address, is_member }: CreateCustomerBody = req.body;

    // Validation
    if (!full_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name and phone are required',
        error_code: 'CUSTOMER_001',
      });
    }

    // Check if phone already exists
    const existingCustomer = await query(
      'SELECT customer_id FROM customers WHERE phone = $1',
      [phone]
    );

    if (existingCustomer.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered',
        error_code: 'CUSTOMER_002',
      });
    }

    // Insert customer
    const result = await query(
      `INSERT INTO customers (full_name, phone, address, is_member)
       VALUES ($1, $2, $3, $4)
       RETURNING customer_id, full_name, phone, address, is_member, created_at`,
      [full_name, phone, address || null, is_member || false]
    );

    const newCustomer = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * PUT /api/v1/customers/:id
 * Update customer
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address, is_member }: Partial<CreateCustomerBody> = req.body;

    // Check if customer exists
    const existingCustomer = await query(
      'SELECT customer_id FROM customers WHERE customer_id = $1',
      [id]
    );

    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Check if phone already exists (excluding current customer)
    if (phone) {
      const phoneCheck = await query(
        'SELECT customer_id FROM customers WHERE phone = $1 AND customer_id != $2',
        [phone, id]
      );

      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered',
          error_code: 'CUSTOMER_002',
        });
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (full_name) {
      updateFields.push(`full_name = $${paramIndex++}`);
      updateValues.push(full_name);
    }
    if (phone) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(phone);
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      updateValues.push(address);
    }
    if (is_member !== undefined) {
      updateFields.push(`is_member = $${paramIndex++}`);
      updateValues.push(is_member);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updateValues.push(id);

    const result = await query(
      `UPDATE customers
       SET ${updateFields.join(', ')}
       WHERE customer_id = $${paramIndex}
       RETURNING customer_id, full_name, phone, address, is_member, created_at`,
      updateValues
    );

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * DELETE /api/v1/customers/:id
 * Delete customer
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if customer has any vehicles or orders
    const checkResult = await query(
      `SELECT
        (SELECT COUNT(*) FROM vehicles WHERE customer_id = $1) as vehicle_count,
        (SELECT COUNT(*) FROM service_orders WHERE customer_id = $1) as order_count`,
      [id]
    );

    const counts = checkResult.rows[0];

    if (parseInt(counts.vehicle_count) > 0 || parseInt(counts.order_count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with existing vehicles or orders',
        error_code: 'CUSTOMER_003',
      });
    }

    // Delete customer
    await query('DELETE FROM customers WHERE customer_id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
