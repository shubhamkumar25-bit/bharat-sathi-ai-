import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestoreDb } from './firebase';
import type { ChatMessage, ResumeDraft } from '@/types';

const usersCollection = (userId: string) => doc(firestoreDb, 'users', userId);

export async function upsertUserProfile(userId: string, profile: Record<string, unknown>) {
  await setDoc(usersCollection(userId), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}

export async function saveChatMessage(userId: string, message: ChatMessage) {
  await addDoc(collection(firestoreDb, 'users', userId, 'chatMessages'), {
    ...message,
    createdAt: serverTimestamp()
  });
}

export async function loadSavedChats(userId: string) {
  const chatQuery = query(collection(firestoreDb, 'users', userId, 'chatMessages'), orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(chatQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function saveResumeDraft(userId: string, draft: ResumeDraft) {
  await addDoc(collection(firestoreDb, 'users', userId, 'resumes'), {
    ...draft,
    createdAt: serverTimestamp()
  });
}