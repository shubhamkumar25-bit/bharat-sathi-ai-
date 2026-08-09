import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin, requireOwner } from '../middleware/adminAuthMiddleware.js';
import {
  getDashboardSummary,
  getUserAnalytics,
  getFeatureUsageAnalytics,
  getAIAnalytics,
  getSchemeAnalytics,
  getRetentionAnalytics,
  getAllUsersAdmin,
  getUserDetail,
  getAuditLogs,
  exportAnalytics,
} from '../controllers/adminAnalyticsController.js';

export const adminRoutes = Router();

// Dashboard
adminRoutes.get('/dashboard', requireAuth, requireAdmin, getDashboardSummary);

// User Analytics
adminRoutes.get('/analytics/users', requireAuth, requireAdmin, getUserAnalytics);

// Feature Usage Analytics
adminRoutes.get('/analytics/feature-usage', requireAuth, requireAdmin, getFeatureUsageAnalytics);

// AI Assistant Analytics
adminRoutes.get('/analytics/ai', requireAuth, requireAdmin, getAIAnalytics);

// Government Scheme Analytics
adminRoutes.get('/analytics/government-schemes', requireAuth, requireAdmin, getSchemeAnalytics);

// Retention Analytics
adminRoutes.get('/analytics/retention', requireAuth, requireAdmin, getRetentionAnalytics);

// User Management
adminRoutes.get('/users', requireAuth, requireAdmin, getAllUsersAdmin);
adminRoutes.get('/users/:userId', requireAuth, requireAdmin, getUserDetail);

// Audit Logs
adminRoutes.get('/audit-log', requireAuth, requireAdmin, getAuditLogs);

// Export Analytics
adminRoutes.get('/export', requireAuth, requireAdmin, exportAnalytics);
