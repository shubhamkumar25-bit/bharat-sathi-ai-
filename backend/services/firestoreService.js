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

export async function upsertProfile(userId, profileData) {
  try {
    // Remove role from incoming data to prevent security bypass from the client
    const { role, ...safeData } = profileData;

    await userDoc(userId).set({ 
      ...safeData, 
      updatedAt: FieldValue.serverTimestamp() 
    }, { merge: true });
    
    return safeData;
  } catch (error) {
    console.warn('[firestoreService] upsertProfile warning:', error.message);
    return profileData;
  }
}

export async function readProfile(userId) {
  try {
    const snapshot = await userDoc(userId).get();
    return snapshot.exists ? snapshot.data() : null;
  } catch (error) {
    console.warn('[firestoreService] readProfile warning:', error.message);
    return null;
  }
}

export async function saveConversationTurn({ userId, conversationId, message, answer, title }) {
  try {
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
  } catch (error) {
    console.warn('[firestoreService] saveConversationTurn warning:', error.message);
    return { id: conversationId, title: title || message.content.slice(0, 48), messages: [message, answer] };
  }
}

export async function listConversations(userId, limitCount = 20) {
  try {
    const snapshot = await conversationsCollection(userId).orderBy('updatedAt', 'desc').limit(limitCount).get();
    return snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        ...data,
        createdAt: safeDate(data.createdAt),
      };
    });
  } catch (error) {
    console.warn('[firestoreService] listConversations warning:', error.message);
    return [];
  }
}

export async function clearConversation(userId, conversationId) {
  try {
    await conversationsCollection(userId).doc(conversationId).delete();
  } catch (error) {
    console.warn('[firestoreService] clearConversation warning:', error.message);
  }
}

export async function saveResume(userId, resume) {
  try {
    const ref = await resumesCollection(userId).add({
      ...resume,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { id: ref.id, ...resume };
  } catch (error) {
    console.warn('[firestoreService] saveResume warning:', error.message);
    return { id: 'temp-' + Date.now(), ...resume };
  }
}

export async function updateResume(userId, resumeId, resume) {
  try {
    await resumesCollection(userId).doc(resumeId).set({
      ...resume,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('[firestoreService] updateResume warning:', error.message);
  }
}

export async function deleteResume(userId, resumeId) {
  try {
    await resumesCollection(userId).doc(resumeId).delete();
  } catch (error) {
    console.warn('[firestoreService] deleteResume warning:', error.message);
  }
}

export async function duplicateResume(userId, resumeId) {
  try {
    const snapshot = await resumesCollection(userId).doc(resumeId).get();

    if (!snapshot.exists) {
      throw new Error('Resume not found.');
    }

    const data = snapshot.data();
    return saveResume(userId, { ...data, name: `${data?.name || 'Resume'} Copy` });
  } catch (error) {
    console.warn('[firestoreService] duplicateResume warning:', error.message);
    return null;
  }
}

export async function listResumes(userId, limitCount = 20) {
  try {
    const snapshot = await resumesCollection(userId).orderBy('updatedAt', 'desc').limit(limitCount).get();
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    console.warn('[firestoreService] listResumes warning:', error.message);
    return [];
  }
}

export async function getResume(userId, resumeId) {
  try {
    const snapshot = await resumesCollection(userId).doc(resumeId).get();
    return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    console.warn('[firestoreService] getResume warning:', error.message);
    return null;
  }
}

export async function saveBookmark(userId, bookmark) {
  try {
    const docId = bookmark.id || bookmark.schemeId;
    await bookmarksCollection(userId).doc(docId).set({
      ...bookmark,
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return { id: docId, ...bookmark };
  } catch (error) {
    console.warn('[firestoreService] saveBookmark warning:', error.message);
    return bookmark;
  }
}

export async function listBookmarks(userId) {
  try {
    const snapshot = await bookmarksCollection(userId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    console.warn('[firestoreService] listBookmarks warning:', error.message);
    return [];
  }
}

export async function deleteBookmark(userId, bookmarkId) {
  try {
    await bookmarksCollection(userId).doc(bookmarkId).delete();
  } catch (error) {
    console.warn('[firestoreService] deleteBookmark warning:', error.message);
  }
}

export async function addActivity(userId, activity) {
  try {
    await userDoc(userId).collection('activity').add({
      ...activity,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.warn('[firestoreService] addActivity warning:', error.message);
  }
}

export async function listRecentActivity(userId, limitCount = 10) {
  try {
    const snapshot = await userDoc(userId).collection('activity').orderBy('createdAt', 'desc').limit(limitCount).get();
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    console.warn('[firestoreService] listRecentActivity warning:', error.message);
    return [];
  }
}