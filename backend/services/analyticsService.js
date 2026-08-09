import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

/**
 * Centralized Analytics Service
 * Handles all analytics event tracking and querying
 */

class AnalyticsService {
  constructor() {
    try {
      this.db = getFirebaseAdminDb();
      this.firebaseAvailable = true;
    } catch (error) {
      console.warn('Firebase Admin not available. Analytics service will be disabled.');
      this.db = null;
      this.firebaseAvailable = false;
    }
  }

  /**
   * Track an analytics event
   * @param {Object} eventData - Event data
   */
  async trackEvent(eventData) {
    if (!this.firebaseAvailable || !this.db) {
      console.warn('Firebase not available. Skipping event tracking.');
      return { success: false, error: 'Firebase not available' };
    }

    try {
      const event = {
        user_id: eventData.user_id,
        event_name: eventData.event_name,
        feature: eventData.feature || null,
        metadata: eventData.metadata || {},
        created_at: new Date().toISOString(),
      };

      await this.db.collection('analytics_events').add(event);
      return { success: true };
    } catch (error) {
      console.error('Error tracking event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track user login
   */
  async trackLogin(userId, metadata = {}) {
    return this.trackEvent({
      user_id: userId,
      event_name: 'LOGIN',
      feature: 'auth',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track user logout
   */
  async trackLogout(userId, metadata = {}) {
    return this.trackEvent({
      user_id: userId,
      event_name: 'LOGOUT',
      feature: 'auth',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track AI Assistant usage
   */
  async trackAIUsage(userId, metadata = {}) {
    return this.trackEvent({
      user_id: userId,
      event_name: 'AI_MESSAGE_SENT',
      feature: 'ai_assistant',
      metadata,
    });
  }

  /**
   * Track Government Scheme search
   */
  async trackSchemeSearch(userId, metadata = {}) {
    return this.trackEvent({
      user_id: userId,
      event_name: 'SCHEME_SEARCH',
      feature: 'government_schemes',
      metadata,
    });
  }

  /**
   * Track scheme eligibility check
   */
  async trackEligibilityCheck(userId, metadata = {}) {
    return this.trackEvent({
      user_id: userId,
      event_name: 'SCHEME_ELIGIBILITY_CHECKED',
      feature: 'government_schemes',
      metadata,
    });
  }

  /**
   * Track scheme viewed
   */
  async trackSchemeViewed(userId, metadata = {}) {
    return this.trackEvent({
      user_id: userId,
      event_name: 'SCHEME_VIEWED',
      feature: 'government_schemes',
      metadata,
    });
  }

  /**
   * Track scheme saved
   */
  async trackSchemeSaved(userId, metadata = {}) {
    return this.trackEvent({
      user_id: userId,
      event_name: 'SCHEME_SAVED',
      feature: 'government_schemes',
      metadata,
    });
  }

  /**
   * Track application started
   */
  async trackApplicationStarted(userId, metadata = {}) {
    return this.trackEvent({
      user_id: userId,
      event_name: 'APPLICATION_STARTED',
      feature: 'application_tracker',
      metadata,
    });
  }

  /**
   * Track profile updated
   */
  async trackProfileUpdated(userId, metadata = {}) {
    return this.trackEvent({
      user_id: userId,
      event_name: 'PROFILE_UPDATED',
      feature: 'user_profile',
      metadata,
    });
  }

  /**
   * Get daily active users for a date range
   */
  async getDailyActiveUsers(startDate, endDate) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: [] };
    }

    try {
      const snapshot = await this.db
        .collection('analytics_events')
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .get();

      const uniqueUsers = new Set();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.user_id) {
          uniqueUsers.add(data.user_id);
        }
      });

      return {
        success: true,
        data: {
          uniqueUsers: uniqueUsers.size,
          totalEvents: snapshot.size,
        },
      };
    } catch (error) {
      console.error('Error getting daily active users:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get feature usage statistics
   */
  async getFeatureUsageStats(startDate, endDate) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: [] };
    }

    try {
      const snapshot = await this.db
        .collection('analytics_events')
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .get();

      const featureStats = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const feature = data.feature || 'unknown';
        const userId = data.user_id;

        if (!featureStats[feature]) {
          featureStats[feature] = {
            feature,
            uniqueUsers: new Set(),
            totalUses: 0,
          };
        }

        if (userId) {
          featureStats[feature].uniqueUsers.add(userId);
        }
        featureStats[feature].totalUses++;
      });

      const result = Object.values(featureStats).map(stat => ({
        feature: stat.feature,
        uniqueUsers: stat.uniqueUsers.size,
        totalUses: stat.totalUses,
      }));

      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting feature usage stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserActivity(userId, limit = 50) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: [] };
    }

    try {
      const snapshot = await this.db
        .collection('analytics_events')
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get();

      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: activities };
    } catch (error) {
      console.error('Error getting user activity:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get login statistics
   */
  async getLoginStats(startDate, endDate) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: {} };
    }

