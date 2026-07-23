import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { observeAuthState, loginWithEmail, logout, registerWithEmail, loginWithGoogle } from '@/services/auth';
import { syncProfile } from '@/services/backend';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { firestoreDb } from '@/lib/firebase';

type UserRole = 'guest' | 'user' | 'admin';

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
        if (firestoreDb) {
          const userRef = doc(firestoreDb, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          
          if (!snap.exists() || !snap.data().role) {
            await setDoc(userRef, { 
              role: 'user',
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || ''
            }, { merge: true });
          } else {
            await setDoc(userRef, { 
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || ''
            }, { merge: true });
          }

          roleUnsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().role) {
              setRole(docSnap.data().role === 'admin' ? 'admin' : 'user');
            } else {
              setRole('user');
            }
          });

        } else {
          setRole('user');
        }
      } catch (err) {
        setRole('user');
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
        await loginWithEmail(email, password);
      },
      register: async (email, password) => {
        await registerWithEmail(email, password);
      },
      loginWithGoogle: async () => {
        await loginWithGoogle();
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