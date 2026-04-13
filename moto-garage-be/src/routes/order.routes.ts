import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateCSRF } from '../middleware/csrf.middleware';

const router = Router();

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders with optional filters
 * @access  Private
 * @query   status - Filter by status (e.g., 'Antri', 'Pengecekan')
 * @query   customer_id - Filter by customer ID
 */
router.get('/', authenticate, getOrders);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', authenticate, validateCSRF, createOrder);

/**
 * @route   PUT /api/v1/orders/:id
 * @desc    Update order (status, mechanic, diagnosis)
 * @access  Private
 */
router.put('/:id', authenticate, validateCSRF, updateOrder);

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Delete order
 * @access  Private
 */
router.delete('/:id', authenticate, validateCSRF, deleteOrder);

export default router;
