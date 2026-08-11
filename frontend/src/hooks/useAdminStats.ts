/**
 * useAdminStats.ts
 *
 * Real-time Firestore hook for Admin Dashboard.
 * Uses onSnapshot() on:
 *   - users          → totalUsers, newUsersToday, activeToday, recentUsers
 *   - loginEvents    → loginsToday, recentLogins
 *
 * All numbers are calculated from REAL Firestore data.
 * Zero fake/hardcoded values.
 */

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { firestoreDb } from '@/lib/firebase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
  lastActiveAt: Timestamp | null;
}

export interface LoginEvent {
  uid: string;
  name: string;
  email: string;
  timestamp: Timestamp | null;
  type: string;
}

export interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  activeToday: number;
  loginsToday: number;
  recentUsers: AdminUser[];       // latest 10 by createdAt desc
  recentLogins: LoginEvent[];     // latest 10 by timestamp desc
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns true if a Firestore Timestamp belongs to today (local time). */
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

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminStats(): { stats: AdminStats; loading: boolean } {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logins, setLogins] = useState<LoginEvent[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [loginsLoading, setLoginsLoading] = useState(true);

  useEffect(() => {
    if (!firestoreDb) {
      setUsersLoading(false);
      setLoginsLoading(false);
      return;
    }

    // ── Real-time listener: users collection ──────────────────────────────
    const usersQ = query(
      collection(firestoreDb, 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsubUsers = onSnapshot(
      usersQ,
      (snap) => {
        const list: AdminUser[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            uid:           d.id,
            name:          data.name || data.displayName || '',
            email:         data.email || '',
            role:          data.role || 'user',
            createdAt:     data.createdAt   instanceof Timestamp ? data.createdAt   : null,
            lastLoginAt:   data.lastLoginAt instanceof Timestamp ? data.lastLoginAt : null,
            lastActiveAt:  data.lastActiveAt instanceof Timestamp ? data.lastActiveAt : null,
          };
        });
        setUsers(list);
        setUsersLoading(false);
      },
      () => setUsersLoading(false)
    );

    // ── Real-time listener: loginEvents collection ────────────────────────
    const loginsQ = query(
      collection(firestoreDb, 'loginEvents'),
      orderBy('timestamp', 'desc')
    );

    const unsubLogins = onSnapshot(
      loginsQ,
      (snap) => {
        const list: LoginEvent[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            uid:       data.uid || '',
            name:      data.name || '',
            email:     data.email || '',
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp : null,
            type:      data.type || 'login',
          };
        });
        setLogins(list);
        setLoginsLoading(false);
      },
      () => setLoginsLoading(false)
    );

    return () => {
      unsubUsers();
      unsubLogins();
    };
  }, []);

  // ── Compute stats from real data ─────────────────────────────────────────
  const stats: AdminStats = {
    totalUsers:     users.length,
    newUsersToday:  users.filter((u) => isToday(u.createdAt)).length,
    activeToday:    users.filter((u) => isToday(u.lastActiveAt)).length,
    loginsToday:    logins.filter((l) => isToday(l.timestamp)).length,
    recentUsers:    users.slice(0, 10),
    recentLogins:   logins.slice(0, 10),
  };

  return {
    stats,
    loading: usersLoading || loginsLoading,
  };
}
