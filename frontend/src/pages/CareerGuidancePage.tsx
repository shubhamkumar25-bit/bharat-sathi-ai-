import { useMemo, useState } from 'react';
import { ArrowRight, Brain, GraduationCap, Sparkles, Target } from 'lucide-react';
import { generateTaskOutput } from '@/services/backend';

const roadmapSeeds = [
  'Clarify your target role and country.',
  'Map the exact skills employers expect.',
  'Build 2 to 3 proof projects.',
  'Prepare interview answers and a portfolio.',
];

export function CareerGuidancePage() {
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [skills, setSkills] = useState('React, TypeScript, UI Design');
  const [experience, setExperience] = useState('1-2 years');
  const [education, setEducation] = useState('B.Tech / BCA / Diploma');
  const [language, setLanguage] = useState('Hindi');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const careerScore = useMemo(() => {
    const signalCount = [targetRole, skills, experience, education].filter(Boolean).length;
    return Math.min(96, 48 + signalCount * 10);
  }, [education, experience, skills, targetRole]);

  async function generateRoadmap() {
    setLoading(true);
    setError('');
    try {
      const result = await generateTaskOutput({
        task: 'Career Guidance',
        prompt: `
Create a practical career roadmap in simple ${language === 'Hindi' ? 'Hindi' : 'English'} for this user.

Target Role: ${targetRole}
Skills: ${skills}
Experience: ${experience}
Education: ${education}

Return a concise action plan with:
1. Skill gaps
2. Learning roadmap
3. Portfolio ideas
4. Interview preparation
5. Salary direction
6. Next 30 days plan
        `,
      });

      setOutput(result.answer.trim());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Career roadmap generation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 py-8">
      <section className="hero-frame p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
          <Brain className="h-4 w-4" />
          Career Guidance
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Build a practical roadmap for the next role.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Use BharatSaathi AI to identify skill gaps, sharpen your resume, and prepare for interviews with a structured plan.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Career inputs</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ['Target role', targetRole, setTargetRole],
              ['Core skills', skills, setSkills],
              ['Experience', experience, setExperience],
              ['Education', education, setEducation],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{String(label)}</span>
                <input
                  value={String(value)}
                  onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                  className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>
            ))}
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-200">Preferred language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option>Hindi</option>
                <option>English</option>
              </select>
            </label>
          </div>

          <button type="button" onClick={() => void generateRoadmap()} disabled={loading} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generating...' : 'Generate roadmap'}
          </button>

          {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}
        </section>

        <section className="hero-frame p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Career score</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{careerScore}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Focus</div>
              <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{targetRole}</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {roadmapSeeds.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          {output ? (
            <div className="mt-6 rounded-3xl border border-saffron-200 bg-saffron-50 p-5 text-sm leading-7 text-slate-700 dark:border-saffron-900/50 dark:bg-saffron-950/40 dark:text-slate-200">
              <div className="mb-2 flex items-center gap-2 font-semibold text-slate-950 dark:text-white"><Target className="h-4 w-4" /> AI roadmap</div>
              <p className="whitespace-pre-wrap">{output}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
