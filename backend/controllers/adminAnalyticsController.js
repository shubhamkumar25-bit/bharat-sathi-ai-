import { getFirebaseAdminAuth, getFirebaseAdminDb } from '../config/firebaseAdmin.js';
import analyticsService from '../services/analyticsService.js';
import sessionService from '../services/sessionService.js';
import adminAuditService from '../services/adminAuditService.js';

/**
 * Get dashboard summary statistics
 */
export async function getDashboardSummary(req, res) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Get total users
    const listUsersResult = await getFirebaseAdminAuth().listUsers(1000);
    const totalUsers = listUsersResult.users.length;

    // Get daily active users
    const todayActive = await analyticsService.getDailyActiveUsers(todayStart, now.toISOString());
    const weekActive = await analyticsService.getDailyActiveUsers(weekStart, now.toISOString());
    const monthActive = await analyticsService.getDailyActiveUsers(monthStart, now.toISOString());

    // Get login stats
    const todayLogins = await sessionService.getDailyLoginStats(todayStart, now.toISOString());
    const monthLogins = await sessionService.getDailyLoginStats(monthStart, now.toISOString());

    // Get new users (simplified - using creation time)
    const newUsersToday = listUsersResult.users.filter(
      user => new Date(user.metadata.creationTime) >= new Date(todayStart)
    ).length;
    const newUsersWeek = listUsersResult.users.filter(
      user => new Date(user.metadata.creationTime) >= new Date(weekStart)
    ).length;
    const newUsersMonth = listUsersResult.users.filter(
      user => new Date(user.metadata.creationTime) >= new Date(monthStart)
    ).length;

    // Get active sessions
    const activeSessions = await sessionService.getActiveSessionsCount();

    res.json({
      totalUsers,
      activeToday: todayActive.success ? todayActive.data.uniqueUsers : 0,
      activeWeek: weekActive.success ? weekActive.data.uniqueUsers : 0,
      activeMonth: monthActive.success ? monthActive.data.uniqueUsers : 0,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      loginsToday: todayLogins.success ? todayLogins.data.totalLogins : 0,
      loginsMonth: monthLogins.success ? monthLogins.data.totalLogins : 0,
      activeSessions: activeSessions.success ? activeSessions.count : 0,
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ message: 'Error fetching dashboard summary', error: error.message });
  }
}

/**
 * Get user analytics
 */
export async function getUserAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const dailyActive = await analyticsService.getDailyActiveUsers(start, end);
    const loginStats = await sessionService.getDailyLoginStats(start, end);

    res.json({
      dailyActiveUsers: dailyActive.success ? dailyActive.data : {},
      loginStats: loginStats.success ? loginStats.data : {},
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Error fetching user analytics', error: error.message });
  }
}

/**
 * Get feature usage analytics
 */
export async function getFeatureUsageAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const featureStats = await analyticsService.getFeatureUsageStats(start, end);

    res.json({
      featureUsage: featureStats.success ? featureStats.data : [],
    });
  } catch (error) {
    console.error('Error getting feature usage analytics:', error);
    res.status(500).json({ message: 'Error fetching feature usage analytics', error: error.message });
  }
}

/**
 * Get AI assistant analytics
 */
export async function getAIAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const aiStats = await analyticsService.getAIAnalytics(start, end);

    res.json({
      aiStats: aiStats.success ? aiStats.data : {},
    });
  } catch (error) {
    console.error('Error getting AI analytics:', error);
    res.status(500).json({ message: 'Error fetching AI analytics', error: error.message });
  }
}

/**
 * Get government scheme analytics
 */
export async function getSchemeAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const schemeStats = await analyticsService.getSchemeAnalytics(start, end);

    res.json({
      schemeStats: schemeStats.success ? schemeStats.data : {},
    });
  } catch (error) {
    console.error('Error getting scheme analytics:', error);
    res.status(500).json({ message: 'Error fetching scheme analytics', error: error.message });
  }
}

/**
 * Get retention analytics
 */
