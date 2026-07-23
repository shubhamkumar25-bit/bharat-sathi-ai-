import { getFirebaseAdminAuth, getFirebaseAdminDb } from '../config/firebaseAdmin.js';
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
    profile: profile || null,
  });
}

export async function saveProfile(req, res) {
  const profile = await upsertProfile(req.user.uid, req.body);
  res.json({ profile });
}

export async function getAllUsers(req, res) {
  try {
    const listUsersResult = await getFirebaseAdminAuth().listUsers(1000);
    const snapshot = await getFirebaseAdminDb().collection('users').get();
    
    const roles = {};
    snapshot.docs.forEach(doc => {
      roles[doc.id] = doc.data().role || 'user';
    });

    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      role: roles[userRecord.uid] || userRecord.customClaims?.role || 'user',
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    }));
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}

export async function updateUserRole(req, res) {
  const { uid } = req.params;
  const { role } = req.body;
  
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    await getFirebaseAdminDb().collection('users').doc(uid).set({ role }, { merge: true });
    await getFirebaseAdminAuth().setCustomUserClaims(uid, { role });
    res.json({ message: `Role updated to ${role} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: error.message });
  }
}

export async function deleteUser(req, res) {
  const { uid } = req.params;
  
  if (uid === req.user.uid) {
    return res.status(400).json({ message: 'Cannot delete yourself' });
  }

  try {
    await getFirebaseAdminAuth().deleteUser(uid);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
}