import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

function usersCollection() {
  return getFirebaseAdminDb().collection('users');
}

function userDoc(userId) {
  return usersCollection().doc(userId);
}

function conversationsCollection(userId) {
  return userDoc(userId).collection('conversations');
}

function resumesCollection(userId) {
  return userDoc(userId).collection('resumes');
}

function bookmarksCollection(userId) {
  return userDoc(userId).collection('schemeBookmarks');
}

function safeDate(value) {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value?.toDate) return value.toDate().toISOString();
  return value;
}

export async function upsertProfile(userId, profile) {
  await userDoc(userId).set({ profile, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return profile;
}

export async function readProfile(userId) {
  const snapshot = await userDoc(userId).get();
  return snapshot.exists ? snapshot.data() : null;
}

export async function saveConversationTurn({ userId, conversationId, message, answer, title }) {
  const ref = conversationsCollection(userId).doc(conversationId);
  const snapshot = await ref.get();
  const existing = snapshot.exists ? snapshot.data() : null;
  const now = new Date().toISOString();
  const messages = [...(existing?.messages || []), message, answer];

  await ref.set({
    id: conversationId,
    title: existing?.title || title || message.content.slice(0, 48),
    messages,
    latestMessage: answer.content,
    latestRole: answer.role,
    createdAt: existing?.createdAt || now,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return { id: conversationId, title: existing?.title || title || message.content.slice(0, 48), messages };
}

export async function listConversations(userId, limitCount = 20) {
  const snapshot = await conversationsCollection(userId).orderBy('updatedAt', 'desc').limit(limitCount).get();
  return snapshot.docs.map((item) => {
    const data = item.data();
    return {
      id: item.id,
      ...data,
      createdAt: safeDate(data.createdAt),
    };
  });
}

export async function clearConversation(userId, conversationId) {
  await conversationsCollection(userId).doc(conversationId).delete();
}

export async function saveResume(userId, resume) {
  const ref = await resumesCollection(userId).add({
    ...resume,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { id: ref.id, ...resume };
}

export async function updateResume(userId, resumeId, resume) {
  await resumesCollection(userId).doc(resumeId).set({
    ...resume,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function deleteResume(userId, resumeId) {
  await resumesCollection(userId).doc(resumeId).delete();
}

export async function duplicateResume(userId, resumeId) {
  const snapshot = await resumesCollection(userId).doc(resumeId).get();

  if (!snapshot.exists) {
    throw new Error('Resume not found.');
  }

  const data = snapshot.data();
  return saveResume(userId, { ...data, name: `${data?.name || 'Resume'} Copy` });
}

export async function listResumes(userId, limitCount = 20) {
  const snapshot = await resumesCollection(userId).orderBy('updatedAt', 'desc').limit(limitCount).get();
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getResume(userId, resumeId) {
  const snapshot = await resumesCollection(userId).doc(resumeId).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function saveBookmark(userId, bookmark) {
  const docId = bookmark.id || bookmark.schemeId;
  await bookmarksCollection(userId).doc(docId).set({
    ...bookmark,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  return { id: docId, ...bookmark };
}

export async function listBookmarks(userId) {
  const snapshot = await bookmarksCollection(userId).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function deleteBookmark(userId, bookmarkId) {
  await bookmarksCollection(userId).doc(bookmarkId).delete();
}

export async function addActivity(userId, activity) {
  await userDoc(userId).collection('activity').add({
    ...activity,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function listRecentActivity(userId, limitCount = 10) {
  const snapshot = await userDoc(userId).collection('activity').orderBy('createdAt', 'desc').limit(limitCount).get();
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}