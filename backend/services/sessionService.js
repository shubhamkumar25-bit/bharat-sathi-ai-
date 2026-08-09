import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

/**
 * User Session Service
 * Handles user session tracking for login analytics
 */

class SessionService {
  constructor() {
    try {
      this.db = getFirebaseAdminDb();
      this.firebaseAvailable = true;
    } catch (error) {
      console.warn('Firebase Admin not available. Session service will be disabled.');
      this.db = null;
      this.firebaseAvailable = false;
    }
  }

  /**
   * Create a new user session
   */
  async createSession(userId, metadata = {}) {
    if (!this.firebaseAvailable || !this.db) {
      console.warn('Firebase not available. Skipping session creation.');
      return { success: false, error: 'Firebase not available' };
    }

    try {
      const session = {
        user_id: userId,
        login_at: new Date().toISOString(),
        logout_at: null,
        last_activity_at: new Date().toISOString(),
        session_duration: null,
        metadata,
        created_at: new Date().toISOString(),
      };

      const docRef = await this.db.collection('user_sessions').add(session);
      return { success: true, sessionId: docRef.id };
    } catch (error) {
      console.error('Error creating session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update session on logout
   */
  async endSession(sessionId) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available' };
    }

    try {
      const sessionRef = this.db.collection('user_sessions').doc(sessionId);
      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return { success: false, error: 'Session not found' };
      }

      const sessionData = sessionDoc.data();
      const loginTime = new Date(sessionData.login_at);
      const logoutTime = new Date();
      const sessionDuration = Math.floor((logoutTime - loginTime) / 1000); // in seconds

      await sessionRef.update({
        logout_at: logoutTime.toISOString(),
        last_activity_at: logoutTime.toISOString(),
        session_duration: sessionDuration,
      });

      return { success: true };
    } catch (error) {
      console.error('Error ending session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update session activity
   */
  async updateActivity(sessionId) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available' };
    }

    try {
      await this.db.collection('user_sessions').doc(sessionId).update({
        last_activity_at: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating session activity:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get active sessions count
   */
  async getActiveSessionsCount() {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', count: 0 };
    }

    try {
      const snapshot = await this.db
        .collection('user_sessions')
        .where('logout_at', '==', null)
        .get();

      return { success: true, count: snapshot.size };
    } catch (error) {
      console.error('Error getting active sessions count:', error);
      return { success: false, error: error.message, count: 0 };
    }
  }

  /**
   * Get daily login statistics
   */
  async getDailyLoginStats(startDate, endDate) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: {} };
    }

    try {
      const snapshot = await this.db
        .collection('user_sessions')
        .where('login_at', '>=', startDate)
        .where('login_at', '<=', endDate)
        .get();

      const uniqueUsers = new Set();
      const loginsByDay = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.user_id) {
          uniqueUsers.add(data.user_id);
        }

        const day = new Date(data.login_at).toISOString().split('T')[0];
        loginsByDay[day] = (loginsByDay[day] || 0) + 1;
      });

      return {
        success: true,
        data: {
          uniqueLogins: uniqueUsers.size,
          totalLogins: snapshot.size,
          loginsByDay,
        },
      };
    } catch (error) {
      console.error('Error getting daily login stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId, limit = 20) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: [] };
    }

    try {
      const snapshot = await this.db
        .collection('user_sessions')
        .where('user_id', '==', userId)
        .orderBy('login_at', 'desc')
        .limit(limit)
        .get();

      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: sessions };
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SessionService();
