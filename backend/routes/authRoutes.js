import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getCurrentUser, saveProfile } from '../controllers/authController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';

export const authRoutes = Router();

authRoutes.get('/me', requireAuth, getCurrentUser);
authRoutes.post('/profile', requireAuth, saveProfile);
authRoutes.get('/dashboard', requireAuth, getDashboardSummary);