    try {
      const snapshot = await this.db
        .collection('analytics_events')
        .where('event_name', '==', 'LOGIN')
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .get();

      const uniqueUsers = new Set();
      const loginsByHour = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.user_id) {
          uniqueUsers.add(data.user_id);
        }

        const hour = new Date(data.created_at).getHours();
        loginsByHour[hour] = (loginsByHour[hour] || 0) + 1;
      });

      return {
        success: true,
        data: {
          uniqueLogins: uniqueUsers.size,
          totalLogins: snapshot.size,
          loginsByHour,
        },
      };
    } catch (error) {
      console.error('Error getting login stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get government scheme analytics
   */
  async getSchemeAnalytics(startDate, endDate) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: {} };
    }

    try {
      const snapshot = await this.db
        .collection('analytics_events')
        .where('feature', '==', 'government_schemes')
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .get();

      const stats = {
        totalSearches: 0,
        eligibilityChecks: 0,
        schemesViewed: 0,
        schemesSaved: 0,
        applicationsClicked: 0,
        uniqueUsers: new Set(),
        mostViewedSchemes: {},
        mostSearchedCategories: {},
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.user_id) {
          stats.uniqueUsers.add(data.user_id);
        }

        switch (data.event_name) {
          case 'SCHEME_SEARCH':
            stats.totalSearches++;
            if (data.metadata?.category) {
              stats.mostSearchedCategories[data.metadata.category] = 
                (stats.mostSearchedCategories[data.metadata.category] || 0) + 1;
            }
            break;
          case 'SCHEME_ELIGIBILITY_CHECKED':
            stats.eligibilityChecks++;
            break;
          case 'SCHEME_VIEWED':
            stats.schemesViewed++;
            if (data.metadata?.scheme_name) {
              stats.mostViewedSchemes[data.metadata.scheme_name] = 
                (stats.mostViewedSchemes[data.metadata.scheme_name] || 0) + 1;
            }
            break;
          case 'SCHEME_SAVED':
            stats.schemesSaved++;
            break;
          case 'APPLICATION_STARTED':
            stats.applicationsClicked++;
            break;
        }
      });

      return {
        success: true,
        data: {
          ...stats,
          uniqueUsers: stats.uniqueUsers.size,
        },
      };
    } catch (error) {
      console.error('Error getting scheme analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get AI assistant analytics
   */
  async getAIAnalytics(startDate, endDate) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available', data: {} };
    }

    try {
      const snapshot = await this.db
        .collection('analytics_events')
        .where('feature', '==', 'ai_assistant')
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .get();

      const uniqueUsers = new Set();
      const totalMessages = snapshot.size;

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.user_id) {
          uniqueUsers.add(data.user_id);
        }
      });

      return {
        success: true,
        data: {
          uniqueUsers: uniqueUsers.size,
          totalMessages,
          averageMessagesPerUser: uniqueUsers.size > 0 ? totalMessages / uniqueUsers.size : 0,
        },
      };
    } catch (error) {
      console.error('Error getting AI analytics:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new AnalyticsService();
