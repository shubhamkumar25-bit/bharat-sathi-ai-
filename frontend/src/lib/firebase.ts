import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim(),
};

const apiKeyPlaceholderPattern = /^YOUR_|^REPLACE_ME$|^changeme$/i;
const isDevelopment = import.meta.env.DEV;

function isPlaceholder(value?: string) {
  return !value || apiKeyPlaceholderPattern.test(value) || value.includes('YOUR_');
}

export function getFirebaseConfigIssues() {
  const issues: string[] = [];

  if (isPlaceholder(firebaseConfig.apiKey)) {
    issues.push('VITE_FIREBASE_API_KEY');
  }
  if (isPlaceholder(firebaseConfig.authDomain)) {
    issues.push('VITE_FIREBASE_AUTH_DOMAIN');
  }
  if (isPlaceholder(firebaseConfig.projectId)) {
    issues.push('VITE_FIREBASE_PROJECT_ID');
  }
  if (isPlaceholder(firebaseConfig.storageBucket)) {
    issues.push('VITE_FIREBASE_STORAGE_BUCKET');
  }
  if (isPlaceholder(firebaseConfig.messagingSenderId)) {
    issues.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  }
  if (isPlaceholder(firebaseConfig.appId)) {
    issues.push('VITE_FIREBASE_APP_ID');
  }

  return issues;
}

function buildMissingConfigMessage() {
  const issues = getFirebaseConfigIssues();

  if (!issues.length) {
    return '';
  }

  if (issues.includes('VITE_FIREBASE_API_KEY')) {
    return 'Firebase API key is not valid. Please replace VITE_FIREBASE_API_KEY in your .env file with the Firebase web API key from Firebase Console > Project settings > General > Your apps.';
  }

  return `Firebase configuration is incomplete. Please set these values in your .env file: ${issues.join(', ')}.`;
}

export function assertFirebaseAuthReady() {
  const message = buildMissingConfigMessage();

  if (message) {
    throw new Error(message);
  }
}

function logFirebaseConfig() {
  if (isDevelopment) {
    console.info('Firebase configuration loaded', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 6)}***` : undefined,
      ready: getFirebaseConfigIssues().length === 0,
    });
  }
}

const hasValidConfig = getFirebaseConfigIssues().length === 0;
const app: FirebaseApp | null = hasValidConfig
  ? (getApps().length ? getApps()[0] : initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      measurementId: firebaseConfig.measurementId,
    }))
  : null;

logFirebaseConfig();

export const firebaseApp = app;
export const firebaseAuth: Auth | null = app ? getAuth(app) : null;
export const firestoreDb: Firestore | null = app ? getFirestore(app) : null;
export const firebaseAnalytics: Analytics | null = app ? getAnalytics(app) : null;
console.log("API KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
console.log("AUTH DOMAIN:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log("PROJECT ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("APP ID:", import.meta.env.VITE_FIREBASE_APP_ID);