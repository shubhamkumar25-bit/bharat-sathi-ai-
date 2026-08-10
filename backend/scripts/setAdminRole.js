import dotenv from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: '../.env' });

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
    args[key] = value;
    if (value !== true) {
      i += 1;
    }
  }

  return args;
}

function buildServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return JSON.parse(json);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return null;
}

function initializeAdminSdk() {
  if (getApps().length) {
    return;
  }

  const serviceAccount = buildServiceAccount();
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET;

  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount), storageBucket });
    return;
  }

  if (projectId) {
    initializeApp({ projectId, storageBucket });
    return;
  }

  throw new Error('Firebase Admin credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const uid = typeof args.uid === 'string' ? args.uid : '';
  const email = typeof args.email === 'string' ? args.email : '';
  const role = typeof args.role === 'string' ? args.role.toLowerCase() : 'admin';

  if (!uid) {
    console.error('Usage: node scripts/setAdminRole.js --uid <firebase-uid> --email <email> [--role admin|super_admin]');
    process.exit(1);
  }

  if (!['admin', 'super_admin'].includes(role)) {
    console.error('Role must be either admin or super_admin.');
    process.exit(1);
  }

  initializeAdminSdk();

  const auth = getAuth();
  const db = getFirestore();

  try {
    const userRecord = await auth.getUser(uid);
    const effectiveEmail = email || userRecord.email || '';

    if (email && userRecord.email && userRecord.email.toLowerCase() !== email.toLowerCase()) {
      console.error('The supplied email does not match the Firebase user record.');
      process.exit(1);
    }

    await auth.setCustomUserClaims(uid, { role });
    await db.collection('users').doc(uid).set({
      role,
      email: effectiveEmail,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`Successfully set role '${role}' for UID ${uid} (${effectiveEmail}).`);
    console.log('Refresh the Firebase client session or sign out/in to pick up the new claims.');
  } catch (error) {
    console.error('Failed to set admin role:', error.message);
    process.exit(1);
  }
}

main();
