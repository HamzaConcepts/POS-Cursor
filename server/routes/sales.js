import express from 'express';
import {
  createSale,
  getSales,
  getSaleById,
  addPayment
} from '../controllers/salesController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/:id/payment', addPayment);

export default router;


