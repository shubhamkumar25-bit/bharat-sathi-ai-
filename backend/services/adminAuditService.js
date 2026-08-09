import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

/**
 * Admin Audit Log Service
 * Tracks all administrative actions for security and compliance
 */

class AdminAuditService {
  constructor() {
    try {
      this.db = getFirebaseAdminDb();
      this.firebaseAvailable = true;
    } catch (error) {
      console.warn('Firebase Admin not available. Audit service will be disabled.');
      this.db = null;
      this.firebaseAvailable = false;
    }
  }

  /**
   * Log an admin action
   * @param {Object} auditData - Audit log data
   */
  async logAction(auditData) {
    if (!this.firebaseAvailable || !this.db) {
      console.warn('Firebase not available. Skipping audit logging.');
      return { success: false, error: 'Firebase not available' };
    }

    try {
      const auditLog = {
        admin_id: auditData.admin_id,
        admin_email: auditData.admin_email,
        action: auditData.action,
        target_type: auditData.target_type || null,
        target_id: auditData.target_id || null,
        metadata: auditData.metadata || {},
        created_at: new Date().toISOString(),
      };

      await this.db.collection('admin_audit_log').add(auditLog);
      return { success: true };
    } catch (error) {
      console.error('Error logging admin action:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log admin login
   */
  async logAdminLogin(adminId, adminEmail, metadata = {}) {
    return this.logAction({
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'ADMIN_LOGIN',
      target_type: null,
      target_id: null,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log user viewed by admin
   */
  async logUserViewed(adminId, adminEmail, targetUserId, metadata = {}) {
    return this.logAction({
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'USER_VIEWED',
      target_type: 'user',
      target_id: targetUserId,
      metadata,
    });
  }

  /**
   * Log user updated by admin
   */
  async logUserUpdated(adminId, adminEmail, targetUserId, metadata = {}) {
    return this.logAction({
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'USER_UPDATED',
      target_type: 'user',
      target_id: targetUserId,
      metadata,
    });
  }

  /**
   * Log user suspended by admin
   */
  async logUserSuspended(adminId, adminEmail, targetUserId, metadata = {}) {
    return this.logAction({
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'USER_SUSPENDED',
      target_type: 'user',
      target_id: targetUserId,
      metadata,
    });
  }

  /**
   * Log scheme viewed by admin
   */
  async logSchemeViewed(adminId, adminEmail, schemeId, metadata = {}) {
    return this.logAction({
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'SCHEME_VIEWED',
      target_type: 'scheme',
      target_id: schemeId,
      metadata,
    });
  }

  /**
   * Log dataset synced by admin
   */
  async logDatasetSynced(adminId, adminEmail, datasetId, metadata = {}) {
    return this.logAction({
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'DATASET_SYNCED',
      target_type: 'dataset',
      target_id: datasetId,
      metadata,
    });
  }

  /**
   * Log settings changed by admin
   */
  async logSettingsChanged(adminId, adminEmail, metadata = {}) {
    return this.logAction({
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'SETTINGS_CHANGED',
      target_type: 'settings',
      target_id: null,
      metadata,
    });
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters = {}, limit = 100) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: [] };
    }

    try {
      let query = this.db.collection('admin_audit_log');

      if (filters.admin_id) {
        query = query.where('admin_id', '==', filters.admin_id);
      }
      if (filters.action) {
        query = query.where('action', '==', filters.action);
      }
      if (filters.target_type) {
        query = query.where('target_type', '==', filters.target_type);
      }
      if (filters.start_date) {
        query = query.where('created_at', '>=', filters.start_date);
      }
      if (filters.end_date) {
        query = query.where('created_at', '<=', filters.end_date);
      }

      const snapshot = await query.orderBy('created_at', 'desc').limit(limit).get();

      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: logs };
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audit logs for a specific admin
   */
  async getAdminAuditLogs(adminId, limit = 50) {
    return this.getAuditLogs({ admin_id: adminId }, limit);
  }

  /**
   * Get recent audit logs
   */
  async getRecentAuditLogs(limit = 20) {
    return this.getAuditLogs({}, limit);
  }
}

export default new AdminAuditService();
