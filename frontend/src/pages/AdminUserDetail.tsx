import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, UserRound, Mail, Calendar, Clock, Activity, MessageSquare, FileText, Bookmark, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserActivity {
  id: string;
  event_name: string;
  feature: string;
  created_at: string;
  metadata: any;
}

export function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  async function fetchUserDetail() {
    setLoading(true);
    setError('');
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user detail');
      }

      const data = await response.json();
      setUserData(data);
      setActivity(data.activity || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user detail');
    } finally {
      setLoading(false);
    }
  }

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'LOGIN':
      case 'LOGOUT':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'AI_MESSAGE_SENT':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'SCHEME_SEARCH':
      case 'SCHEME_VIEWED':
      case 'SCHEME_ELIGIBILITY_CHECKED':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'SCHEME_SAVED':
        return <Bookmark className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-slate-500" />;
    }
  };

  const getEventLabel = (eventName: string) => {
    switch (eventName) {
      case 'LOGIN':
        return 'Logged in';
      case 'LOGOUT':
        return 'Logged out';
      case 'AI_MESSAGE_SENT':
        return 'Used AI Assistant';
      case 'SCHEME_SEARCH':
        return 'Searched schemes';
      case 'SCHEME_VIEWED':
        return 'Viewed scheme';
      case 'SCHEME_ELIGIBILITY_CHECKED':
        return 'Checked eligibility';
      case 'SCHEME_SAVED':
        return 'Saved scheme';
      case 'PROFILE_UPDATED':
        return 'Updated profile';
      default:
        return eventName.replace(/_/g, ' ').toLowerCase();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-saffron-500 border-t-transparent mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Users
      </button>

      {userData?.user && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start gap-6">
            {userData.user.photoURL ? (
              <img src={userData.user.photoURL} alt={userData.user.displayName} className="h-20 w-20 rounded-full" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400">
                <UserRound className="h-10 w-10" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">
                {userData.user.displayName || 'No Name'}
              </h1>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {userData.user.email}
                </div>
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  <span className="font-mono">{userData.user.uid}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Registered: {new Date(userData.user.creationTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Login: {userData.user.lastSignInTime ? new Date(userData.user.lastSignInTime).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">Activity Timeline</h2>
        <div className="space-y-4">
          {activity.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
              <Activity className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">No activity recorded</p>
            </div>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
                  {getEventIcon(item.event_name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-950 dark:text-white">
                      {getEventLabel(item.event_name)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.feature && <span className="font-medium">{item.feature}</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
