import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Activity, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DateFilter } from '@/components/DateFilter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface FeatureStats {
  feature: string;
  uniqueUsers: number;
  totalUses: number;
}

export function AdminFeatureAnalytics() {
  const { user } = useAuth();
  const [featureUsage, setFeatureUsage] = useState<FeatureStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'users' | 'uses'>('users');

  useEffect(() => {
    fetchFeatureAnalytics();
  }, []);

  async function fetchFeatureAnalytics() {
    setLoading(true);
    setError('');
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/feature-usage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feature analytics');
      }

      const data = await response.json();
      setFeatureUsage(data.featureUsage || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature analytics');
    } finally {
      setLoading(false);
    }
  }

  const sortedFeatures = [...featureUsage].sort((a, b) => {
    if (sortBy === 'users') return b.uniqueUsers - a.uniqueUsers;
    return b.totalUses - a.totalUses;
  });

  const getFeatureLabel = (feature: string) => {
    const labels: Record<string, string> = {
      'ai_assistant': 'AI Assistant',
      'government_schemes': 'Government Schemes',
      'application_tracker': 'Application Tracker',
      'user_profile': 'User Profile',
      'auth': 'Authentication',
    };
    return labels[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log('Date range:', startDate, endDate);
  };

  const handleExport = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/export?type=feature-usage`, {
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
      a.download = `feature-usage-${new Date().toISOString().split('T')[0]}.csv`;
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
          <p className="text-slate-600 dark:text-slate-400">Loading feature analytics...</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Feature Usage Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">Track how users interact with platform features</p>
        </div>
        <div className="flex items-center gap-4">
          <DateFilter onDateRangeChange={handleDateRangeChange} />
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('users')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                sortBy === 'users'
                  ? 'bg-saffron-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Sort by Users
            </button>
            <button
              onClick={() => setSortBy('uses')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                sortBy === 'uses'
                  ? 'bg-saffron-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Sort by Usage
            </button>
          </div>
          <button
            onClick={fetchFeatureAnalytics}
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
        {sortedFeatures.map((feature) => (
          <div key={feature.feature} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-4">
              {getFeatureLabel(feature.feature)}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Unique Users</span>
                </div>
                <span className="font-semibold text-slate-950 dark:text-white">
                  {feature.uniqueUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Total Uses</span>
                </div>
                <span className="font-semibold text-slate-950 dark:text-white">
                  {feature.totalUses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedFeatures.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400">No feature usage data available</p>
        </div>
      )}
    </div>
  );
}
