import { Request, Response } from 'express';
import { query } from '../config/database';

/**
 * GET /api/v1/users
 * Get all users with optional role filter
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;

    let sql = `
      SELECT u.user_id, u.full_name, u.email, u.phone,
             u.commission_rate, u.is_active, u.created_at, u.updated_at,
             r.role_id, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      WHERE u.is_active = true
    `;

    const params: any[] = [];

    // Filter by role name (e.g., 'mekanik')
    if (role && typeof role === 'string') {
      sql += ` AND r.name = $1`;
      params.push(role);
    }

    sql += ` ORDER BY u.full_name ASC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT u.user_id, u.full_name, u.email, u.phone,
              u.commission_rate, u.is_active, u.created_at, u.updated_at,
              r.role_id, r.name as role_name, r.permissions
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
