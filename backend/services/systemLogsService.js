import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

class SystemLogsService {
  constructor() {
    try {
      this.db = getFirebaseAdminDb();
      this.firebaseAvailable = true;
    } catch (error) {
      console.warn('Firebase Admin not available. System logs service will be disabled.');
      this.db = null;
      this.firebaseAvailable = false;
    }
  }

  /**
   * Log a system event / error
   * @param {Object} logData - Log entry data
   */
  async log(logData) {
    if (!this.firebaseAvailable || !this.db) {
      console.warn('Firebase not available. Skipping system logging.');
      return { success: false, error: 'Firebase not available' };
    }

    try {
      const entry = {
        level: logData.level || 'INFO', // INFO, WARNING, ERROR
        type: logData.type || 'SYSTEM', // INFO, WARNING, ERROR, SYNC_ERROR, AUTH_ERROR, API_ERROR
        service: logData.service || 'backend',
        message: logData.message || '',
        details: logData.details || '',
        operation_id: logData.operationId || null,
        metadata: logData.metadata || {},
        created_at: new Date().toISOString(),
      };

      // Scrub metadata or message of API keys if any
      const scrubText = (text) => {
        if (!text) return text;
        return String(text).replace(/gsk_[a-zA-Z0-9_-]{30,}/g, '[REDACTED_API_KEY]')
                          .replace(/AIzaSy[a-zA-Z0-9_-]{33}/g, '[REDACTED_API_KEY]')
                          .replace(/AQ\.[a-zA-Z0-9_-]{30,}/g, '[REDACTED_API_KEY]');
      };

      entry.message = scrubText(entry.message);
      entry.details = scrubText(entry.details);

      await this.db.collection('system_logs').add(entry);
      return { success: true };
    } catch (error) {
      console.error('Error writing system log:', error);
      return { success: false, error: error.message };
    }
  }

  async info(service, message, details = '', metadata = {}) {
    return this.log({ level: 'INFO', type: 'INFO', service, message, details, metadata });
  }

  async warn(service, message, details = '', metadata = {}) {
    return this.log({ level: 'WARNING', type: 'WARNING', service, message, details, metadata });
  }

  async error(service, message, details = '', metadata = {}) {
    return this.log({ level: 'ERROR', type: 'ERROR', service, message, details, metadata });
  }

  async syncError(service, message, details = '', metadata = {}) {
    return this.log({ level: 'ERROR', type: 'SYNC_ERROR', service, message, details, metadata });
  }

  async authError(service, message, details = '', metadata = {}) {
    return this.log({ level: 'ERROR', type: 'AUTH_ERROR', service, message, details, metadata });
  }

  async apiError(service, message, details = '', metadata = {}) {
    return this.log({ level: 'ERROR', type: 'API_ERROR', service, message, details, metadata });
  }

  /**
   * Retrieve system logs
   */
  async getSystemLogs(filters = {}, limit = 100) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: [] };
    }

    try {
      let query = this.db.collection('system_logs');

      if (filters.level) {
        query = query.where('level', '==', filters.level);
      }
      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }
      if (filters.service) {
        query = query.where('service', '==', filters.service);
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
      console.error('Error getting system logs:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}

export default new SystemLogsService();
