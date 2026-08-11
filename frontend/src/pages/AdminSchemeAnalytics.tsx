import { useEffect, useState } from 'react';
import { Search, FileText, Users, Bookmark, TrendingUp, BarChart3, CheckCircle, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DateFilter } from '@/components/DateFilter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface SchemeStats {
  totalSearches: number;
  eligibilityChecks: number;
  schemesViewed: number;
  schemesSaved: number;
  applicationsClicked: number;
  uniqueUsers: number;
  mostViewedSchemes: Record<string, number>;
  mostSearchedCategories: Record<string, number>;
}

export function AdminSchemeAnalytics() {
  const { user } = useAuth();
  const [schemeStats, setSchemeStats] = useState<SchemeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchemeAnalytics();
  }, []);

  async function fetchSchemeAnalytics() {
    setLoading(true);
    setError('');
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/government-schemes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scheme analytics');
      }

      const data = await response.json();
      setSchemeStats(data.schemeStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scheme analytics');
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
      const response = await fetch(`${API_BASE_URL}/api/admin/export?type=government-schemes`, {
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
      a.download = `government-schemes-analytics-${new Date().toISOString().split('T')[0]}.csv`;
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
          <p className="text-slate-600 dark:text-slate-400">Loading scheme analytics...</p>
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

  const StatCard = ({ title, value, icon: Icon }: any) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-3xl font-bold text-slate-950 dark:text-white mb-1">{value?.toLocaleString()}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{title}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Government Scheme Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">Track Government Schemes usage and engagement</p>
        </div>
        <div className="flex items-center gap-4">
          <DateFilter onDateRangeChange={handleDateRangeChange} />
          <button
            onClick={fetchSchemeAnalytics}
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
          title="Total Searches"
          value={schemeStats?.totalSearches}
          icon={Search}
        />
        <StatCard
          title="Eligibility Checks"
          value={schemeStats?.eligibilityChecks}
          icon={CheckCircle}
        />
        <StatCard
          title="Schemes Viewed"
          value={schemeStats?.schemesViewed}
          icon={FileText}
        />
        <StatCard
          title="Schemes Saved"
          value={schemeStats?.schemesSaved}
          icon={Bookmark}
        />
        <StatCard
          title="Applications Clicked"
          value={schemeStats?.applicationsClicked}
          icon={TrendingUp}
        />
        <StatCard
          title="Unique Users"
          value={schemeStats?.uniqueUsers}
          icon={Users}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Most Viewed Schemes</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(schemeStats?.mostViewedSchemes || {}).slice(0, 5).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{name}</span>
                <span className="text-sm font-semibold text-slate-950 dark:text-white">{count}</span>
              </div>
            ))}
            {Object.keys(schemeStats?.mostViewedSchemes || {}).length === 0 && (
              <p className="text-sm text-slate-500">No data available</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Most Searched Categories</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(schemeStats?.mostSearchedCategories || {}).slice(0, 5).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">{category}</span>
                <span className="text-sm font-semibold text-slate-950 dark:text-white">{count}</span>
              </div>
            ))}
            {Object.keys(schemeStats?.mostSearchedCategories || {}).length === 0 && (
              <p className="text-sm text-slate-500">No data available</p>
            )}
          </div>
        </div>
      </div>

      {!schemeStats && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
          <FileText className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400">No scheme usage data available</p>
        </div>
      )}
    </div>
  );
}
