import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { appPaths } from '@/constants/paths';

export function LoginPage() {
  const { login, register, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isRegisterMode = location.pathname === appPaths.register;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate(appPaths.dashboard, { replace: true });
    }
  }, [navigate, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegisterMode) {
        await register(email, password);
      } else {
        await login(email, password);
      }

      navigate(appPaths.dashboard, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-10rem)] items-center py-10 lg:grid-cols-[1fr_0.9fr] lg:gap-8">
      <section className="space-y-5 pb-8 lg:pb-0">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">{isRegisterMode ? 'Create Account' : 'Login'}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {isRegisterMode ? 'Create your BharatSaathi AI account.' : 'Sign in for saved resumes, chat history, and dashboard access.'}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Secure Firebase Authentication keeps your chats, resumes, and bookmarks linked to your account.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to={appPaths.home} className="inline-flex text-sm font-semibold text-saffron-600 hover:text-saffron-700 dark:text-saffron-400">
            Back to home
          </Link>
          <Link to={isRegisterMode ? appPaths.login : appPaths.register} className="inline-flex text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            {isRegisterMode ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </Link>
        </div>
      </section>

      <section className="hero-frame p-6 sm:p-8">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white" placeholder="name@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white" placeholder="••••••••" />
          </div>
          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}
          <button type="submit" className="focus-ring w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100" disabled={loading}>
            {loading ? 'Please wait...' : isRegisterMode ? 'Create account' : 'Continue'}
          </button>
        </form>
      </section>
    </div>
  );
}