import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing, setAuthModalOpen } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="section-shell py-10 text-sm text-slate-500 dark:text-slate-400">Loading your session...</div>;
  }

  if (!user) {
    return (
      <div className="section-shell flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950 max-w-md w-full">
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">Please sign in or create an account to access this page.</p>
          <button 
            onClick={() => setAuthModalOpen(true)} 
            className="focus-ring w-full rounded-2xl bg-saffron-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-saffron-700 shadow-lg shadow-saffron-600/20"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return children;
}