import { Router } from 'express';
import {
  getVehicles,
  getVehicleByPlate,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicle.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateCSRF } from '../middleware/csrf.middleware';

const router = Router();

/**
 * @route   GET /api/v1/vehicles
 * @desc    Get all vehicles with optional customer filter
 * @access  Private
 * @query   customer_id - Filter by customer ID
 */
router.get('/', authenticate, getVehicles);

/**
 * @route   GET /api/v1/vehicles/plate/:plate
 * @desc    Find vehicle by plate number
 * @access  Private
 */
router.get('/plate/:plate', authenticate, getVehicleByPlate);

/**
 * @route   GET /api/v1/vehicles/:id
 * @desc    Get vehicle by ID
 * @access  Private
 */
router.get('/:id', authenticate, getVehicleById);

/**
 * @route   POST /api/v1/vehicles
 * @desc    Create new vehicle
 * @access  Private
 */
router.post('/', authenticate, validateCSRF, createVehicle);

/**
 * @route   PUT /api/v1/vehicles/:id
 * @desc    Update vehicle
 * @access  Private
 */
router.put('/:id', authenticate, validateCSRF, updateVehicle);

/**
 * @route   DELETE /api/v1/vehicles/:id
 * @desc    Delete vehicle
 * @access  Private
 */
router.delete('/:id', authenticate, validateCSRF, deleteVehicle);

export default router;
