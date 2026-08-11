import { Shield, Users, Activity, TrendingUp, Calendar, BarChart3, UserRound, Clock, RefreshCw } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';

export function AdminDashboard() {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-saffron-500 border-t-transparent mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-950 dark:text-white mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{title}</div>
    </div>
  );

  function fmt(ts: { toDate: () => Date } | null) {
    if (!ts) return '—';
    return ts.toDate().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Live data from Firebase — updates automatically
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-green-600 dark:border-slate-800 dark:bg-slate-950 dark:text-green-400">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Real-time
        </div>
      </div>

      {/* Primary stats — 4 cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users"      value={stats.totalUsers}    icon={Users}     />
        <StatCard title="Active Today"     value={stats.activeToday}   icon={Activity}  />
        <StatCard title="New Users Today"  value={stats.newUsersToday} icon={TrendingUp} />
        <StatCard title="Logins Today"     value={stats.loginsToday}   icon={Calendar}  />
      </div>

      {/* Recent Users */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">Recent Registrations</h2>
            <p className="text-xs text-slate-500">Latest users who signed up — sorted by newest first</p>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {stats.totalUsers} total
          </span>
        </div>

        {stats.recentUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500">No users yet. Real users will appear here after sign-up.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentUsers.map((u) => (
              <div key={u.uid} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {u.name || 'No Name'}
                  </div>
                  <div className="truncate text-xs text-slate-500">{u.email}</div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {u.role}
                </span>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-slate-500">{fmt(u.createdAt)}</div>
                  <div className="text-[10px] text-slate-400">Registered</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Login Activity */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">Recent Login Activity</h2>
            <p className="text-xs text-slate-500">Latest successful logins — sorted by newest first</p>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {stats.loginsToday} today
          </span>
        </div>

        {stats.recentLogins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500">No login events yet. Real logins will appear here automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentLogins.map((l, i) => (
              <div key={`${l.uid}-${i}`} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {l.name || 'Unknown User'}
                  </div>
                  <div className="truncate text-xs text-slate-500">{l.email}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-slate-500">{fmt(l.timestamp)}</div>
                  <div className="text-[10px] text-slate-400">Login</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
