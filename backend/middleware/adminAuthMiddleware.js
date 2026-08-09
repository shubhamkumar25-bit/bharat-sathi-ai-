import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

// Authorized admin emails
const AUTHORIZED_ADMINS = {
  OWNER: 'muktai@navgurukul.org',
  ADMIN: 'shbhuamkumar25@navgurukul.org'
};

/**
 * Server-side admin authorization middleware
 * Verifies that the authenticated user is one of the authorized admin accounts
 */
export async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.email) {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  const userEmail = req.user.email.toLowerCase();
  
  // Check if user is authorized admin
  const isOwner = userEmail === AUTHORIZED_ADMINS.OWNER.toLowerCase();
  const isAdmin = userEmail === AUTHORIZED_ADMINS.ADMIN.toLowerCase();

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  // Add admin role to request for use in controllers
  req.adminRole = isOwner ? 'OWNER' : 'ADMIN';
  req.adminEmail = req.user.email;

  next();
}

/**
 * Owner-only authorization middleware
 * Only the OWNER (muktai@navgurukul.org) can access these routes
 */
export async function requireOwner(req, res, next) {
  if (!req.user || !req.user.email) {
    return res.status(403).json({ message: 'Forbidden: Owner access required.' });
  }

  const userEmail = req.user.email.toLowerCase();
  
  if (userEmail !== AUTHORIZED_ADMINS.OWNER.toLowerCase()) {
    return res.status(403).json({ message: 'Forbidden: Owner access required.' });
  }

  req.adminRole = 'OWNER';
  req.adminEmail = req.user.email;

  next();
}

/**
 * Get admin role for a user email
 */
export function getAdminRole(email) {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase();
  
  if (normalizedEmail === AUTHORIZED_ADMINS.OWNER.toLowerCase()) {
    return 'OWNER';
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
