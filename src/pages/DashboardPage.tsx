import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { appPaths } from '@/constants/paths';
import { ArrowRight, Bell, Bot, FileText, LayoutDashboard, ShieldCheck, Users } from 'lucide-react';
import { loadDashboard } from '@/services/backend';

const cards = [
  { title: 'AI Chat', description: 'Answer questions in simple Hindi.', icon: Bot, to: appPaths.chat },
  { title: 'Resume Builder', description: 'Generate a professional resume draft.', icon: FileText, to: appPaths.resumeBuilder },
  { title: 'Schemes', description: 'Explore relevant government programs.', icon: ShieldCheck, to: appPaths.governmentSchemes }
];

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<{
    profile: Record<string, unknown> | null;
    conversations: Array<{ id: string; title?: string; messages?: Array<{ role?: string; content?: string }> }>;
    resumes: Array<{ id: string; name?: string; template?: string }>;
    bookmarks: Array<{ id: string; title?: string; category?: string }>;
    activity: Array<{ id: string; type?: string; title?: string }>;
  }>({ profile: null, conversations: [], resumes: [], bookmarks: [], activity: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadDashboard()
      .then((response) => {
        setDashboard(response as typeof dashboard);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = useMemo(() => [
    { label: 'Chats', value: dashboard.conversations.length || 0 },
    { label: 'Resumes', value: dashboard.resumes.length || 0 },
    { label: 'Bookmarks', value: dashboard.bookmarks.length || 0 },
    { label: 'Activity', value: dashboard.activity.length || 0 },
  ], [dashboard.activity.length, dashboard.bookmarks.length, dashboard.conversations.length, dashboard.resumes.length]);

  const recentActivity = dashboard.activity.length
    ? dashboard.activity
    : [{ id: 'empty-activity', title: 'No recent activity yet.' }];

  const previousChats = dashboard.conversations.length
    ? dashboard.conversations
    : [{ id: 'empty-chat', title: 'No conversations yet.' }];

  const savedResumes = dashboard.resumes.length
    ? dashboard.resumes
    : [{ id: 'empty-resume', name: 'No resumes yet.', template: '' }];

  const savedBookmarks = dashboard.bookmarks.length
    ? dashboard.bookmarks
    : [{ id: 'empty-bookmark', title: 'No bookmarks yet.' }];

  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Your central workspace for BharatSaathi AI.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {loading ? 'Loading your profile, chat history, resumes, and bookmarks...' : 'Use this hub to jump into chat, resume building, and scheme discovery.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {summaryCards.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="font-semibold text-slate-950 dark:text-white">{item.value}</div>
              <div className="text-slate-500 dark:text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <section className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4 text-saffron-500" />
            User Profile
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="font-semibold text-slate-950 dark:text-white">{String(dashboard.profile?.displayName || dashboard.profile?.email || 'Guest user')}</div>
              <div className="mt-1 text-slate-500 dark:text-slate-400">{dashboard.profile?.uid ? `UID: ${String(dashboard.profile.uid)}` : 'Sign in to sync your profile.'}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="font-semibold text-slate-950 dark:text-white">Recent Activity</div>
              <div className="mt-3 space-y-2">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-saffron-500" />
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.title} to={card.to} className="glass group rounded-3xl p-6 transition hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-saffron-600 dark:text-saffron-400">
                  Open
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </section>
      </div>

      <section className="hero-frame p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          <Bell className="h-4 w-4 text-saffron-500" />
          Recent chats, resumes, and saved schemes
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-semibold text-slate-950 dark:text-white">Previous Chats</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {previousChats.map((item) => (
                <div key={item.id} className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">{item.title}</div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-semibold text-slate-950 dark:text-white">Saved Resumes</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {savedResumes.map((item) => (
                <div key={item.id} className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">{item.name || item.template}</div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-semibold text-slate-950 dark:text-white">Saved Schemes</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {savedBookmarks.map((item) => (
                <div key={item.id} className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">{item.title}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}