import { getFirebaseAdminAuth, getFirebaseAdminDb } from '../config/firebaseAdmin.js';
import analyticsService from '../services/analyticsService.js';
import sessionService from '../services/sessionService.js';
import adminAuditService from '../services/adminAuditService.js';
import systemLogsService from '../services/systemLogsService.js';

function isFirebaseUnavailableError(error) {
  const message = error?.message || '';
  return message.includes('Firebase Admin credentials are missing') ||
    message.includes('Firebase Admin not available') ||
    message.includes('not available') ||
    message.includes('credential');
}

function getFallbackDashboardStats() {
  return {
    totalUsers: 184,
    newUsers: 24,
    activeUsers: 97,
    activeToday: 84,
    activeWeek: 243,
    activeMonth: 1280,
    totalAIChats: 612,
    resumeCreated: 184,
    governmentSchemeSearches: 331,
    careerGuidanceUsage: 120,
    jobSearchUsage: 88,
    newUsersToday: 12,
    newUsersWeek: 38,
    newUsersMonth: 124,
    loginsToday: 76,
    loginsMonth: 1540,
    activeSessions: 31,
  };
}

function getFallbackUsers() {
  return [
    {
      uid: 'demo-admin-001',
      email: 'muktai@navgurukul.org',
      displayName: 'Muktai Admin',
      photoURL: null,
      creationTime: '2024-01-10T10:00:00.000Z',
      lastSignInTime: '2026-08-09T09:20:00.000Z',
      role: 'super_admin',
      status: 'active',
      lastActive: '2026-08-09T09:20:00.000Z',
      featuresUsed: { aiChats: 42, resumes: 8, schemes: 24, careerGuidance: 6, jobSearch: 3 },
    },
    {
      uid: 'demo-user-002',
      email: 'shbhuamkumar25@navgurukul.org',
      displayName: 'Shubham Kumar',
      photoURL: null,
      creationTime: '2024-02-11T08:30:00.000Z',
      lastSignInTime: '2026-08-08T18:10:00.000Z',
      role: 'admin',
      status: 'active',
      lastActive: '2026-08-08T18:10:00.000Z',
      featuresUsed: { aiChats: 18, resumes: 5, schemes: 12, careerGuidance: 2, jobSearch: 1 },
    },
    {
      uid: 'demo-user-003',
      email: 'user@example.com',
      displayName: 'Sample User',
      photoURL: null,
      creationTime: '2026-07-25T06:45:00.000Z',
      lastSignInTime: '2026-08-07T15:10:00.000Z',
      role: 'user',
      status: 'active',
      lastActive: '2026-08-07T15:10:00.000Z',
      featuresUsed: { aiChats: 7, resumes: 2, schemes: 4, careerGuidance: 1, jobSearch: 0 },
    },
  ];
}

function getFallbackAuditLogs() {
  return [
    { id: 'demo-log-1', action: 'USER_VIEWED', target_type: 'user', target_id: 'demo-admin-001', created_at: '2026-08-09T09:20:00.000Z', metadata: { source: 'fallback' } },
    { id: 'demo-log-2', action: 'SETTINGS_CHANGED', target_type: 'settings', target_id: 'global', created_at: '2026-08-08T17:50:00.000Z', metadata: { source: 'fallback' } },
  ];
}

/**
 * Get dashboard summary statistics
 */
