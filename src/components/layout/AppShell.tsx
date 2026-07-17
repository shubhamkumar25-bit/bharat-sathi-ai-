import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, MoonStar, SunMedium, UserRound, X } from 'lucide-react';
import logo from "../../assets/logo.png.png";
import { appPaths } from '@/constants/paths';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';


export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  
  
const [language, setLanguage] = useState(
  () => localStorage.getItem("bharatsaathi-language") || "en"
);

const { t, i18n } = useTranslation();

useEffect(() => {
  i18n.changeLanguage(language);
}, [language, i18n]);

const navItems = [
  { label: t("home"), to: appPaths.home },
  { label: t("dashboard"), to: appPaths.dashboard },
  { label: t("chat"), to: appPaths.chat },
  { label: t("resume"), to: appPaths.resumeBuilder },
  { label: t("schemes"), to: appPaths.governmentSchemes },
  { label: t("jobs"), to: "/jobs" },
  { label: t("profile"), to: appPaths.profile },
];
  
  const { theme, toggleTheme } = useTheme();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userInitials = useMemo(() => {
    const source = user?.displayName || user?.email || 'B';
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }, [user?.displayName, user?.email]);

  useEffect(() => {
    setMenuOpen(false);
    setAlertsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
  localStorage.setItem("bharatsaathi-language", language);
}, [language]);

  async function handleSignOut() {
    await signOut();
    navigate(appPaths.home);
  }

  return (
    <div className="min-h-screen bg-hero-gradient text-slate-900 dark:text-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="section-shell flex items-center justify-between gap-4 py-4">
          <NavLink
  to={appPaths.home}
  className="flex items-center gap-3"
>
  <img
  src={logo}
  alt="Logo"
  style={{ width: "60px", height: "60px" }}
/>

  <div>
    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
      BharatSaathi AI
    </h1>

    {/* <p className="text-xs text-gray-500 dark:text-gray-400">
      {t("tagline")}
    </p> */}
  </div>
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
            <label className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 md:inline-flex">
              <span className="text-slate-400">
{t("language")}
</span>
              <select
  value={language}
  onChange={(event) => {
    const lang = event.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  }}
>
                <option value="en">{t("english")}</option>
<option value="hi">{t("hindi")}</option>
<option value="ta">{t("tamil")}</option>
<option value="te">{t("telugu")}</option>
<option value="bn">{t("bengali")}</option>
<option value="gu">{t("gujarati")}</option>
<option value="mr">मराठी</option>
<option value="pa">ਪੰਜਾਬੀ</option>
<option value="kn">ಕನ್ನಡ</option>
<option value="ml">മലയാളം</option>
<option value="ur">اردو</option>
              </select>
            </label>

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
              onClick={() => setAlertsOpen((current) => !current)}
              className="focus-ring relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-saffron-300 hover:text-saffron-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-saffron-700 dark:hover:text-saffron-400"
              aria-label="Toggle notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
            </button>

            {user ? (
              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900 lg:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron-500 text-xs font-semibold text-white">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900 dark:text-white">{user.email || user.displayName || 'Signed in user'}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{role}</div>
                </div>
              </div>
            ) : null}

            {user ? (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-red-700 dark:hover:text-red-300 lg:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            ) : (
              <Link to={appPaths.login} className="hidden items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950 lg:inline-flex">
                <UserRound className="h-4 w-4" />
                {t("login")}
              </Link>
            )}

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
              {user ? (
                <button type="button" onClick={() => void handleSignOut()} className="focus-ring rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-700 transition dark:bg-red-950/30 dark:text-red-200">
                  {t("logout")}
                </button>
              ) : (
                <NavLink to={appPaths.login} className={({ isActive }) => cn('focus-ring rounded-2xl px-4 py-3 text-sm font-medium transition', isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200')}>
                  {t("login")}
                </NavLink>
              )}
            </div>
          </div>
        ) : null}

        {alertsOpen ? (
          <div className="border-t border-slate-200/70 bg-white px-4 py-3 dark:border-slate-800/70 dark:bg-slate-950 lg:hidden">
            <div className="section-shell rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Notifications are ready for Firestore integration. Use the bell as the access point for future alerts.
            </div>
          </div>
        ) : null}
      </header>

      <main className="section-shell">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
        <div className="section-shell grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold">BharatSaathi AI</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Opportunities for Every Indian. Built to guide students, job seekers, farmers, and workers with a simple, mobile-first experience.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link to={appPaths.chat}>{t("chat")}</Link>
            <Link to={appPaths.resumeBuilder}>{t("resume")}</Link>
            <Link to={appPaths.governmentSchemes}>{t("schemes")}</Link>
            <Link to="/jobs">{t("jobs")}</Link>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
           <span>{t("support")}</span>
<span>{t("privacy")}</span>
<span>{t("terms")}</span>
<span>{t("contact")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}