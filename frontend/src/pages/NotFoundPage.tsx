import { Link } from 'react-router-dom';
import { appPaths } from '@/constants/paths';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 text-center">
      <div className="max-w-xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">404</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">This page does not exist.</h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Use the navigation to go back to the BharatSaathi AI home screen.</p>
        <Link to={appPaths.home} className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
          Go home
        </Link>
      </div>
    </div>
  );
}