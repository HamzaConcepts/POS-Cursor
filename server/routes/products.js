import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes (authenticated users)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (Admin and Manager only)
router.post('/', requireRole(['Admin', 'Manager']), createProduct);
router.put('/:id', requireRole(['Admin', 'Manager']), updateProduct);

// Manager only
router.delete('/:id', requireRole(['Manager']), deleteProduct);

export default router;


