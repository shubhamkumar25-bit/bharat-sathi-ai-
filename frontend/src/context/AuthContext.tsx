import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getIdTokenResult, type User } from 'firebase/auth';
import { observeAuthState, loginWithEmail, logout, registerWithEmail, loginWithGoogle } from '@/services/auth';
import { syncProfile } from '@/services/backend';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { firestoreDb, firebaseAuth } from '@/lib/firebase';
import {
  createUserProfile,
  updateUserLoginTimestamp,
  recordLoginEvent,
} from '@/services/analytics';

type UserRole = 'guest' | 'user' | 'admin' | 'super_admin';

const ADMIN_EMAIL_ROLE_MAP: Record<string, UserRole> = {
  'muktai@navgurukul.org': 'super_admin',
  'shubhamkumar25@navgurukul.org': 'admin',
  'shubhamkumar25.bit@gmail.com': 'admin',
  'shubhamkumar25-bit@gmail.com': 'admin',
};
function resolveEmailRole(email?: string | null): UserRole | null {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.toLowerCase();
  return ADMIN_EMAIL_ROLE_MAP[normalizedEmail] ?? null;
}

type AuthContextValue = {
  user: User | null;
  role: UserRole;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [initializing, setInitializing] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    let roleUnsubscribe: (() => void) | undefined;

    const unsubscribe = observeAuthState(async (currentUser) => {
      setUser(currentUser);

      if (roleUnsubscribe) {
        roleUnsubscribe();
      }

      if (!currentUser) {
        setRole('guest');
        setInitializing(false);
        return;
      }

      try {
        const fallbackRole = resolveEmailRole(currentUser.email);
        let effectiveRole: UserRole = fallbackRole || 'user';

        if (firebaseAuth?.currentUser) {
          const tokenResult = await getIdTokenResult(firebaseAuth.currentUser, true);
          const claimRole = typeof tokenResult.claims?.role === 'string' ? tokenResult.claims.role : null;
          effectiveRole = claimRole === 'admin' || claimRole === 'super_admin' ? claimRole : effectiveRole;
        }

        if (firestoreDb) {
          try {
            const userRef = doc(firestoreDb, 'users', currentUser.uid);
            const snap = await getDoc(userRef);
            const firestoreRole = snap.exists() && typeof snap.data().role === 'string' ? snap.data().role : null;
            const resolvedRole = effectiveRole === 'user' ? firestoreRole : effectiveRole;
            const normalizedRole = resolvedRole === 'admin' || resolvedRole === 'super_admin' ? resolvedRole : 'user';

            await setDoc(userRef, {
              role: normalizedRole,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || ''
            }, { merge: true });

            roleUnsubscribe = onSnapshot(userRef, (docSnap) => {
              const docRole = docSnap.exists() && typeof docSnap.data().role === 'string' ? docSnap.data().role : null;
              const effectiveDocRole = docRole === 'admin' || docRole === 'super_admin' ? docRole : 'user';
              setRole(effectiveDocRole);
            }, (error) => {
              console.warn('Firestore role subscription restricted:', error);
            });

            setRole(normalizedRole);
          } catch (firestoreErr) {
            console.warn('Firestore profile sync restricted:', firestoreErr);
            setRole(effectiveRole);
          }
        } else {
          setRole(effectiveRole);
        }
      } catch (err) {
        const fallbackRole = resolveEmailRole(currentUser.email);
        setRole(fallbackRole || 'user');
      }
      
      setInitializing(false);
    });

    return () => {
      unsubscribe();
      if (roleUnsubscribe) {
        roleUnsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void syncProfile({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      role,
    }).catch(() => undefined);
  }, [role, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      initializing,
      login: async (email, password) => {
        const cred = await loginWithEmail(email, password);
        const loggedInUser = cred.user;
        try {
          await updateUserLoginTimestamp(loggedInUser.uid);
          await recordLoginEvent(
            loggedInUser.uid,
            loggedInUser.displayName || email.split('@')[0],
            loggedInUser.email || email
          );
        } catch (err) {
          console.warn('Analytics logging skipped:', err);
        }
      },
      register: async (email, password) => {
        const cred = await registerWithEmail(email, password);
        const newUser = cred.user;
        try {
          await createUserProfile(
            newUser.uid,
            newUser.displayName || email.split('@')[0],
            newUser.email || email
          );
        } catch (err) {
          console.warn('Profile creation skipped:', err);
        }
      },
      loginWithGoogle: async () => {
        const cred = await loginWithGoogle();
        const googleUser = cred.user;
        try {
          if (firestoreDb) {
            const userRef = doc(firestoreDb, 'users', googleUser.uid);
            const snap = await getDoc(userRef);
            if (!snap.exists()) {
              await createUserProfile(
                googleUser.uid,
                googleUser.displayName || googleUser.email?.split('@')[0] || 'User',
                googleUser.email || ''
              );
            } else {
              await updateUserLoginTimestamp(googleUser.uid);
            }
          }
          await recordLoginEvent(
            googleUser.uid,
            googleUser.displayName || googleUser.email?.split('@')[0] || 'User',
            googleUser.email || ''
          );
        } catch (err) {
          console.warn('Google login profile sync skipped:', err);
        }
      },
      signOut: async () => {
        await logout();
      },
      authModalOpen,
      setAuthModalOpen,
      authMode,
      setAuthMode,
    }),
    [initializing, role, user, authModalOpen, authMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}