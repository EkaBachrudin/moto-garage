import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, getJTI } from '../utils/jwt.util';
import { query } from '../config/database';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        sessionId: string;
        jti: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT access token and checks if token is not revoked
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error_code: 'AUTH_001',
      });
    }

    // Verify JWT
    const payload = verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error_code: 'AUTH_003',
      });
    }

    // Check if token is revoked
    const revokedCheck = await query(
      'SELECT 1 FROM revoked_tokens WHERE jti = $1 AND expires_at > NOW()',
      [payload.jti]
    );

    if (revokedCheck.rows.length > 0) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        error_code: 'AUTH_004',
      });
    }

    // Check if session is still active
    const sessionCheck = await query(
      `SELECT s.is_active, s.expires_at, u.is_active as user_is_active
       FROM user_sessions s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.session_id = $1`,
      [payload.session_id]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Session not found',
        error_code: 'AUTH_003',
      });
    }

    const session = sessionCheck.rows[0];

    if (!session.is_active || session.expires_at < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or inactive',
        error_code: 'AUTH_003',
      });
    }

    if (!session.user_is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.',
        error_code: 'AUTH_002',
      });
    }

    // Update last activity
    await query(
      'UPDATE user_sessions SET last_activity_at = NOW() WHERE session_id = $1',
      [payload.session_id]
    );

    // Attach user info to request
    req.user = {
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.session_id,
      jti: payload.jti,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Optional authentication middleware
 * Does not fail if token is missing, but validates if present
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return next();
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      return next();
    }

    // Check if token is revoked
    const revokedCheck = await query(
      'SELECT 1 FROM revoked_tokens WHERE jti = $1 AND expires_at > NOW()',
      [payload.jti]
    );

    if (revokedCheck.rows.length > 0) {
      return next();
    }

    // Check session
    const sessionCheck = await query(
      `SELECT s.is_active, s.expires_at, u.is_active as user_is_active
       FROM user_sessions s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.session_id = $1`,
      [payload.session_id]
    );

    if (sessionCheck.rows.length > 0) {
      const session = sessionCheck.rows[0];

      if (session.is_active && session.expires_at >= new Date() && session.user_is_active) {
        req.user = {
          userId: payload.sub,
          email: payload.email,
          sessionId: payload.session_id,
          jti: payload.jti,
        };
      }
    }

    next();
  } catch {
    next();
  }
};