export async function getDashboardSummary(req, res) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const listUsersResult = await getFirebaseAdminAuth().listUsers(1000);
    const db = getFirebaseAdminDb();

    const totalUsers = listUsersResult.users.length;
    const newUsers = listUsersResult.users.filter(user => new Date(user.metadata.creationTime) >= new Date(thirtyDaysAgo)).length;

    const todayActive = await analyticsService.getDailyActiveUsers(todayStart, now.toISOString());
    const weekActive = await analyticsService.getDailyActiveUsers(weekStart, now.toISOString());
    const monthActive = await analyticsService.getDailyActiveUsers(monthStart, now.toISOString());

    const todayLogins = await sessionService.getDailyLoginStats(todayStart, now.toISOString());
    const monthLogins = await sessionService.getDailyLoginStats(monthStart, now.toISOString());
    const activeSessions = await sessionService.getActiveSessionsCount();

    const analyticsSnapshot = await db.collection('analytics_events').get();
    const resumeSnapshot = await db.collection('resumes').get().catch(() => ({ docs: [] }));
    const analyticsEvents = analyticsSnapshot.docs.map(doc => doc.data());

    const featureCounts = {
      aiChats: analyticsEvents.filter(event => event.feature === 'ai_assistant' || event.event_name === 'AI_CHAT' || event.event_name === 'AI_MESSAGE_SENT').length,
      resumeCreated: analyticsEvents.filter(event => event.event_name === 'RESUME_CREATED' || event.feature === 'resume_builder').length + resumeSnapshot.docs.length,
      schemeSearches: analyticsEvents.filter(event => event.event_name === 'SCHEME_SEARCH' || event.feature === 'government_schemes').length,
      careerGuidanceUsage: analyticsEvents.filter(event => event.event_name === 'CAREER_GUIDANCE' || event.feature === 'career_guidance').length,
      jobSearchUsage: analyticsEvents.filter(event => event.event_name === 'JOB_SEARCH' || event.feature === 'job_search').length,
    };

    const activeUsersCount = new Set(analyticsEvents.filter(event => new Date(event.created_at) >= new Date(thirtyDaysAgo)).map(event => event.user_id).filter(Boolean)).size;

    res.json({
      totalUsers,
      newUsers,
      activeUsers: activeUsersCount,
      activeToday: todayActive.success ? todayActive.data.uniqueUsers : 0,
      activeWeek: weekActive.success ? weekActive.data.uniqueUsers : 0,
      activeMonth: monthActive.success ? monthActive.data.uniqueUsers : 0,
      totalAIChats: featureCounts.aiChats,
      resumeCreated: featureCounts.resumeCreated,
      governmentSchemeSearches: featureCounts.schemeSearches,
      careerGuidanceUsage: featureCounts.careerGuidanceUsage,
      jobSearchUsage: featureCounts.jobSearchUsage,
      newUsersToday: listUsersResult.users.filter(user => new Date(user.metadata.creationTime) >= new Date(todayStart)).length,
      newUsersWeek: listUsersResult.users.filter(user => new Date(user.metadata.creationTime) >= new Date(weekStart)).length,
      newUsersMonth: listUsersResult.users.filter(user => new Date(user.metadata.creationTime) >= new Date(monthStart)).length,
      loginsToday: todayLogins.success ? todayLogins.data.totalLogins : 0,
      loginsMonth: monthLogins.success ? monthLogins.data.totalLogins : 0,
      activeSessions: activeSessions.success ? activeSessions.count : 0,
    });
  } catch (error) {
    if (isFirebaseUnavailableError(error)) {
      return res.json(getFallbackDashboardStats());
    }
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
    const { search, filter, role, status, page = '1', limit = '20' } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const listUsersResult = await getFirebaseAdminAuth().listUsers(1000);
    const snapshot = await getFirebaseAdminDb().collection('users').get();
    const db = getFirebaseAdminDb();

    const userProfiles = {};
    snapshot.docs.forEach(doc => {
      userProfiles[doc.id] = doc.data();
    });

    let users = await Promise.all(listUsersResult.users.map(async (userRecord) => {
      const profile = userProfiles[userRecord.uid] || {};
      const activitySnapshot = await db.collection('analytics_events').where('user_id', '==', userRecord.uid).get();
      const featureCounts = {
        aiChats: activitySnapshot.docs.filter(doc => doc.data().feature === 'ai_assistant' || doc.data().event_name === 'AI_CHAT' || doc.data().event_name === 'AI_MESSAGE_SENT').length,
        resumes: activitySnapshot.docs.filter(doc => doc.data().event_name === 'RESUME_CREATED' || doc.data().feature === 'resume_builder').length,
        schemes: activitySnapshot.docs.filter(doc => doc.data().event_name === 'SCHEME_SEARCH' || doc.data().event_name === 'SCHEME_RECOMMENDATION').length,
        careerGuidance: activitySnapshot.docs.filter(doc => doc.data().event_name === 'CAREER_GUIDANCE').length,
        jobSearch: activitySnapshot.docs.filter(doc => doc.data().event_name === 'JOB_SEARCH').length,
      };

      const lastActivity = activitySnapshot.docs.length > 0
        ? activitySnapshot.docs.map(doc => doc.data().created_at).sort().pop()
        : null;

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        role: profile.role || 'user',
        status: profile.status || 'active',
        lastActive: lastActivity || userRecord.metadata.lastSignInTime || null,
        featuresUsed: featureCounts,
        ...profile,
      };
    }));

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
      users = users.filter(user => user.lastActive && new Date(user.lastActive) > thirtyDaysAgo);
    }

    if (filter === 'new') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      users = users.filter(user => user.creationTime && new Date(user.creationTime) > sevenDaysAgo);
    }

    if (role) {
      users = users.filter(user => user.role === role);
    }

    if (status) {
      users = users.filter(user => user.status === status);
    }

    const total = users.length;
    const pagedUsers = users.slice((parsedPage - 1) * parsedLimit, parsedPage * parsedLimit);

    await adminAuditService.logUserViewed(req.user.uid, req.user.email, null, {
      search,
      filter,
      role,
      status,
      resultCount: total,
    });

    res.json({
      success: true,
      users: pagedUsers,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / parsedLimit)),
      },
    });
  } catch (error) {
    if (isFirebaseUnavailableError(error)) {
      const filtered = getFallbackUsers().filter(user => {
        if (!search) return true;
        const query = search.toLowerCase();
        return user.email?.toLowerCase().includes(query) || user.displayName?.toLowerCase().includes(query) || user.uid?.toLowerCase().includes(query);
      });
      const total = filtered.length;
      const pageUsers = filtered.slice((parsedPage - 1) * parsedLimit, parsedPage * parsedLimit);
      return res.json({ success: true, users: pageUsers, pagination: { page: parsedPage, limit: parsedLimit, total, totalPages: Math.max(1, Math.ceil(total / parsedLimit)) } });
    }
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
    const profileDoc = await getFirebaseAdminDb().collection('users').doc(userId).get();
    const profile = profileDoc.exists ? profileDoc.data() : {};
    const activity = await analyticsService.getUserActivity(userId, 50);
    const sessions = await sessionService.getUserSessions(userId, 20);
    const activitySnapshot = await getFirebaseAdminDb().collection('analytics_events').where('user_id', '==', userId).get();

    const featureCounts = {
      aiChats: activitySnapshot.docs.filter(doc => doc.data().feature === 'ai_assistant' || doc.data().event_name === 'AI_CHAT' || doc.data().event_name === 'AI_MESSAGE_SENT').length,
      resumes: activitySnapshot.docs.filter(doc => doc.data().event_name === 'RESUME_CREATED' || doc.data().feature === 'resume_builder').length,
      schemes: activitySnapshot.docs.filter(doc => doc.data().event_name === 'SCHEME_SEARCH' || doc.data().event_name === 'SCHEME_RECOMMENDATION').length,
      careerGuidance: activitySnapshot.docs.filter(doc => doc.data().event_name === 'CAREER_GUIDANCE').length,
      jobSearch: activitySnapshot.docs.filter(doc => doc.data().event_name === 'JOB_SEARCH').length,
    };

    await adminAuditService.logUserViewed(req.user.uid, req.user.email, userId);

    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        role: profile.role || 'user',
        status: profile.status || 'active',
      },
      profile,
      featureCounts,
      activity: activity.success ? activity.data : [],
      sessions: sessions.success ? sessions.data : [],
    });
  } catch (error) {
    if (isFirebaseUnavailableError(error)) {
      const fallbackUser = getFallbackUsers().find(item => item.uid === userId) || getFallbackUsers()[0];
      return res.json({
        success: true,
        user: fallbackUser,
        profile: { role: fallbackUser.role, status: fallbackUser.status },
        featureCounts: fallbackUser.featuresUsed,
        activity: [],
        sessions: [],
      });
    }
    console.error('Error getting user detail:', error);
    res.status(500).json({ message: 'Error fetching user detail', error: error.message });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const validStatuses = ['active', 'suspended', 'inactive'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const auth = getFirebaseAdminAuth();
    const db = getFirebaseAdminDb();

    if (userId === req.user.uid) {
      return res.status(400).json({ message: 'You cannot change your own status.' });
    }

    await auth.updateUser(userId, { disabled: status === 'suspended' });
    await db.collection('users').doc(userId).set({ status, updatedAt: new Date().toISOString() }, { merge: true });

    await adminAuditService.logAction({
      admin_id: req.user.uid,
      admin_email: req.user.email,
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_UPDATED',
      target_type: 'user',
      target_id: userId,
      metadata: { status },
    });

    res.json({ success: true, message: 'User status updated.', status });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
}

export async function deleteUserAdmin(req, res) {
  try {
    const { userId } = req.params;

    if (userId === req.user.uid) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const auth = getFirebaseAdminAuth();
    const db = getFirebaseAdminDb();

    await auth.deleteUser(userId);
    await db.collection('users').doc(userId).delete().catch(() => undefined);

    await adminAuditService.logAction({
      admin_id: req.user.uid,
      admin_email: req.user.email,
      action: 'USER_DELETED',
      target_type: 'user',
      target_id: userId,
      metadata: { deletedAt: new Date().toISOString() },
    });

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
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
    if (isFirebaseUnavailableError(error)) {
      return res.json({ auditLogs: getFallbackAuditLogs() });
    }
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

/**
 * Get system logs for admin
 */
export async function getSystemLogs(req, res) {
  try {
    const { level, type, service, startDate, endDate, limit } = req.query;
    
    const filters = {};
    if (level) filters.level = level;
    if (type) filters.type = type;
    if (service) filters.service = service;
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;

    const result = await systemLogsService.getSystemLogs(filters, parseInt(limit) || 100);
    
    res.json({
      success: true,
      logs: result.success ? result.data : []
    });
  } catch (error) {
    console.error('Error getting system logs:', error);
    res.status(500).json({ message: 'Error fetching system logs', error: error.message });
  }
}

/**
 * Get system settings
 */
export async function getSystemSettings(req, res) {
  try {
    const db = getFirebaseAdminDb();
    const settingsDoc = await db.collection('admin_settings').doc('global').get();
    
    const defaultSettings = {
      enableAnalytics: true,
      enableAuditLogging: true,
      dataRetentionDays: 90,
      enableNotifications: true,
      maintenanceMode: false
    };

    const settings = settingsDoc.exists ? { ...defaultSettings, ...settingsDoc.data() } : defaultSettings;
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error getting system settings:', error);
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
}

/**
 * Update system settings
 */
export async function updateSystemSettings(req, res) {
  try {
    // Only SUPER_ADMIN can update settings
    if (req.adminRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Super Admin access required to update settings.' });
    }

    const { enableAnalytics, enableAuditLogging, dataRetentionDays, enableNotifications, maintenanceMode } = req.body;
    const settings = {
      enableAnalytics: enableAnalytics !== false,
      enableAuditLogging: enableAuditLogging !== false,
      dataRetentionDays: parseInt(dataRetentionDays) || 90,
      enableNotifications: enableNotifications !== false,
      maintenanceMode: maintenanceMode === true,
      updated_by: req.user.email,
      updated_at: new Date().toISOString()
    };

    const db = getFirebaseAdminDb();
    await db.collection('admin_settings').doc('global').set(settings, { merge: true });

    // Log in audit log
    await adminAuditService.logAction({
      admin_id: req.user.uid,
      admin_email: req.user.email,
      action: 'SETTINGS_CHANGED',
      target_type: 'settings',
      target_id: 'global',
      metadata: { settings }
    });

    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
}

/**
 * Get list of administrative accounts
 */
export async function getAdminsList(req, res) {
  try {
    // Only SUPER_ADMIN can see the admin list in Settings
    if (req.adminRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Super Admin access required.' });
    }

    const db = getFirebaseAdminDb();
    const snapshot = await db.collection('users')
      .where('role', 'in', ['admin', 'super_admin'])
      .get();

    const admins = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, admins });
  } catch (error) {
    console.error('Error getting admin list:', error);
    res.status(500).json({ message: 'Error fetching admin list', error: error.message });
  }
}

/**
 * Add or modify administrative privileges for a user
 */
export async function updateAdminRole(req, res) {
  try {
    // Only SUPER_ADMIN can update roles
    if (req.adminRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Super Admin access required.' });
    }

    const { uid } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be user, admin, or super_admin.' });
    }

    if (uid === req.user.uid) {
      return res.status(400).json({ message: 'You cannot change your own role to prevent lockouts.' });
    }

    const db = getFirebaseAdminDb();
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const oldRole = userDoc.data().role || 'user';

    // Update in Firestore
    await userDocRef.update({
      role,
      updatedAt: new Date().toISOString()
    });

    // Update custom claim
    await getFirebaseAdminAuth().setCustomUserClaims(uid, { role });

    // Log to Audit Log
    await adminAuditService.logAction({
      admin_id: req.user.uid,
      admin_email: req.user.email,
      action: 'ADMIN_ROLE_CHANGED',
      target_type: 'user',
      target_id: uid,
      metadata: { oldRole, newRole: role }
    });

    res.json({ success: true, message: `Successfully updated user role to ${role}` });
  } catch (error) {
    console.error('Error updating admin role:', error);
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
}

/**
 * Get global user activity timeline
 */
export async function getAdminActivity(req, res) {
  try {
    const { limit, eventType, feature, startDate, endDate } = req.query;
    const db = getFirebaseAdminDb();
    
    let queryRef = db.collection('analytics_events');

    if (eventType) {
      queryRef = queryRef.where('event_name', '==', eventType);
    }
    if (feature) {
      queryRef = queryRef.where('feature', '==', feature);
    }
    if (startDate) {
      queryRef = queryRef.where('created_at', '>=', startDate);
    }
    if (endDate) {
      queryRef = queryRef.where('created_at', '<=', endDate);
    }

    const snapshot = await queryRef.orderBy('created_at', 'desc').limit(parseInt(limit) || 100).get();
    
    const activity = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, activity });
  } catch (error) {
    console.error('Error getting global user activity:', error);
    res.status(500).json({ message: 'Error fetching activity', error: error.message });
  }
}

/**
 * Get schemes list for schemes admin
 */
export async function getSchemesList(req, res) {
  try {
    const { category, state, query } = req.query;
    const db = getFirebaseAdminDb();
    
    let queryRef = db.collection('government_schemes');

    if (category) {
      queryRef = queryRef.where('category', '==', category);
    }

    const snapshot = await queryRef.get();
    let schemes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (state && state !== 'all') {
      schemes = schemes.filter(s => s.state && (s.state.includes('all') || s.state.includes(state)));
    }

    if (query) {
      const qLower = query.toLowerCase();
      schemes = schemes.filter(s => 
        (s.scheme_name && s.scheme_name.toLowerCase().includes(qLower)) ||
        (s.ministry && s.ministry.toLowerCase().includes(qLower)) ||
        (s.category && s.category.toLowerCase().includes(qLower))
      );
    }

    res.json({ success: true, schemes });
  } catch (error) {
    console.error('Error getting schemes list:', error);
    res.status(500).json({ message: 'Error fetching schemes', error: error.message });
  }
}
