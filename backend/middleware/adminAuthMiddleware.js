import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

// Authorized admin emails (fallback/bootstrap)
const AUTHORIZED_ADMINS = {
  OWNER: 'muktai@navgurukul.org',
  ADMIN: 'shubhamkumar25@navgurukul.org',
};

function getBootstrapRole(email) {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail === AUTHORIZED_ADMINS.OWNER.toLowerCase()) {
    return 'super_admin';
  }

  if (
    normalizedEmail === AUTHORIZED_ADMINS.ADMIN.toLowerCase() ||
    normalizedEmail === AUTHORIZED_ADMINS.ADMIN_ALT.toLowerCase()
  ) {
    return 'admin';
  }

  if (process.env.NODE_ENV !== 'production') {
    if (
      normalizedEmail.endsWith('@navgurukul.org') ||
      normalizedEmail.includes('muktai') ||
      normalizedEmail.includes('shubham')
    ) {
      if (normalizedEmail.includes('muktai')) {
        return 'super_admin';
      }
      return 'admin';
    }
  }

  return null;
}

/**
 * Server-side admin authorization middleware
 * Verifies that the authenticated user has an 'admin' or 'super_admin' role
 */
async function resolveUserRole(user) {
  if (!user?.uid) {
    return { role: null, source: 'none' };
  }

  const claimRole = user.role;
  if (claimRole === 'admin' || claimRole === 'super_admin') {
    return { role: claimRole, source: 'token' };
  }

  const userEmail = user.email ? user.email.toLowerCase() : '';
  const bootstrapRole = getBootstrapRole(userEmail);

  if (bootstrapRole) {
    return { role: bootstrapRole, source: 'bootstrap' };
  }

  try {
    const db = getFirebaseAdminDb();
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (userDoc.exists && ['admin', 'super_admin'].includes(userDoc.data().role)) {
      return { role: userDoc.data().role, source: 'firestore' };
    }
  } catch (dbErr) {
    console.warn('[admin-auth] unable to read Firestore role', {
      uid: user.uid,
      email: user.email,
      message: dbErr?.message,
    });
  }

  return { role: null, source: 'none' };
}

export async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.uid) {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  try {
    const { role, source } = await resolveUserRole(req.user);

    if (role === 'admin' || role === 'super_admin') {
      req.adminRole = role === 'super_admin' ? 'SUPER_ADMIN' : 'ADMIN';
      req.adminEmail = req.user.email;
      console.info('[admin-auth] granted admin access', {
        uid: req.user.uid,
        email: req.user.email,
        role,
        source,
      });
      return next();
    }
  } catch (error) {
    console.error('[admin-auth] authorization failed', {
      uid: req.user?.uid,
      email: req.user?.email,
      message: error?.message,
    });
  }

  return res.status(403).json({ message: 'Forbidden: Admin access required.' });
}

/**
 * Server-side super admin authorization middleware
 * Verifies that the authenticated user has a 'super_admin' role
 */
export async function requireSuperAdmin(req, res, next) {
  if (!req.user || !req.user.uid) {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required.' });
  }

  try {
    const { role, source } = await resolveUserRole(req.user);

    if (role === 'super_admin') {
      req.adminRole = 'SUPER_ADMIN';
      req.adminEmail = req.user.email;
      console.info('[admin-auth] granted super admin access', {
        uid: req.user.uid,
        email: req.user.email,
        role,
        source,
      });
      return next();
    }
  } catch (error) {
    console.error('[admin-auth] super admin authorization failed', {
      uid: req.user?.uid,
      email: req.user?.email,
      message: error?.message,
    });
  }

  return res.status(403).json({ message: 'Forbidden: Super Admin access required.' });
}

// Deprecated alias for backwards compatibility
export const requireOwner = requireSuperAdmin;

/**
 * Get admin role for a user email
 */
export function getAdminRole(email) {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase();
  
  if (normalizedEmail === AUTHORIZED_ADMINS.OWNER.toLowerCase()) {
    return 'SUPER_ADMIN';
  }
  if (
    normalizedEmail === AUTHORIZED_ADMINS.ADMIN.toLowerCase() ||
    normalizedEmail === AUTHORIZED_ADMINS.ADMIN_ALT.toLowerCase()
  ) {
    return 'ADMIN';
  }
  return null;
}

/**
 * Check if an email is authorized for admin access
 */
export function isAuthorizedAdmin(email) {
  return getAdminRole(email) !== null;
}

export { AUTHORIZED_ADMINS };
