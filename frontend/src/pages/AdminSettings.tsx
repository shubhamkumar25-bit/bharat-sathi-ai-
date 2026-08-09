import { useEffect, useState } from 'react';
import { Settings, Shield, Database, Bell, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AdminSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [settings, setSettings] = useState({
    enableAnalytics: true,
    enableAuditLogging: true,
    dataRetentionDays: 90,
    enableNotifications: true,
    maintenanceMode: false,
  });

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const token = await user?.getIdToken();
      const response = await fetch('http://localhost:4000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  const SettingCard = ({ title, icon: Icon, children }: any) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Admin Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Configure platform settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl bg-saffron-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-saffron-600 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
          message.includes('success') 
            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300' 
            : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <SettingCard title="Analytics" icon={Database}>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-400">Enable Analytics Tracking</span>
              <input
                type="checkbox"
                checked={settings.enableAnalytics}
                onChange={(e) => setSettings({ ...settings, enableAnalytics: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-saffron-500 focus:ring-saffron-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-400">Enable Audit Logging</span>
              <input
                type="checkbox"
                checked={settings.enableAuditLogging}
                onChange={(e) => setSettings({ ...settings, enableAuditLogging: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-saffron-500 focus:ring-saffron-500"
              />
            </label>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                Data Retention (days)
              </label>
              <input
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) || 90 })}
                className="w-full rounded-2xl border border-slate-200 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </SettingCard>

        <SettingCard title="Security" icon={Shield}>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-400">Maintenance Mode</span>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-saffron-500 focus:ring-saffron-500"
              />
            </label>
            {settings.maintenanceMode && (
              <div className="rounded-2xl bg-yellow-50 p-3 text-xs text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300">
                ⚠️ Maintenance mode will disable access for non-admin users
              </div>
            )}
          </div>
        </SettingCard>

        <SettingCard title="Notifications" icon={Bell}>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-400">Enable Notifications</span>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-saffron-500 focus:ring-saffron-500"
              />
            </label>
          </div>
        </SettingCard>

        <SettingCard title="System" icon={Settings}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">System Status</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-slate-950 dark:text-white">Operational</span>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Database Connection</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-slate-950 dark:text-white">Connected</span>
              </div>
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}
