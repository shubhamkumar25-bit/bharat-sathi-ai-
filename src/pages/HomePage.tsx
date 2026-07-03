import { Link } from 'react-router-dom';
import { appPaths } from '@/constants/paths';
import { ArrowRight, Bot, FileText, ShieldCheck, Sparkles, Mic, GraduationCap } from 'lucide-react';

const highlights = [
  {
    icon: Bot,
    title: 'AI Chatbot',
    description: 'Simple Hindi and English answers for students, job seekers, farmers, and workers.'
  },
  {
    icon: Mic,
    title: 'Voice Support',
    description: 'Speech input and output for hands-free guidance on any device.'
  },
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'Create a structured resume and career-ready summary in minutes.'
  },
  {
    icon: ShieldCheck,
    title: 'Scheme Finder',
    description: 'Find relevant government schemes with eligibility and document guidance.'
  }
];

const roadmap = [
  'Day 1: Core website structure',
  'Day 2: Gemini AI chat',
  'Day 3: Voice assistant',
  'Day 4: Resume builder + guidance',
  'Day 5: Scheme finder + final demo'
];

export function HomePage() {
  return (
    <div className="space-y-10 py-8 sm:py-12">
      <section className="hero-frame relative overflow-hidden p-8 sm:p-10 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.16),transparent_36%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-saffron-50 px-4 py-2 text-sm font-medium text-saffron-700 dark:border-saffron-900/60 dark:bg-saffron-950/50 dark:text-saffron-300">
              <Sparkles className="h-4 w-4" />
              Opportunities for Every Indian
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              BharatSaathi AI helps people find guidance, jobs, schemes, and next steps in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
              A ready foundation for AI chat, voice support, career guidance, resume building, and government scheme discovery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={appPaths.chat}
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Start AI Chat
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={appPaths.dashboard}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-saffron-300 hover:text-saffron-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-saffron-700"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/75 p-5 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="rounded-2xl bg-slate-950 p-5 text-white dark:bg-slate-950">
              <p className="text-sm text-slate-300">Project focus</p>
              <p className="mt-2 text-2xl font-semibold">AI + Voice + Career Tools</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Designed for students, workers, and farmers with simple Hindi-first support.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['6+', 'Ready screens'],
                ['1', 'Responsive shell'],
                ['5', ' days']
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className="glass rounded-3xl p-6 transition hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            <GraduationCap className="h-4 w-4 text-saffron-500" />
            Day-by-day build plan
          </div>
          <div className="mt-6 space-y-3">
            {roadmap.map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-frame p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">Submission focus</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">What the judges should see</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            The current structure shows the product story clearly: discover opportunities, ask questions, generate a resume, and search schemes.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {['Problem clarity', 'Simple Hindi UX', 'Mobile-first design', 'Future AI integrations'].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}