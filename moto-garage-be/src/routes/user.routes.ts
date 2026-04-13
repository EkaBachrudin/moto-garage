import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with optional role filter
 * @access  Private
 * @query   role - Filter by role name (e.g., 'mekanik')
 */
router.get('/', authenticate, getUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', authenticate, getUserById);

export default router;
