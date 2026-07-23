import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';
import { getCurrentUser, saveProfile, getAllUsers, updateUserRole, deleteUser } from '../controllers/authController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';

// Simple middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  try {
    const doc = await getFirebaseAdminDb().collection('users').doc(req.user.uid).get();
    if (doc.exists && doc.data().role === 'admin') {
      return next();
    }
    
    if (req.user.role === 'admin') {
      return next();
    }
  } catch (e) {
    console.error("Error checking admin role:", e);
  }

  res.status(403).json({ message: 'Forbidden: Admin access required.' });
};

export const authRoutes = Router();

authRoutes.get('/me', requireAuth, getCurrentUser);
authRoutes.post('/profile', requireAuth, saveProfile);
authRoutes.get('/dashboard', requireAuth, getDashboardSummary);

// Admin routes
authRoutes.get('/users', requireAuth, requireAdmin, getAllUsers);
authRoutes.put('/users/:uid/role', requireAuth, requireAdmin, updateUserRole);
authRoutes.delete('/users/:uid', requireAuth, requireAdmin, deleteUser);