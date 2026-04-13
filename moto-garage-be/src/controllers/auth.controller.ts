import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { hashPassword, verifyPassword } from '../utils/password.util';
import { generateAccessToken } from '../utils/jwt.util';
import { generateRefreshToken, hashRefreshToken, generateCSRFToken, parseDeviceInfo } from '../utils/token.util';
import { authConfig } from '../config/auth';

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role_id?: string;
}

/**
 * POST /api/v1/auth/login
 * Authenticate user and create session
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginBody = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error_code: 'AUTH_001',
      });
    }

    // Find user
    const userResult = await query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.password_hash, u.is_active,
              r.role_id, r.name as role_name, r.permissions
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error_code: 'AUTH_001',
      });
    }

    const user = userResult.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.',
        error_code: 'AUTH_002',
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(user.password_hash, password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error_code: 'AUTH_001',
      });
    }

    // Deactivate existing session (single device login)
    await query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1 AND is_active = true',
      [user.user_id]
    );

    // Generate tokens
    const sessionId = uuidv4();
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const accessToken = generateAccessToken(user.user_id, user.email, sessionId);
    const csrfToken = generateCSRFToken();

    // Parse device info
    const deviceInfo = parseDeviceInfo(req.headers['user-agent']);

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + authConfig.refreshToken.expiryDays);

    // Create session
    await query(
      `INSERT INTO user_sessions (session_id, user_id, refresh_token_hash, device_info, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        sessionId,
        user.user_id,
        refreshTokenHash,
        JSON.stringify(deviceInfo),
        req.ip || null,
        req.headers['user-agent'] || null,
        expiresAt,
      ]
    );

    // Set cookies
    res.cookie('access_token', accessToken, authConfig.cookies.access);
    res.cookie('refresh_token', refreshToken, authConfig.cookies.refresh);
    res.cookie('csrf_token', csrfToken, authConfig.cookies.csrf);

    // Return response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role_name ? {
            id: user.role_id,
            name: user.role_name,
            permissions: user.permissions,
          } : null,
        },
        csrf_token: csrfToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/auth/refresh
 * Rotate access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found',
        error_code: 'AUTH_003',
      });
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Find session
    const sessionResult = await query(
      `SELECT s.session_id, s.user_id, s.expires_at, s.is_active,
              u.user_id, u.email, u.is_active
       FROM user_sessions s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.refresh_token_hash = $1`,
      [refreshTokenHash]
    );

    if (sessionResult.rows.length === 0) {
      // Clear cookies
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
      res.clearCookie('csrf_token', { path: '/' });

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        error_code: 'AUTH_003',
      });
    }

    const session = sessionResult.rows[0];

    // Check if session is active and not expired
    if (!session.is_active || session.expires_at < new Date()) {
      // Clear cookies
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
      res.clearCookie('csrf_token', { path: '/' });

      return res.status(401).json({
        success: false,
        message: 'Session expired or inactive',
        error_code: 'AUTH_003',
      });
    }

    // Check if user is active
    if (!session.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.',
        error_code: 'AUTH_002',
      });
    }

    // Generate new tokens (token rotation)
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    const newAccessToken = generateAccessToken(session.user_id, session.email, session.session_id);
    const newCsrfToken = generateCSRFToken();

    // Update session with new refresh token
    await query(
      'UPDATE user_sessions SET refresh_token_hash = $1 WHERE session_id = $2',
      [newRefreshTokenHash, session.session_id]
    );

    // Set new cookies
    res.cookie('access_token', newAccessToken, authConfig.cookies.access);
    res.cookie('refresh_token', newRefreshToken, authConfig.cookies.refresh);
    res.cookie('csrf_token', newCsrfToken, authConfig.cookies.csrf);

    return res.status(200).json({
      success: true,
      data: {
        csrf_token: newCsrfToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/auth/logout
 * Terminate current session
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.user?.sessionId;
    const jti = req.user?.jti;

    if (sessionId) {
      // Deactivate session
      await query('UPDATE user_sessions SET is_active = false WHERE session_id = $1', [sessionId]);
    }

    if (jti) {
      // Add to revoked tokens
      const payload = getPayloadFromToken(req.cookies?.access_token);
      if (payload?.exp) {
        const expiresAt = new Date(payload.exp * 1000);
        await query(
          'INSERT INTO revoked_tokens (jti, user_id, expires_at) VALUES ($1, $2, $3)',
          [jti, req.user?.userId, expiresAt]
        );
      }
    }

    // Clear cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    res.clearCookie('csrf_token', { path: '/' });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);

    // Still clear cookies even if error occurs
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    res.clearCookie('csrf_token', { path: '/' });

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * GET /api/v1/auth/me
 * Get current user session info
 */
export const getCurrentSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.user?.sessionId;

    if (!userId || !sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Get user and session info
    const result = await query(
      `SELECT u.user_id, u.full_name, u.email, u.phone,
              r.role_id, r.name as role_name, r.permissions,
              s.device_info, s.last_activity_at, s.expires_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN user_sessions s ON s.session_id = $1
       WHERE u.user_id = $2`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const data = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: data.user_id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          role: data.role_name ? {
            id: data.role_id,
            name: data.role_name,
            permissions: data.permissions,
          } : null,
        },
        session: {
          device_info: data.device_info,
          last_activity_at: data.last_activity_at,
          expires_at: data.expires_at,
        },
      },
    });
  } catch (error) {
    console.error('Get current session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/auth/revoke-all
 * Revoke all active sessions
 */
export const revokeAllSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const jti = req.user?.jti;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Revoke all sessions for user
    const result = await query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1 AND is_active = true RETURNING session_id',
      [userId]
    );

    // Add current token to revoked list
    if (jti) {
      const payload = getPayloadFromToken(req.cookies?.access_token);
      if (payload?.exp) {
        const expiresAt = new Date(payload.exp * 1000);
        await query(
          'INSERT INTO revoked_tokens (jti, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (jti) DO NOTHING',
          [jti, userId, expiresAt]
        );
      }
    }

    // Clear cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    res.clearCookie('csrf_token', { path: '/' });

    return res.status(200).json({
      success: true,
      message: 'All sessions revoked successfully',
      data: {
        revoked_count: result.rowCount || 0,
      },
    });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/auth/register
 * Register a new user (admin only, typically)
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, password, role_id }: RegisterBody = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required',
      });
    }

    // Check if email already exists
    const existingUser = await query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase()]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, full_name, email, phone, created_at`,
      [full_name, email.toLowerCase(), phone || null, passwordHash, role_id || null]
    );

    const newUser = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.user_id,
          full_name: newUser.full_name,
          email: newUser.email,
          phone: newUser.phone,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Helper function to get payload from token without verification
function getPayloadFromToken(token?: string): any {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64Payload = parts[1];
    if (!base64Payload) return null;

    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
