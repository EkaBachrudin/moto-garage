import { Router } from 'express';
import {
  login,
  refreshToken,
  logout,
  getCurrentSession,
  revokeAllSessions,
  register,
} from '../controllers/auth.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validateCSRF } from '../middleware/csrf.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and create session
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Rotate access token using refresh token
 * @access  Public (uses HTTP-only cookie)
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Terminate current session
 * @access  Private
 */
router.post('/logout', authenticate, validateCSRF, logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user session info
 * @access  Private
 */
router.get('/me', authenticate, getCurrentSession);

/**
 * @route   POST /api/v1/auth/revoke-all
 * @desc    Revoke all active sessions
 * @access  Private
 */
router.post('/revoke-all', authenticate, validateCSRF, revokeAllSessions);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user (admin only)
 * @access  Private (should be restricted to admin role)
 */
router.post('/register', authenticate, validateCSRF, register);

export default router;
