import { useEffect, useState } from 'react';
import { Shield, User, FileText, Database, Settings, Calendar, Clock, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DateFilter } from '@/components/DateFilter';

interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: any;
  created_at: string;
}

export function AdminAuditLog() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, targetTypeFilter]);

  async function fetchAuditLogs() {
    setLoading(true);
    setError('');
    try {
      const token = await user?.getIdToken();
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (targetTypeFilter) params.append('targetType', targetTypeFilter);
      
      const response = await fetch(`http://localhost:4000/api/admin/audit-log?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setAuditLogs(data.auditLogs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ADMIN_LOGIN':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'USER_VIEWED':
      case 'USER_UPDATED':
      case 'USER_SUSPENDED':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'SCHEME_VIEWED':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'DATASET_SYNCED':
        return <Database className="h-5 w-5 text-yellow-500" />;
      case 'SETTINGS_CHANGED':
        return <Settings className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-slate-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log('Date range:', startDate, endDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-saffron-500 border-t-transparent mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Loading audit logs...</p>
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
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Admin Audit Log</h1>
          <p className="text-slate-600 dark:text-slate-400">Track all administrative actions</p>
        </div>
        <div className="flex items-center gap-4">
          <DateFilter onDateRangeChange={handleDateRangeChange} />
          <button
            onClick={fetchAuditLogs}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 py-3 px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="">All Actions</option>
            <option value="ADMIN_LOGIN">Admin Login</option>
            <option value="USER_VIEWED">User Viewed</option>
            <option value="USER_UPDATED">User Updated</option>
            <option value="USER_SUSPENDED">User Suspended</option>
            <option value="SCHEME_VIEWED">Scheme Viewed</option>
            <option value="DATASET_SYNCED">Dataset Synced</option>
            <option value="SETTINGS_CHANGED">Settings Changed</option>
          </select>
        </div>
        <select
          value={targetTypeFilter}
          onChange={(e) => setTargetTypeFilter(e.target.value)}
          className="rounded-2xl border border-slate-200 py-3 px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        >
          <option value="">All Targets</option>
          <option value="user">User</option>
          <option value="scheme">Scheme</option>
          <option value="dataset">Dataset</option>
          <option value="settings">Settings</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Admin</th>
                <th className="px-6 py-4 font-semibold">Target</th>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No audit logs found</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
                          {getActionIcon(log.action)}
                        </div>
                        <span className="font-semibold text-slate-950 dark:text-white">
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{log.admin_email}</td>
                    <td className="px-6 py-4">
                      {log.target_type && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-medium dark:bg-slate-900 dark:text-slate-300">
                            {log.target_type}
                          </span>
                          {log.target_id && (
                            <span className="text-xs font-mono text-slate-500">{log.target_id}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        {new Date(log.created_at).toLocaleDateString()}
                        <Clock className="h-4 w-4 ml-2" />
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
