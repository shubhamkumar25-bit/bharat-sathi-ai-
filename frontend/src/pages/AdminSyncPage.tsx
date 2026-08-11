import { useState, useEffect } from 'react';
import { RefreshCw, Play, CheckCircle, XCircle, AlertCircle, Clock, Database } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface Dataset {
  id: string;
  name: string;
  resource_id: string;
  category: string;
  status: 'ACTIVE' | 'DISABLED' | 'SYNCING' | 'ERROR';
  last_sync_completed_at?: string;
  record_count?: number;
}

interface SyncResult {
  datasetId: string;
  recordsProcessed: number;
  duration: number;
  success: boolean;
  error?: string;
}

export function AdminSyncPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/data-gov/datasets`);
      const data = await response.json();
      
      if (data.success) {
        setDatasets(data.data);
      } else {
        setError(data.error || 'Failed to fetch datasets');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const initializeRegistry = async () => {
    try {
      setInitializing(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/data-gov/registry/initialize`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchDatasets();
      } else {
        setError(data.error || 'Failed to initialize registry');
      }
    } catch (err) {
      setError('Failed to initialize registry');
    } finally {
      setInitializing(false);
    }
  };

  const syncAllDatasets = async () => {
    try {
      setSyncing(true);
      setSyncResults([]);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/admin/data-gov/sync-all`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setSyncResults(data.results);
        await fetchDatasets();
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Failed to sync datasets');
    } finally {
      setSyncing(false);
    }
  };

  const syncSingleDataset = async (datasetId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/data-gov/sync/${datasetId}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchDatasets();
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Failed to sync dataset');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'DISABLED':
        return <XCircle className="h-5 w-5 text-slate-400" />;
      case 'SYNCING':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeDatasets = datasets.filter(d => d.status === 'ACTIVE');
  const totalRecords = datasets.reduce((sum, d) => sum + (d.record_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">
            Data Synchronization
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Sync all Data.gov.in datasets with Firestore database
          </p>
        </div>
        <button
          onClick={fetchDatasets}
          className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-saffron-500" />
            <div>
              <p className="text-2xl font-bold text-slate-950 dark:text-white">{datasets.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Total Datasets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-slate-950 dark:text-white">{activeDatasets.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Active Datasets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-slate-950 dark:text-white">{totalRecords.toLocaleString()}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Total Records</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-slate-500" />
            <div>
              <p className="text-2xl font-bold text-slate-950 dark:text-white">
                {datasets.length > 0 ? formatDate(datasets[0].last_sync_completed_at) : 'Never'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Last Sync</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-8 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={initializeRegistry}
            disabled={initializing}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            {initializing ? 'Initializing...' : 'Initialize Registry'}
          </button>
          <button
            onClick={syncAllDatasets}
            disabled={syncing || activeDatasets.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-saffron-500 text-white rounded-2xl hover:bg-saffron-600 transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing All...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Sync All Datasets
              </>
            )}
          </button>
        </div>
      </div>

      {/* Datasets List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-6">
          Datasets Status
        </h2>

        <div className="space-y-3">
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(dataset.status)}
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                      {dataset.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <span>Category: {dataset.category}</span>
                    <span>Records: {dataset.record_count?.toLocaleString() || 'N/A'}</span>
                    <span>Last Sync: {formatDate(dataset.last_sync_completed_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => syncSingleDataset(dataset.id)}
                  disabled={dataset.status === 'SYNCING' || dataset.status !== 'ACTIVE'}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                  title="Sync Now"
                >
                  {dataset.status === 'SYNCING' ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-saffron-500" />
                  ) : (
                    <Play className="h-4 w-4 text-green-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Results */}
      {syncResults.length > 0 && (
        <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-6">
            Sync Results
          </h2>

          <div className="space-y-3">
            {syncResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl border-2 ${
                  result.success
                    ? 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/20'
                    : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-semibold text-slate-950 dark:text-white">
                        {result.datasetId}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      Records: {result.recordsProcessed} | Duration: {result.duration}ms
                    </div>
                    {result.error && (
                      <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
