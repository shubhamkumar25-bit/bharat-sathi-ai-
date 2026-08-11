import { useEffect, useState } from 'react';
import { TrendingUp, Users, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DateFilter } from '@/components/DateFilter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface RetentionData {
  totalUsers: number;
  day1RetentionRate: number;
  day7RetentionRate: number;
  day30RetentionRate: number;
  retentionData: Record<string, any>;
}

export function AdminRetentionAnalytics() {
  const { user } = useAuth();
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRetentionAnalytics();
  }, []);

  async function fetchRetentionAnalytics() {
    setLoading(true);
    setError('');
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/retention`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch retention analytics');
      }

      const data = await response.json();
      setRetentionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load retention analytics');
    } finally {
      setLoading(false);
    }
  }

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log('Date range:', startDate, endDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-saffron-500 border-t-transparent mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Loading retention analytics...</p>
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

  const RetentionCard = ({ title, rate, icon: Icon }: any) => {
    const rateColor = rate >= 50 ? 'text-green-600 dark:text-green-400' : rate >= 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
    const bgColor = rate >= 50 ? 'bg-green-100 dark:bg-green-900/30' : rate >= 30 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30';
    
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bgColor} ${rateColor} mb-4`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`text-3xl font-bold ${rateColor} mb-1`}>{rate.toFixed(1)}%</div>
        <div className="text-sm text-slate-600 dark:text-slate-400">{title}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Retention Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">Track user retention and engagement over time</p>
        </div>
        <div className="flex items-center gap-4">
          <DateFilter onDateRangeChange={handleDateRangeChange} />
          <button
            onClick={fetchRetentionAnalytics}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Cohort Overview</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Users registered in the last 30 days: {retentionData?.totalUsers}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <RetentionCard
          title="Day 1 Retention"
          rate={retentionData?.day1RetentionRate || 0}
          icon={Calendar}
        />
        <RetentionCard
          title="Day 7 Retention"
          rate={retentionData?.day7RetentionRate || 0}
          icon={TrendingUp}
        />
        <RetentionCard
          title="Day 30 Retention"
          rate={retentionData?.day30RetentionRate || 0}
          icon={BarChart3}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white mb-4">Retention Funnel</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Day 1</span>
                <span className="text-sm font-semibold text-slate-950 dark:text-white">{retentionData?.day1RetentionRate?.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div 
                  className="h-2 rounded-full bg-saffron-500" 
                  style={{ width: `${retentionData?.day1RetentionRate || 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Day 7</span>
                <span className="text-sm font-semibold text-slate-950 dark:text-white">{retentionData?.day7RetentionRate?.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div 
                  className="h-2 rounded-full bg-saffron-500" 
                  style={{ width: `${retentionData?.day7RetentionRate || 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Day 30</span>
                <span className="text-sm font-semibold text-slate-950 dark:text-white">{retentionData?.day30RetentionRate?.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div 
                  className="h-2 rounded-full bg-saffron-500" 
                  style={{ width: `${retentionData?.day30RetentionRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!retentionData && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
          <TrendingUp className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400">No retention data available</p>
        </div>
      )}
    </div>
  );
}
