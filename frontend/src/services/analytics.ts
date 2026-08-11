/**
 * analytics.ts
 *
 * All Firestore write helpers for real user tracking.
 * Collections written:
 *   users/{uid}            - user profile + timestamps
 *   loginEvents/{id}       - one doc per successful login
 *   pageViews/{id}         - one doc per page visit
 *   featureEvents/{id}     - one doc per feature interaction
 *
 * NEVER stores passwords or auth credentials.
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestoreDb } from '@/lib/firebase';

// ─── helpers ───────────────────────────────────────────────────────────────

function db() {
  if (!firestoreDb) return null;
  return firestoreDb;
}

// ─── User profile ───────────────────────────────────────────────────────────

/**
 * Called once on NEW user registration.
 * Creates users/{uid} with all required fields.
 */
export async function createUserProfile(uid: string, name: string, email: string) {
  const database = db();
  if (!database) return;

  await setDoc(
    doc(database, 'users', uid),
    {
      uid,
      name: name || '',
      email: email || '',
      role: 'user',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    },
    { merge: false } // fresh doc — do NOT merge so createdAt is never overwritten
  );
}

/**
 * Called on every successful login.
 * Updates lastLoginAt + lastActiveAt on existing user doc.
 */
export async function updateUserLoginTimestamp(uid: string) {
  const database = db();
  if (!database) return;

  await setDoc(
    doc(database, 'users', uid),
    {
      lastLoginAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Called on any meaningful user activity (page visit, feature use).
 * Keeps lastActiveAt fresh for "active today" calculation.
 */
export async function touchUserActive(uid: string) {
  const database = db();
  if (!database) return;

  await setDoc(
    doc(database, 'users', uid),
    { lastActiveAt: serverTimestamp() },
    { merge: true }
  );
}

// ─── Login events ───────────────────────────────────────────────────────────

/**
 * Called ONLY on successful login (email/password or Google).
 * Creates loginEvents/{autoId}.
 */
export async function recordLoginEvent(uid: string, name: string, email: string) {
  const database = db();
  if (!database) return;

  await addDoc(collection(database, 'loginEvents'), {
    uid,
    name: name || '',
    email: email || '',
    timestamp: serverTimestamp(),
    type: 'login',
  });
}

// ─── Page views ─────────────────────────────────────────────────────────────

/**
 * Call this from any page on mount to track real page visits.
 * uid can be null for unauthenticated visitors.
 */
export async function recordPageView(page: string, uid: string | null) {
  const database = db();
  if (!database) return;

  await addDoc(collection(database, 'pageViews'), {
    uid: uid ?? null,
    page,
    timestamp: serverTimestamp(),
  });
}

// ─── Feature events ─────────────────────────────────────────────────────────

/**
 * Call this when a user actually uses a feature.
 * feature: "AI Chat" | "Voice Input" | "Resume Builder" | "Government Schemes" | etc.
 * action:  "message_sent" | "voice_used" | "resume_saved" | "scheme_viewed" | etc.
 */
export async function recordFeatureEvent(
  uid: string,
  feature: string,
  action: string
) {
  const database = db();
  if (!database) return;

  await addDoc(collection(database, 'featureEvents'), {
    uid,
    feature,
    action,
    timestamp: serverTimestamp(),
  });
}
