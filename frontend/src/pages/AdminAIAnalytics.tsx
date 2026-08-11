import { useEffect, useState } from 'react';
import { MessageSquare, Users, Activity, TrendingUp, BarChart3, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DateFilter } from '@/components/DateFilter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface AIStats {
  uniqueUsers: number;
  totalMessages: number;
  averageMessagesPerUser: number;
}

export function AdminAIAnalytics() {
  const { user } = useAuth();
  const [aiStats, setAIStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAIAnalytics();
  }, []);

  async function fetchAIAnalytics() {
    setLoading(true);
    setError('');
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/ai`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI analytics');
      }

      const data = await response.json();
      setAIStats(data.aiStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI analytics');
    } finally {
      setLoading(false);
    }
  }

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log('Date range:', startDate, endDate);
  };

  const handleExport = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/export?type=ai`, {
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
      a.download = `ai-analytics-${new Date().toISOString().split('T')[0]}.csv`;
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
          <p className="text-slate-600 dark:text-slate-400">Loading AI analytics...</p>
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

  const StatCard = ({ title, value, icon: Icon, subtitle }: any) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-3xl font-bold text-slate-950 dark:text-white mb-1">{value?.toLocaleString()}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{title}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">AI Assistant Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">Track AI Assistant usage and engagement</p>
        </div>
        <div className="flex items-center gap-4">
          <DateFilter onDateRangeChange={handleDateRangeChange} />
          <button
            onClick={fetchAIAnalytics}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="AI Users"
          value={aiStats?.uniqueUsers}
          icon={Users}
          subtitle="Unique users this period"
        />
        <StatCard
          title="Total Messages"
          value={aiStats?.totalMessages}
          icon={MessageSquare}
          subtitle="All messages sent"
        />
        <StatCard
          title="Avg Messages/User"
          value={aiStats?.averageMessagesPerUser?.toFixed(1)}
          icon={Activity}
          subtitle="Per user average"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">AI Engagement Summary</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Overview of AI Assistant usage</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <div className="text-2xl font-bold text-saffron-600 dark:text-saffron-400 mb-1">
              {aiStats?.uniqueUsers?.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Unique Users</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <div className="text-2xl font-bold text-saffron-600 dark:text-saffron-400 mb-1">
              {aiStats?.totalMessages?.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Messages</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <div className="text-2xl font-bold text-saffron-600 dark:text-saffron-400 mb-1">
              {aiStats?.averageMessagesPerUser?.toFixed(1)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Avg Messages/User</div>
          </div>
        </div>
      </div>

      {!aiStats && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400">No AI usage data available</p>
        </div>
      )}
    </div>
  );
}
