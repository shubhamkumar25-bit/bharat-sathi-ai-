import { getFirebaseAdminAuth } from '../config/firebaseAdmin.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user',
    };
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}