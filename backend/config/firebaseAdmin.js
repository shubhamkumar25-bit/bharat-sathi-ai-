import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildServiceAccount() {
  // 1. Try environment variable first
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (json) {
    try {
      return JSON.parse(json);
    } catch (error) {
      console.error(
        '[firebase-admin] Invalid FIREBASE_SERVICE_ACCOUNT_JSON:',
        error.message
      );
    }
  }

  // 2. Try local Firebase service account JSON
  try {
    const serviceAccountPath = path.join(
      __dirname,
      'firebase-service-account.json'
    );

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8')
      );

      console.log('[firebase-admin] Service account JSON loaded');

      return serviceAccount;
    }
  } catch (error) {
    console.error(
      '[firebase-admin] Failed to load service account JSON:',
      error.message
    );
  }

  // 3. Try individual environment variables
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID;

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n'
  );

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey,
    };
  }

  return null;
}

function getFirebaseApp() {
  // Reuse existing Firebase Admin app
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount = buildServiceAccount();

  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.VITE_FIREBASE_STORAGE_BUCKET;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID;

  if (!serviceAccount) {
    if (projectId) {
      console.warn(
        '[firebase-admin] No service account credentials found. Initializing with project ID only.'
      );

      return initializeApp({
        projectId,
        storageBucket,
      });
    }

    throw new Error(
      'Firebase Admin credentials are missing.'
    );
  }

  console.log('[firebase-admin] Initializing Firebase Admin SDK');

  return initializeApp({
    credential: cert(serviceAccount),
    storageBucket,
  });
}

export function getFirebaseAdminApp() {
  return getFirebaseApp();
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}

export function getFirebaseAdminStorage() {
  return getStorage(getFirebaseAdminApp());
}