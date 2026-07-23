import { useMemo, useState } from 'react';
import { BookOpen, GraduationCap, MessageCircleMore, Sparkles, Upload } from 'lucide-react';
import { generateTaskOutput } from '@/services/backend';

const quickActions = [
  { label: 'Find scholarships', icon: GraduationCap },
  { label: 'Improve resume', icon: Upload },
  { label: 'Ask career questions', icon: MessageCircleMore },
  { label: 'Plan study roadmap', icon: BookOpen },
];

export function StudentSupportPage() {
  const [stage, setStage] = useState('College');
  const [goal, setGoal] = useState('Get an internship and a strong first job');
  const [skills, setSkills] = useState('English, Communication, React');
  const [language, setLanguage] = useState('Hindi');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const progress = useMemo(() => Math.min(95, 40 + skills.split(',').filter(Boolean).length * 12), [skills]);

  async function generatePlan() {
    setLoading(true);
    setError('');
    try {
      const result = await generateTaskOutput({
        task: 'Student Support',
        prompt: `
Create a student success plan in simple ${language === 'Hindi' ? 'Hindi' : 'English'}.

Stage: ${stage}
Goal: ${goal}
Skills: ${skills}

Include:
1. scholarship suggestions
2. skill gap plan
3. study roadmap
4. resume advice
5. interview preparation
6. weekly action plan
        `,
      });

      setOutput(result.answer.trim());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Student plan generation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 py-8">
      <section className="hero-frame p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-saffron-50 px-4 py-2 text-sm font-semibold text-saffron-700 dark:border-saffron-900/60 dark:bg-saffron-950/60 dark:text-saffron-300">
          <BookOpen className="h-4 w-4" />
          Student Support
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Everything a student needs to move from learning to opportunity.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Scholarships, career planning, resume support, and guided next steps for school, college, and fresh graduates.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Student profile</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-200">Study stage</span>
              <input value={stage} onChange={(event) => setStage(event.target.value)} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-200">Goal</span>
              <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={4} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-200">Core skills</span>
              <textarea value={skills} onChange={(event) => setSkills(event.target.value)} rows={4} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-200">Language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option>Hindi</option>
                <option>English</option>
              </select>
            </label>
          </div>

          <button type="button" onClick={() => void generatePlan()} disabled={loading} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generating...' : 'Generate student plan'}
          </button>

          {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}
        </section>

        <section className="hero-frame p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Progress</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{progress}%</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Support level</div>
              <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Guided coaching</div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <div key={action.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <div className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white"><Icon className="h-4 w-4 text-saffron-500" />{action.label}</div>
                </div>
              );
            })}
          </div>

          {output ? (
            <div className="mt-6 rounded-3xl border border-saffron-200 bg-saffron-50 p-5 text-sm leading-7 text-slate-700 dark:border-saffron-900/50 dark:bg-saffron-950/40 dark:text-slate-200">
              <div className="font-semibold text-slate-950 dark:text-white">AI student plan</div>
              <p className="mt-2 whitespace-pre-wrap">{output}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