export async function getRetentionAnalytics(req, res) {
  try {
    const db = getFirebaseAdminDb();
    
    // Get users registered in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const usersSnapshot = await db
      .collection('users')
      .where('createdAt', '>=', thirtyDaysAgo.toISOString())
      .get();

    const retentionData = {};
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const createdAt = userDoc.data().createdAt;
      
      // Check if user was active on day 1, 7, 30
      const day1Date = new Date(new Date(createdAt).getTime() + 1 * 24 * 60 * 60 * 1000);
      const day7Date = new Date(new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000);
      const day30Date = new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);

      const activity = await analyticsService.getUserActivity(userId, 100);
      
      if (activity.success && activity.data.length > 0) {
        const hasActivityOnDate = (date) => {
          return activity.data.some(event => {
            const eventDate = new Date(event.created_at);
            return eventDate.toDateString() === date.toDateString();
          });
        };

        retentionData[userId] = {
          day1Retention: hasActivityOnDate(day1Date),
          day7Retention: hasActivityOnDate(day7Date),
          day30Retention: hasActivityOnDate(day30Date),
        };
      }
    }

    // Calculate retention rates
    const totalUsers = usersSnapshot.size;
    const day1Retention = Object.values(retentionData).filter(r => r.day1Retention).length;
    const day7Retention = Object.values(retentionData).filter(r => r.day7Retention).length;
    const day30Retention = Object.values(retentionData).filter(r => r.day30Retention).length;

    res.json({
      totalUsers,
      day1RetentionRate: totalUsers > 0 ? (day1Retention / totalUsers) * 100 : 0,
      day7RetentionRate: totalUsers > 0 ? (day7Retention / totalUsers) * 100 : 0,
      day30RetentionRate: totalUsers > 0 ? (day30Retention / totalUsers) * 100 : 0,
      retentionData,
    });
  } catch (error) {
    console.error('Error getting retention analytics:', error);
    res.status(500).json({ message: 'Error fetching retention analytics', error: error.message });
  }
}

/**
 * Get all users for admin
 */
export async function getAllUsersAdmin(req, res) {
  try {
    const { search, filter } = req.query;
    
    const listUsersResult = await getFirebaseAdminAuth().listUsers(1000);
    const snapshot = await getFirebaseAdminDb().collection('users').get();
    
    const userProfiles = {};
    snapshot.docs.forEach(doc => {
      userProfiles[doc.id] = doc.data();
    });

    let users = listUsersResult.users.map((userRecord) => {
      const profile = userProfiles[userRecord.uid] || {};
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        ...profile,
      };
    });

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.email?.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.uid?.toLowerCase().includes(searchLower)
      );
    }

    if (filter === 'active') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      users = users.filter(user => 
        user.lastSignInTime && new Date(user.lastSignInTime) > thirtyDaysAgo
      );
    }

    if (filter === 'new') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      users = users.filter(user => 
        user.creationTime && new Date(user.creationTime) > sevenDaysAgo
      );
    }

    // Log this action
    await adminAuditService.logUserViewed(req.user.uid, req.user.email, null, {
      search,
      filter,
      resultCount: users.length,
    });

    res.json({ users });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}

/**
 * Get user detail with activity timeline
 */
export async function getUserDetail(req, res) {
  try {
    const { userId } = req.params;
    
    const user = await getFirebaseAdminAuth().getUser(userId);
    const profile = await getFirebaseAdminDb().collection('users').doc(userId).get();
    const activity = await analyticsService.getUserActivity(userId, 50);
    const sessions = await sessionService.getUserSessions(userId, 20);

    // Log this action
    await adminAuditService.logUserViewed(req.user.uid, req.user.email, userId);

    res.json({
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
      profile: profile.exists ? profile.data() : null,
      activity: activity.success ? activity.data : [],
      sessions: sessions.success ? sessions.data : [],
    });
  } catch (error) {
    console.error('Error getting user detail:', error);
    res.status(500).json({ message: 'Error fetching user detail', error: error.message });
  }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(req, res) {
  try {
    const { action, targetType, startDate, endDate, limit } = req.query;
    
    const filters = {};
    if (action) filters.action = action;
    if (targetType) filters.target_type = targetType;
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;

    const logs = await adminAuditService.getAuditLogs(filters, parseInt(limit) || 100);

    res.json({
      auditLogs: logs.success ? logs.data : [],
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
}

/**
 * Export analytics as CSV
 */
export async function exportAnalytics(req, res) {
  try {
    const { type, startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    let data = [];
    let filename = 'analytics.csv';

    switch (type) {
      case 'users':
        const usersResult = await getAllUsersAdmin(req, res);
        data = usersResult.users;
        filename = 'users.csv';
        break;
      case 'feature_usage':
        const featureStats = await analyticsService.getFeatureUsageStats(start, end);
        data = featureStats.success ? featureStats.data : [];
        filename = 'feature_usage.csv';
        break;
      case 'schemes':
        const schemeStats = await analyticsService.getSchemeAnalytics(start, end);
        data = schemeStats.success ? [schemeStats.data] : [];
        filename = 'scheme_analytics.csv';
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    // Convert to CSV
    const csv = convertToCSV(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ message: 'Error exporting analytics', error: error.message });
  }
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      const escaped = ('' + (value || '')).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}
