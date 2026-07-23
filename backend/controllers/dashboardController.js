import { listBookmarks, listConversations, listRecentActivity, listResumes, readProfile } from '../services/firestoreService.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const [profile, conversations, resumes, bookmarks, activity] = await Promise.all([
      readProfile(req.user.uid),
      listConversations(req.user.uid, 5),
      listResumes(req.user.uid, 5),
      listBookmarks(req.user.uid),
      listRecentActivity(req.user.uid, 10),
    ]);

    res.json({
      profile: profile || null,
      conversations,
      resumes,
      bookmarks,
      activity,
    });
  } catch (error) {
    next(error);
  }
}