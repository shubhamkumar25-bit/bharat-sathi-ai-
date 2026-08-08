import { useState, useEffect } from 'react';
import { RefreshCw, Database, CheckCircle, XCircle, Clock, AlertCircle, Play, Pause } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface Dataset {
  id: string;
  name: string;
  resource_id: string;
  category: string;
  description: string;
  api_available: boolean;
  status: 'ACTIVE' | 'DISABLED' | 'SYNCING' | 'ERROR';
  last_sync_completed_at?: string;
  last_sync_failed_at?: string;
  last_sync_error?: string;
  record_count?: number;
  created_at: string;
  updated_at: string;
}

interface SyncLog {
  id: string;
  dataset_id: string;
  sync_id: string;
  status: 'STARTED' | 'COMPLETED' | 'FAILED';
  message: string;
  records_processed?: number;
  duration?: number;
  created_at: string;
}

export function AdminDataSourcesPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/data-gov/datasets`);
      const data = await response.json();
      
      if (data.success) {
        setDatasets(data.data);
      } else {
        setError(data.error || 'Failed to fetch datasets');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async (datasetId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/data-gov/datasets/${datasetId}/logs?limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setSyncLogs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sync logs:', err);
    }
  };

  const handleSyncDataset = async (datasetId: string) => {
    try {
      setSyncing(datasetId);
      const response = await fetch(`${API_BASE_URL}/api/admin/data-gov/sync/${datasetId}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh datasets after sync
        await fetchDatasets();
        if (selectedDataset?.id === datasetId) {
          await fetchSyncLogs(datasetId);
        }
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Failed to sync dataset');
    } finally {
      setSyncing(null);
    }
  };

  const handleToggleDataset = async (datasetId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? false : true;
      const response = await fetch(`${API_BASE_URL}/api/admin/data-gov/datasets/${datasetId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newStatus }),
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchDatasets();
      } else {
        setError(data.error || 'Failed to toggle dataset');
      }
    } catch (err) {
      setError('Failed to toggle dataset');
    }
  };

  const handleSelectDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    fetchSyncLogs(dataset.id);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 text-saffron-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">
            Data Sources Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage Data.gov.in datasets and synchronization
          </p>
        </div>
        <button
          onClick={fetchDatasets}
          className="flex items-center gap-2 px-4 py-2 bg-saffron-500 text-white rounded-2xl hover:bg-saffron-600 transition-colors"
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Datasets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <Database className="h-5 w-5 text-saffron-500" />
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                Datasets ({datasets.length})
              </h2>
            </div>

            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  onClick={() => handleSelectDataset(dataset)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedDataset?.id === dataset.id
                      ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-950/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(dataset.status)}
                        <h3 className="font-semibold text-slate-950 dark:text-white">
                          {dataset.name}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        {dataset.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full dark:bg-slate-800 dark:text-slate-300">
                          {dataset.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          dataset.api_available ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {dataset.api_available ? 'API Available' : 'API Unavailable'}
                        </span>
                        {dataset.record_count && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                            {dataset.record_count.toLocaleString()} records
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSyncDataset(dataset.id);
                        }}
                        disabled={syncing === dataset.id || dataset.status === 'SYNCING'}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                        title="Sync Now"
                      >
                        {syncing === dataset.id || dataset.status === 'SYNCING' ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-saffron-500" />
                        ) : (
                          <Play className="h-4 w-4 text-green-500" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDataset(dataset.id, dataset.status);
                        }}
                        disabled={dataset.status === 'SYNCING'}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                        title={dataset.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      >
                        {dataset.status === 'ACTIVE' ? (
                          <Pause className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Play className="h-4 w-4 text-green-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  {dataset.last_sync_error && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      Last error: {dataset.last_sync_error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dataset Details */}
        <div className="space-y-4">
          {selectedDataset ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
                Dataset Details
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Name</label>
                  <p className="text-sm text-slate-950 dark:text-white">{selectedDataset.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Resource ID</label>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono break-all">{selectedDataset.resource_id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
                  <p className="text-sm text-slate-950 dark:text-white">{selectedDataset.category}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedDataset.status)}
                    <span className="text-sm text-slate-950 dark:text-white">{selectedDataset.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Sync Completed</label>
                  <p className="text-sm text-slate-950 dark:text-white">{formatDate(selectedDataset.last_sync_completed_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Sync Failed</label>
                  <p className="text-sm text-slate-950 dark:text-white">{formatDate(selectedDataset.last_sync_failed_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Record Count</label>
                  <p className="text-sm text-slate-950 dark:text-white">
                    {selectedDataset.record_count?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleSyncDataset(selectedDataset.id)}
                  disabled={syncing === selectedDataset.id || selectedDataset.status === 'SYNCING'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-saffron-500 text-white rounded-2xl hover:bg-saffron-600 transition-colors disabled:opacity-50"
                >
                  {syncing === selectedDataset.id || selectedDataset.status === 'SYNCING' ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Sync Now
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-300">
                  Select a dataset to view details
                </p>
              </div>
            </div>
          )}

          {/* Sync Logs */}
          {selectedDataset && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
                Recent Sync Logs
              </h2>

              {syncLogs.length > 0 ? (
                <div className="space-y-2">
                  {syncLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-950 dark:text-white">
                          {log.status}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{log.message}</p>
                      {log.records_processed && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Records: {log.records_processed} | Duration: {log.duration}ms
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300 text-center py-4">
                  No sync logs available
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
