import { useMemo, useState } from 'react';
import { Search, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { generateTaskOutput } from '@/services/backend';

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "United Arab Emirates",
  "Singapore"
];

export function JobSearchPage() {
  const [country, setCountry] = useState('India');
  const [stateName, setStateName] = useState('');
  const [city, setCity] = useState('');
  const [qualification, setQualification] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Array<{ title?: string; company?: string; location?: string; salary?: string; type?: string; description?: string; linkedin?: string; naukri?: string; indeed?: string }>>([]);
  const [rawJsonResult, setRawJsonResult] = useState('');
  const [error, setError] = useState('');

  const searchContext = useMemo(() => {
    return {
      country,
      stateName,
      city,
      qualification,
      skills,
      experience,
      jobType,
      language,
    };
  }, [country, city, experience, jobType, language, qualification, skills, stateName]);

  function parseJobResponse(answer: string) {
    const trimmed = answer.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    try {
      return JSON.parse(trimmed) as { jobs?: Array<Record<string, unknown>> };
    } catch {
      return { jobs: [] };
    }
  }

  async function searchJobs() {
    try {
      setLoading(true);
      setError('');
      setJobs([]);
      setRawJsonResult('');

      const result = await generateTaskOutput({
        task: 'Job Search',
        prompt: `
Return a strict JSON object with a jobs array. No markdown, no commentary.

Criteria:
- Country: ${searchContext.country}
- State: ${searchContext.stateName || 'Any'}
- City: ${searchContext.city || 'Any'}
- Qualification: ${searchContext.qualification || 'Any'}
- Skills: ${searchContext.skills || 'Any'}
- Experience: ${searchContext.experience || 'Any'}
- Job Type: ${searchContext.jobType}
- Output Language: ${searchContext.language}

Schema:
{
  "jobs": [
    {
      "title": "",
      "company": "",
      "location": "",
      "salary": "",
      "type": "",
      "description": "",
      "linkedin": "",
      "naukri": "",
      "indeed": ""
    }
  ]
}
        `,
      });

      setRawJsonResult(result.answer);
      const parsedData = parseJobResponse(result.answer);
      setJobs((parsedData.jobs || []) as typeof jobs);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Job Fetch Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-10 px-4">
      <section className="hero-frame p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          AI Job Search
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Search opportunities through the backend Gemini pipeline, keep the response structured, and preserve the fallback links for manual browsing.
        </p>
      </section>

      <div className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Country</label>
          <select
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {countries.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">State / Region</label>
          <input
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            placeholder="e.g. Maharashtra, California"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">City</label>
          <input
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            placeholder="e.g. Mumbai, London"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Skills</label>
          <input
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            placeholder="e.g. React, Node.js, Python"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Qualification</label>
          <input
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            placeholder="e.g. B.Tech Computer Science"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Experience Required</label>
          <input
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            placeholder="e.g. Freshers, 3 Years"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Job Commitment</label>
          <select
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option>Full Time</option>
            <option>Part Time</option>
            <option>Internship</option>
            <option>Remote</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">AI Preferred Language</label>
          <select
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => void searchJobs()}
        disabled={loading}
        className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        {loading ? 'Generating job matches...' : 'Perform Intelligent Search'}
      </button>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}

      {(rawJsonResult || loading) && (
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">AI Matches</h2>
            {rawJsonResult && (
              <button
                onClick={() => void navigator.clipboard.writeText(rawJsonResult)}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <Copy size={16} /> Copy Raw Data
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 dark:text-slate-300">
              <Loader2 className="animate-spin text-saffron-500" size={40} />
              <p className="font-medium animate-pulse">Running structured job generation...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {jobs.map((job: any, index: number) => (
                <div key={index} className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-950 dark:text-white">{job.title}</h3>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <p><strong>Company:</strong> {job.company}</p>
                      <p><strong>Location:</strong> {job.location}</p>
                      <p><strong>Salary:</strong> {job.salary || 'Not Disclosed'}</p>
                      <p><strong>Type:</strong> {job.type}</p>
                    </div>
                    <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {job.description}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4 text-xs font-semibold dark:border-slate-800">
                    {job.linkedin && (
                      <a href={job.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700">
                        LinkedIn <ExternalLink size={12} />
                      </a>
                    )}
                    {job.naukri && (
                      <a href={job.naukri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-3 py-2 text-white transition hover:bg-orange-700">
                        Naukri <ExternalLink size={12} />
                      </a>
                    )}
                    {job.indeed && (
                      <a href={job.indeed} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-3 py-2 text-white transition hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700">
                        Indeed <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              No matching data objects could be verified. Modify inputs and try again.
            </div>
          )}

          <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fallback Global Directories</h4>
            <div className="flex flex-wrap gap-3">
              <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent([country, stateName, city, skills, experience, jobType].filter(Boolean).join(' '))}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-800 px-4 py-2.5 text-sm text-white transition hover:bg-slate-900">
                  Search LinkedIn
                </a>
              <a href={`https://www.naukri.com/${encodeURIComponent([country, stateName, city, skills, experience, jobType].filter(Boolean).join(' '))}-jobs`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-800 px-4 py-2.5 text-sm text-white transition hover:bg-slate-900">
                  Search Naukri
                </a>
              <a href={`https://in.indeed.com/jobs?q=${encodeURIComponent([country, stateName, city, skills, experience, jobType].filter(Boolean).join(' '))}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-800 px-4 py-2.5 text-sm text-white transition hover:bg-slate-900">
                  Search Indeed
                </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}