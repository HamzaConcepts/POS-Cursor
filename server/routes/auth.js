import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', authenticate, register); // Manager only (checked in controller)
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;

