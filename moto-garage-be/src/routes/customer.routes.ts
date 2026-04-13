import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validateCSRF } from '../middleware/csrf.middleware';

const router = Router();

/**
 * @route   GET /api/v1/customers
 * @desc    Get all customers with optional search
 * @access  Private
 * @query   search - Search by name or phone
 */
router.get('/', authenticate, getCustomers);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
router.get('/:id', authenticate, getCustomerById);

/**
 * @route   POST /api/v1/customers
 * @desc    Create new customer
 * @access  Private
 */
router.post('/', authenticate, validateCSRF, createCustomer);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private
 */
router.put('/:id', authenticate, validateCSRF, updateCustomer);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Delete customer
 * @access  Private
 */
router.delete('/:id', authenticate, validateCSRF, deleteCustomer);

export default router;
