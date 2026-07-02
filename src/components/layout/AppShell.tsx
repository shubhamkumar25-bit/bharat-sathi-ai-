import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, MoonStar, Sparkles, SunMedium, X } from 'lucide-react';
import { appPaths } from '@/constants/paths';
import { useTheme } from

'@/context/ThemeContext';
import { cn } from '@/utils/cn';

const navItems = [
  { label: 'Home', to: appPaths.home },
  { label: 'Dashboard', to: appPaths.dashboard },
  { label: 'AI Chat', to: appPaths.chat },
  { label: 'Resume Builder', to: appPaths.resumeBuilder },
  { label: 'Schemes', to: appPaths.governmentSchemes },
  { label: 'Login', to: appPaths.login }
];

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-hero-gradient text-slate-900 dark:text-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="section-shell flex items-center justify-between gap-4 py-4">
          <NavLink to={appPaths.home} className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saffron-500 text-white shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg sm:text-xl">
              BharatSaathi <span className="text-saffron-600 dark:text-saffron-500">AI</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'focus-ring rounded-full px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-saffron-300 hover:text-saffron-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-saffron-700 dark:hover:text-saffron-400"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <MoonStar className="h-5 w-5" /> : <SunMedium className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-saffron-300 hover:text-saffron-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-saffron-700 dark:hover:text-saffron-400 lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-200/70 bg-white px-4 py-3 dark:border-slate-800/70 dark:bg-slate-950 lg:hidden">
            <div className="section-shell grid gap-2 px-0">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'focus-ring rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main className="section-shell">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
        <div className="section-shell grid gap-6 py-10 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-lg font-semibold">BharatSaathi AI</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Opportunities for Every Indian. Built to guide students, job seekers, farmers, and workers with a simple, mobile-first experience.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>AI Chat</span>
            <span>Voice Assistant</span>
            <span>Resume Builder</span>
            <span>Government Schemes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}