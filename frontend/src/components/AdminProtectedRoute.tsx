import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-saffron-500 border-t-transparent mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role !== 'admin' && role !== 'super_admin') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
        <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 shadow-sm dark:border-red-900/30 dark:bg-red-950/15 max-w-md w-full">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            You do not have the required administrator privileges to view this page.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full rounded-2xl bg-saffron-500 hover:bg-saffron-600 px-4 py-3 text-sm font-bold text-white transition shadow-lg shadow-saffron-600/20"
          >
            Go to User Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
