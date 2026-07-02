import { CheckCircle2, FileText, Sparkles } from 'lucide-react';

const fields = ['Name', 'Education', 'Skills', 'Experience'];

export function ResumeBuilderPage() {
  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
          <FileText className="h-4 w-4" />
          Resume Builder
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Collect the candidate details before generating a professional resume.</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          This screen gives you the input flow and layout for Day 4. Add Gemini text generation later without changing the UX.
        </p>

        <div className="hero-frame space-y-4 p-6">
          {fields.map((field) => (
            <div key={field}>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{field}</label>
              <input className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white" placeholder={`Enter ${field.toLowerCase()}`} />
            </div>
          ))}
          <button type="button" className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            <Sparkles className="h-4 w-4" />
            Generate Resume
          </button>
        </div>
      </section>

      <section className="glass rounded-3xl p-6">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="h-4 w-4 text-saffron-500" />
          Resume preview
        </div>
        <div className="mt-5 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <div className="text-2xl font-semibold text-slate-950 dark:text-white">Candidate Name</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Career Objective | Contact Details</div>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Skills</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">Communication, MS Office, Basic AI tools, Teamwork</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Experience</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">Add internships, projects, or previous work experience here.</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Education</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">12th Pass, Diploma, Graduation, or other qualification details.</p>
          </div>
        </div>
      </section>
    </div>
  );
}