import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { observeAuthState, loginWithEmail, logout, registerWithEmail } from '@/services/auth';
import { syncProfile } from '@/services/backend';

type UserRole = 'guest' | 'student' | 'farmer' | 'job_seeker' | 'admin';

type AuthContextValue = {
  user: User | null;
  role: UserRole;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((currentUser) => {
      setUser(currentUser);
      setInitializing(false);

      if (!currentUser) {
        setRole('guest');
        return;
      }

      void currentUser.getIdTokenResult().then((tokenResult) => {
        const claimRole = String(tokenResult.claims.role || '').toLowerCase();

        if (claimRole === 'admin' || claimRole === 'student' || claimRole === 'farmer' || claimRole === 'job_seeker') {
          setRole(claimRole as UserRole);
          return;
        }

        setRole('student');
      }).catch(() => setRole('student'));
    });

    return unsubscribe;
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
      signOut: async () => {
        await logout();
      }
    }),
    [initializing, role, user]
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