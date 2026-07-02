import {
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  setPersistence,
  signOut,
  type User
} from 'firebase/auth';
import { assertFirebaseAuthReady, firebaseAuth } from '@/lib/firebase';

function mapFirebaseAuthError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code || '') : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found for this email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/operation-not-allowed':
      return 'Email/Password authentication is disabled in Firebase Console. Go to Firebase Console > Build > Authentication > Sign-in method > Email/Password and turn it on.';
    case 'auth/api-key-not-valid':
      return 'Firebase API key is not valid. Please replace VITE_FIREBASE_API_KEY in your .env file with the Firebase web API key from Firebase Console > Project settings > General > Your apps.';
    default:
      return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
  }
}

export function observeAuthState(callback: (user: User | null) => void) {
  if (!firebaseAuth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(firebaseAuth, callback);
}

export async function loginWithEmail(email: string, password: string) {
  assertFirebaseAuthReady();
  const auth = firebaseAuth;

  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please provide valid VITE_FIREBASE_* values in your .env file.');
  }

  await setPersistence(auth, browserLocalPersistence);

  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function registerWithEmail(email: string, password: string) {
  assertFirebaseAuthReady();
  const auth = firebaseAuth;

  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please provide valid VITE_FIREBASE_* values in your .env file.');
  }

  await setPersistence(auth, browserLocalPersistence);

  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function logout() {
  if (!firebaseAuth) {
    return;
  }

  await signOut(firebaseAuth);
}