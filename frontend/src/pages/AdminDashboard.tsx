import { useEffect, useState } from 'react';
import { Shield, Users, Activity, TrendingUp, Calendar, BarChart3, ArrowUpRight, ArrowDownRight, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DateFilter } from '@/components/DateFilter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  activeWeek: number;
  activeMonth: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  loginsToday: number;
  loginsMonth: number;
  activeSessions: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    setLoading(true);
    setError('');
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    // TODO: Implement date range filtering
    console.log('Date range:', startDate, endDate);
  };

  const handleExport = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/export?type=dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to export data');
    }
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <Shield className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Error</h2>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, changeType }: any) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
          <Icon className="h-6 w-6" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {changeType === 'positive' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-950 dark:text-white mb-1">{value?.toLocaleString()}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{title}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Platform overview and analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <DateFilter onDateRangeChange={handleDateRangeChange} />
          <button
            onClick={fetchDashboardStats}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-2xl bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Last Updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={Users}
        />
        <StatCard
          title="Active Today"
          value={stats?.activeToday}
          icon={Activity}
          change="+12.4%"
          changeType="positive"
        />
        <StatCard
          title="New Users Today"
          value={stats?.newUsersToday}
          icon={TrendingUp}
          change="+8.2%"
          changeType="positive"
        />
        <StatCard
          title="Logins Today"
          value={stats?.loginsToday}
          icon={Calendar}
          change="+15.1%"
          changeType="positive"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active This Week"
          value={stats?.activeWeek}
          icon={Users}
        />
        <StatCard
          title="Active This Month"
          value={stats?.activeMonth}
          icon={Activity}
        />
        <StatCard
          title="Active Sessions"
          value={stats?.activeSessions}
          icon={BarChart3}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          title="New Users This Week"
          value={stats?.newUsersWeek}
          icon={TrendingUp}
        />
        <StatCard
          title="New Users This Month"
          value={stats?.newUsersMonth}
          icon={TrendingUp}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">Logins This Month</h2>
        <div className="text-4xl font-bold text-saffron-600 dark:text-saffron-400 mb-2">
          {stats?.loginsMonth?.toLocaleString()}
        </div>
        <p className="text-slate-600 dark:text-slate-400">Total login events this month</p>
      </div>
    </div>
  );
}
