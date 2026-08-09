import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

// Authorized admin emails (fallback/bootstrap)
const AUTHORIZED_ADMINS = {
  OWNER: 'muktai@navgurukul.org',
  ADMIN: 'shbhuamkumar25@navgurukul.org'
};

/**
 * Server-side admin authorization middleware
 * Verifies that the authenticated user has an 'admin' or 'super_admin' role
 */
export async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.uid) {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  try {
    const userEmail = req.user.email ? req.user.email.toLowerCase() : '';
    
    // Fallback/Bootstrap check
    const isBootstrapOwner = userEmail === AUTHORIZED_ADMINS.OWNER.toLowerCase();
    const isBootstrapAdmin = userEmail === AUTHORIZED_ADMINS.ADMIN.toLowerCase();

    // Check custom claim role
    const claimRole = req.user.role;

    // Check database role
    let dbRole = null;
    try {
      const db = getFirebaseAdminDb();
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (userDoc.exists) {
        dbRole = userDoc.data().role;
      }
    } catch (dbErr) {
      console.warn('Error reading user role from DB, falling back to claims/email:', dbErr.message);
    }

    const finalRole = dbRole || claimRole;

    if (finalRole === 'admin' || finalRole === 'super_admin' || isBootstrapOwner || isBootstrapAdmin) {
      req.adminRole = (finalRole === 'super_admin' || isBootstrapOwner) ? 'SUPER_ADMIN' : 'ADMIN';
      req.adminEmail = req.user.email;
      return next();
    }
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
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
    const userEmail = req.user.email ? req.user.email.toLowerCase() : '';
    
    // Fallback/Bootstrap check
    const isBootstrapOwner = userEmail === AUTHORIZED_ADMINS.OWNER.toLowerCase();

    // Check custom claim role
    const claimRole = req.user.role;

    // Check database role
    let dbRole = null;
    try {
      const db = getFirebaseAdminDb();
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (userDoc.exists) {
        dbRole = userDoc.data().role;
      }
    } catch (dbErr) {
      console.warn('Error reading user role from DB, falling back to claims/email:', dbErr.message);
    }

    const finalRole = dbRole || claimRole;

    if (finalRole === 'super_admin' || isBootstrapOwner) {
      req.adminRole = 'SUPER_ADMIN';
      req.adminEmail = req.user.email;
      return next();
    }
  } catch (error) {
    console.error('Error in requireSuperAdmin middleware:', error);
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
  if (normalizedEmail === AUTHORIZED_ADMINS.ADMIN.toLowerCase()) {
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
