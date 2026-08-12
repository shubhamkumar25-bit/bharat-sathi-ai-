import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { assertFirebaseAuthReady, firestoreDb } from '@/lib/firebase';
import type { ChatMessage, ResumeDraft } from '@/types';

function getFirestoreDb() {
  assertFirebaseAuthReady();

  if (!firestoreDb) {
    throw new Error('Firebase Firestore is not configured. Please provide valid VITE_FIREBASE_* values in your .env file.');
  }

  return firestoreDb;
}

const usersCollection = (userId: string) => doc(getFirestoreDb(), 'users', userId);

export async function upsertUserProfile(userId: string, profile: Record<string, unknown>) {
  try {
    await setDoc(usersCollection(userId), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('upsertUserProfile error:', err);
  }
}

export async function saveChatMessage(userId: string, message: ChatMessage) {
  try {
    await addDoc(collection(getFirestoreDb(), 'users', userId, 'chatMessages'), {
      ...message,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('saveChatMessage error:', err);
  }
}

export async function loadSavedChats(userId: string) {
  try {
    const chatQuery = query(collection(getFirestoreDb(), 'users', userId, 'chatMessages'), orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(chatQuery);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (err) {
    console.warn('loadSavedChats error:', err);
    return [];
  }
}

export async function saveResumeDraft(userId: string, draft: ResumeDraft) {
  try {
    await addDoc(collection(getFirestoreDb(), 'users', userId, 'resumes'), {
      ...draft,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('saveResumeDraft error:', err);
  }
}