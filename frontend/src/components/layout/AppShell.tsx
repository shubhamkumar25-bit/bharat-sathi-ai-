import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  MoonStar,
  SunMedium,
  UserRound,
  X,
} from "lucide-react";

import { AuthModal } from "./AuthModal";
import logo from "../../assets/logo.png.png";
import { appPaths } from "@/constants/paths";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const [language, setLanguage] = useState(
    () => localStorage.getItem("bharatsaathi-language") || "en"
  );

  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, role, signOut, setAuthModalOpen, setAuthMode } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("bharatsaathi-language", language);
  }, [language, i18n]);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
    setAlertsOpen(false);
  }, [location.pathname]);

  const primaryNavItems = [
    { label: t("home"), to: appPaths.home },
    { label: t("dashboard"), to: appPaths.dashboard },
    { label: t("chat"), to: appPaths.chat },
  ];

  const moreNavItems = [
    { label: t("resume"), to: appPaths.resumeBuilder },
    { label: t("schemes"), to: appPaths.governmentSchemes },
    { label: t("jobs"), to: "/jobs" },
    { label: t("profile"), to: appPaths.profile },
  ];

  if (role === 'admin') {
    moreNavItems.push({ label: 'Admin', to: '/admin' });
  }

  const allNavItems = [...primaryNavItems, ...moreNavItems];

  const userInitials = useMemo(() => {
    const source = user?.displayName || user?.email || "B";

    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  }, [user?.displayName, user?.email]);

  async function handleSignOut() {
    await signOut();
    navigate(appPaths.home);
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "focus-ring whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition xl:text-base",
      isActive
        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    );

  return (
    <div className="min-h-screen bg-hero-gradient text-slate-900 dark:text-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="section-shell flex min-h-[76px] items-center gap-2 py-2 lg:gap-3">
          {/* Logo */}
          <NavLink
            to={appPaths.home}
            className="flex shrink-0 items-center gap-2"
          >
            <img
              src={logo}
              alt="BharatSaathi AI Logo"
              className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12 xl:h-14 xl:w-14"
            />

            <h1 className="hidden whitespace-nowrap text-base font-bold text-slate-900 dark:text-white sm:block xl:text-lg">
              BharatSaathi AI
            </h1>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="ml-auto hidden min-w-0 items-center gap-1 lg:flex xl:gap-2">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}

            {/* More Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((current) => !current)}
                className="focus-ring flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white xl:text-base"
                aria-expanded={moreOpen}
                aria-label="Open more navigation options"
              >
                More
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    moreOpen && "rotate-180"
                  )}
                />
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full z-[100] mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  {moreNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-xl px-4 py-3 text-sm font-medium transition",
                          isActive
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-2">
            {/* Language */}
            <label className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 xl:inline-flex">
              <span className="hidden 2xl:inline">{t("language")}</span>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="max-w-[90px] bg-transparent outline-none"
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

            {/* Theme */}
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-saffron-300 hover:text-saffron-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:h-11 sm:w-11"
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } mode`}
            >
              {theme === "light" ? (
                <MoonStar className="h-5 w-5" />
              ) : (
                <SunMedium className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => setAlertsOpen((current) => !current)}
              className="focus-ring relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-saffron-300 hover:text-saffron-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:h-11 sm:w-11"
              aria-label="Toggle notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
            </button>

            {/* User Profile - Large Screen Only */}
            {user && (
              <div className="hidden max-w-[180px] items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-800 dark:bg-slate-900 2xl:flex">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-saffron-500 text-xs font-semibold text-white">
                  {userInitials}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-slate-900 dark:text-white">
                    {user.displayName || user.email || "Signed in user"}
                  </div>

                  <div className="truncate text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {role}
                  </div>
                </div>
              </div>
            )}

            {/* Login / Logout - Large Screen */}
            {user ? (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 xl:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden 2xl:inline">{t("logout")}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="focus-ring hidden items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950 xl:inline-flex"
              >
                <UserRound className="h-4 w-4" />
                <span className="hidden 2xl:inline">{t("login")}</span>
              </button>
            )}

            {/* Mobile / Tablet Menu */}
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-saffron-300 hover:text-saffron-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:h-11 sm:w-11 lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown */}
        {menuOpen && (
          <div className="max-h-[calc(100vh-76px)] overflow-y-auto border-t border-slate-200/70 bg-white px-4 py-4 dark:border-slate-800/70 dark:bg-slate-950 lg:hidden">
            <div className="section-shell grid gap-2 px-0">
              {/* Mobile Language */}
              <label className="mb-2 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <span>{t("language")}</span>

                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="max-w-[150px] bg-transparent text-right outline-none"
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

              {allNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "focus-ring rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {user ? (
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="focus-ring flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-700 transition dark:bg-red-950/30 dark:text-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="focus-ring flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition dark:bg-slate-900 dark:text-slate-200"
                >
                  <UserRound className="h-4 w-4" />
                  {t("login")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Notifications */}
        {alertsOpen && (
          <div className="border-t border-slate-200/70 bg-white px-4 py-3 dark:border-slate-800/70 dark:bg-slate-950">
            <div className="section-shell rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Notifications are ready for Firestore integration. Use the bell
              as the access point for future alerts.
            </div>
          </div>
        )}
      </header>

      <main className="section-shell">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
        <div className="section-shell grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold">BharatSaathi AI</p>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Opportunities for Every Indian. Built to guide students, job
              seekers, farmers, and workers with a simple, mobile-first
              experience.
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
      <AuthModal />
    </div>
  );
}