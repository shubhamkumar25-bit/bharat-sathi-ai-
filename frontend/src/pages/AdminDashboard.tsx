import { useEffect, useState } from 'react';
import { Shield, ShieldAlert, Trash2, UserCog, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loadAllUsers, updateUserRoleApi, deleteUserApi } from '@/services/backend';

export function AdminDashboard() {
  const { role } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await loadAllUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRole(uid: string, currentRole: string) {
    if (!window.confirm(`Are you sure you want to toggle the role for this user?`)) return;
    
    setProcessingId(uid);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRoleApi(uid, newRole);
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(uid: string) {
    if (!window.confirm('WARNING: This will permanently delete this user. Are you absolutely sure?')) return;
    
    setProcessingId(uid);
    try {
      await deleteUserApi(uid);
      setUsers(users.filter(u => u.uid !== uid));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  }

  if (role !== 'admin') {
    return (
      <div className="section-shell py-20 text-center">
        <ShieldAlert className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="section-shell py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-saffron-600 dark:text-saffron-400" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Manage users and access permissions across the platform.</p>
        </div>
        <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Total Users: {users.length}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.uid} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.email} className="h-10 w-10 rounded-full" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400">
                            <UserRound className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{u.displayName || 'No Name'}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                          <div className="text-[10px] text-slate-400">{u.uid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserRound className="h-3 w-3" />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(u.creationTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleRole(u.uid, u.role)}
                          disabled={processingId === u.uid}
                          className="focus-ring inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <UserCog className="h-3.5 w-3.5" />
                          {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleDelete(u.uid)}
                          disabled={processingId === u.uid}
                          className="focus-ring inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
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
