import { useEffect, useState } from 'react';
import { Search, Filter, UserRound, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { firestoreDb } from '@/lib/firebase';

interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
  lastActiveAt: Timestamp | null;
}

function isToday(ts: Timestamp | null): boolean {
  if (!ts) return false;
  const d = ts.toDate();
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function fmtDate(ts: Timestamp | null): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtTime(ts: Timestamp | null): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function AdminUsers() {
  const [users, setUsers]     = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<'all' | 'active' | 'new'>('all');

  // ── Real-time Firestore listener ──────────────────────────────────────────
  useEffect(() => {
    if (!firestoreDb) {
      setError('Firestore is not configured.');
      setLoading(false);
      return;
    }

    const q = query(
      collection(firestoreDb, 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: FirestoreUser[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            uid:          d.id,
            name:         data.name || data.displayName || '',
            email:        data.email || '',
            role:         data.role || 'user',
            createdAt:    data.createdAt    instanceof Timestamp ? data.createdAt    : null,
            lastLoginAt:  data.lastLoginAt  instanceof Timestamp ? data.lastLoginAt  : null,
            lastActiveAt: data.lastActiveAt instanceof Timestamp ? data.lastActiveAt : null,
          };
        });
        setUsers(list);
        setLoading(false);
        setError('');
      },
      (err) => {
        setError(err.message || 'Failed to load users from Firestore.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // ── Client-side filter + search ───────────────────────────────────────────
  const filtered = users
    .filter((u) => {
      if (filter === 'active') return isToday(u.lastActiveAt);
      if (filter === 'new')    return isToday(u.createdAt);
      return true;
    })
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
      );
    });

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-saffron-500 border-t-transparent mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Loading users from Firestore...</p>
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Live from Firestore — updates automatically when a new user signs up
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Real-time
          </span>
          <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Total: {users.length}
          </span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'new')}
            className="rounded-2xl border border-slate-200 py-3 px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">All Users</option>
            <option value="active">Active Today</option>
            <option value="new">New Today</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">UID</th>
                <th className="px-6 py-4 font-semibold">Registered</th>
                <th className="px-6 py-4 font-semibold">Last Login</th>
                <th className="px-6 py-4 font-semibold">Last Active</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    {users.length === 0
                      ? 'No users yet. Real users will appear here after sign-up.'
                      : 'No users match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.uid} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">

                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {u.name || 'No Name'}
                          </div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {u.role}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                              isToday(u.lastActiveAt)
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {isToday(u.lastActiveAt) ? 'active today' : 'inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* UID */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 max-w-[120px] truncate">
                      {u.uid}
                    </td>

                    {/* Registered */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{fmtDate(u.createdAt)}</span>
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{fmtTime(u.lastLoginAt)}</span>
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${
                        isToday(u.lastActiveAt)
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500'
                      }`}>
                        {fmtTime(u.lastActiveAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/users/${u.uid}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        View Details
                        <ChevronRight className="h-3 w-3" />
                      </Link>
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
