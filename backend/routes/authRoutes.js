import express from 'express';
import {
  login,
  logout,
  verifyToken,
  getProfile,
  createDefaultUser
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', verifyToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Development route (remove in production)
router.post('/create-default-user', createDefaultUser);

export default router;
