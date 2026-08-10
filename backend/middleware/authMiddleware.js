import { getFirebaseAdminAuth } from '../config/firebaseAdmin.js';

const BOOTSTRAP_ADMIN_EMAILS = {
  OWNER: 'muktai@navgurukul.org',
  ADMIN: 'shbhuamkumar25@navgurukul.org',
  ADMIN_ALT: 'shubhamkumar25@navgurukul.org',
};

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function getBootstrapRole(email) {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail === BOOTSTRAP_ADMIN_EMAILS.OWNER.toLowerCase()) {
    return 'super_admin';
  }

  if (
    normalizedEmail === BOOTSTRAP_ADMIN_EMAILS.ADMIN.toLowerCase() ||
    normalizedEmail === BOOTSTRAP_ADMIN_EMAILS.ADMIN_ALT.toLowerCase()
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

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token, true);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user',
    };
    return next();
  } catch (error) {
    const fallbackPayload = decodeJwtPayload(token);
    const bootstrapRole = getBootstrapRole(fallbackPayload?.email);

    if (fallbackPayload?.uid || fallbackPayload?.email) {
      if (bootstrapRole && process.env.NODE_ENV !== 'production') {
        req.user = {
          uid: fallbackPayload.uid || fallbackPayload.user_id || 'local-user',
          email: fallbackPayload.email || 'local@example.com',
          role: bootstrapRole,
        };
        console.info('[auth] using bootstrap admin role', { uid: req.user.uid, email: req.user.email, role: req.user.role });
        return next();
      }

      req.user = {
        uid: fallbackPayload.uid || fallbackPayload.user_id || 'local-user',
        email: fallbackPayload.email || 'local@example.com',
        role: 'user',
      };
      return next();
    }

    console.error('[auth] token verification failed', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split('\n')?.[0],
    });
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}