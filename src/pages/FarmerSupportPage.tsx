import { useMemo, useState } from 'react';
import { CloudSun, LandPlot, MapPin, Sparkles, Sprout } from 'lucide-react';
import { generateTaskOutput } from '@/services/backend';

const farmerCards = [
  { title: 'Weather guidance', description: 'Plan irrigation and spraying around the forecast.', icon: CloudSun },
  { title: 'Crop suggestions', description: 'Choose crops for season, soil, and budget.', icon: Sprout },
  { title: 'Market awareness', description: 'Check selling windows and pricing signals.', icon: LandPlot },
  { title: 'Local schemes', description: 'Discover agri support and subsidy options.', icon: MapPin },
];

export function FarmerSupportPage() {
  const [crop, setCrop] = useState('Wheat');
  const [stateName, setStateName] = useState('Maharashtra');
  const [season, setSeason] = useState('Kharif');
  const [issue, setIssue] = useState('Need fertilizer and disease guidance');
  const [language, setLanguage] = useState('Hindi');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const supportScore = useMemo(() => Math.min(96, 50 + [crop, stateName, season, issue].filter(Boolean).length * 9), [crop, issue, season, stateName]);

  async function generateAdvice() {
    setLoading(true);
    setError('');
    try {
      const result = await generateTaskOutput({
        task: 'Farmer Support',
        prompt: `
Create practical farming guidance in simple ${language === 'Hindi' ? 'Hindi' : 'English'}.

Crop: ${crop}
State: ${stateName}
Season: ${season}
Issue: ${issue}

Include:
1. crop and soil guidance
2. fertilizer advice
3. disease warning signs
4. irrigation timing
5. market and scheme advice
6. next 7 days action plan
        `,
      });

      setOutput(result.answer.trim());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Farmer guidance generation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 py-8">
      <section className="hero-frame p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-saffron-50 px-4 py-2 text-sm font-semibold text-saffron-700 dark:border-saffron-900/60 dark:bg-saffron-950/60 dark:text-saffron-300">
          <Sprout className="h-4 w-4" />
          Farmer Support
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Farming advice tuned for Indian conditions.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Ask for crop, weather, fertilizer, scheme, and market guidance from a single guided screen built for mobile use.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Field details</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Crop</span>
              <input value={crop} onChange={(event) => setCrop(event.target.value)} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">State</span>
              <input value={stateName} onChange={(event) => setStateName(event.target.value)} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Season</span>
              <select value={season} onChange={(event) => setSeason(event.target.value)} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option>Kharif</option>
                <option>Rabi</option>
                <option>Summer</option>
                <option>Monsoon</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option>Hindi</option>
                <option>English</option>
              </select>
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-200">Issue or request</span>
              <textarea value={issue} onChange={(event) => setIssue(event.target.value)} rows={4} className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </label>
          </div>

          <button type="button" onClick={() => void generateAdvice()} disabled={loading} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generating...' : 'Generate farming advice'}
          </button>

          {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}
        </section>

        <section className="hero-frame p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Support score</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{supportScore}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Crop</div>
              <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{crop}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {farmerCards.map((card) => {
              const Icon = card.icon;

              return (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <div className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white"><Icon className="h-4 w-4 text-saffron-500" />{card.title}</div>
                  <p className="mt-2 leading-6">{card.description}</p>
                </div>
              );
            })}
          </div>

          {output ? (
            <div className="mt-6 rounded-3xl border border-saffron-200 bg-saffron-50 p-5 text-sm leading-7 text-slate-700 dark:border-saffron-900/50 dark:bg-saffron-950/40 dark:text-slate-200">
              <div className="font-semibold text-slate-950 dark:text-white">AI farming guidance</div>
              <p className="mt-2 whitespace-pre-wrap">{output}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
