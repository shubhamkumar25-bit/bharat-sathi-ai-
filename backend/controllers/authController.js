import { getFirebaseAdminAuth } from '../config/firebaseAdmin.js';
import { readProfile, upsertProfile } from '../services/firestoreService.js';

export async function getCurrentUser(req, res) {
  const user = await getFirebaseAdminAuth().getUser(req.user.uid);
  const profile = await readProfile(req.user.uid);

  res.json({
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    },
    profile: profile?.profile || null,
  });
}

export async function saveProfile(req, res) {
  const profile = await upsertProfile(req.user.uid, req.body);
  res.json({ profile });
}