import { useMemo, useState } from 'react';
import { Search, ExternalLink, Loader2, Sparkles, Briefcase, Award, BookOpen, UserCheck, ShieldAlert, Filter, X } from 'lucide-react';
import { generateTaskOutput } from '@/services/backend';

const countries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'United Arab Emirates',
  'Singapore',
];

const languages = [
  'English',
  'Hindi',
  'Hinglish',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Kannada',
  'Malayalam',
  'Urdu',
];

const experienceLevels = ['Fresher', '0-1 Year', '1-2 Years', '2-3 Years', '3-5 Years', '5+ Years'];

type LiveJob = {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  type?: string;
  description?: string;
  applyUrl?: string | null;
  source?: string;
};

type AiRecommendation = {
  matchingRoles?: string[];
  whyMatched?: string;
  missingSkills?: string[];
  suggestedSkills?: string[];
  resumeTips?: string;
  interviewPrep?: string;
  searchKeywords?: string[];
  jobCategories?: string[];
};

type JobSearchResult = {
  isLive?: boolean;
  liveJobs?: LiveJob[];
  aiRecommendation?: AiRecommendation;
};

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
  const [searchResult, setSearchResult] = useState<JobSearchResult | null>(null);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [keyword, setKeyword] = useState('');

  const searchContext = useMemo(() => {
    return {
      country,
      stateName: stateName.trim(),
      city: city.trim(),
      qualification: qualification.trim(),
      skills: skills.trim(),
      experience: experience.trim(),
      jobType,
      language,
      keyword: keyword.trim(),
    };
  }, [country, stateName, city, qualification, skills, experience, jobType, language, keyword]);

  const queryTerms = useMemo(() => {
    return [
      searchContext.keyword,
      searchContext.skills,
      searchContext.city,
      searchContext.stateName,
      searchContext.country,
      searchContext.jobType,
    ]
      .filter(Boolean)
      .join(' ');
  }, [searchContext]);

  async function searchJobs() {
    try {
      setLoading(true);
      setError('');
      setSearchResult(null);

      const payloadString = JSON.stringify(searchContext);

      const result = await generateTaskOutput({
        task: 'Job Search',
        prompt: payloadString,
        language: searchContext.language,
      });

      let parsed: JobSearchResult = {};
      try {
        parsed = JSON.parse(result.answer) as JobSearchResult;
      } catch {
        parsed = { aiRecommendation: { whyMatched: result.answer } };
      }

      setSearchResult(parsed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Job Search failed. Please try again.';
      setError(errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
        ? 'Unable to connect to the server. Please check your internet connection and ensure the backend is running.'
        : errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const liveJobs = Array.isArray(searchResult?.liveJobs) ? searchResult.liveJobs : [];
  const aiRec = searchResult?.aiRecommendation || {};
  const isLive = Boolean(searchResult?.isLive && liveJobs.length > 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-8 px-4 sm:px-6">
      <section className="hero-frame p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">
          AI Job Search & Career Guidance
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Find matching job roles, ATS skill recommendations, interview guidance, and direct verified job portals based on your profile.
        </p>
      </section>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className="flex-1">
            <input
              className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              placeholder="Search by job title, keyword, or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Country</label>
           <select
  value={country}
  onChange={(e) => setCountry(e.target.value)}
>
  {countries.map((item) => (
    <option key={item} value={item}>
      {item}
    </option>
  ))}
</select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">State / Region</label>
              <input
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                placeholder="e.g. Maharashtra, Delhi"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">City</label>
              <input
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                placeholder="e.g. Mumbai, Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Skills</label>
              <input
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                placeholder="e.g. React, JavaScript"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Qualification</label>
              <input
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                placeholder="e.g. B.Tech, BCA"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Experience Level</label>
              <select
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="">Select experience</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Job Type</label>
              <select
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">AI Language</label>
              <select
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          onClick={() => void searchJobs()}
          disabled={loading}
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          {loading ? 'Searching for relevant opportunities...' : 'Perform Intelligent Search'}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-300">
          <Loader2 className="animate-spin text-saffron-500" size={40} />
          <p className="font-medium animate-pulse">Searching for relevant opportunities...</p>
        </div>
      )}

      {searchResult && !loading && (
        <div className="space-y-8">
          {/* SECTION 1: VERIFIED LIVE JOBS (IF AVAILABLE) */}
          {isLive ? (
            <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-xl dark:border-emerald-900/40 dark:bg-slate-900">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                  <Briefcase size={24} /> Verified Live Vacancies ({liveJobs.length})
                </h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Verified Data
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {liveJobs.map((job, idx) => (
                  <div key={idx} className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{job.title || 'Not specified'}</h3>
                      <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <p><strong>Company:</strong> {job.company || 'Not specified'}</p>
                        <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
                        <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
                        <p><strong>Type:</strong> {job.type || 'Not specified'}</p>
                        <p><strong>Source:</strong> {job.source || 'Not specified'}</p>
                      </div>
                      <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {job.description || 'Not specified'}
                      </p>
                    </div>

                    {job.applyUrl ? (
                      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Apply / View Job <ExternalLink size={14} />
                        </a>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <span className="font-semibold text-slate-950 dark:text-white">Note:</span> Live API database is currently not connected. Below are personalized AI recommendations and direct search portals for your exact parameters.
            </div>
          )}

          {/* SECTION 2: AI CAREER RECOMMENDATIONS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-950 dark:text-white">
                <Sparkles className="text-saffron-500" size={24} /> AI Profile Analysis & Career Guidance ({language})
              </h2>
              <span className="rounded-full bg-saffron-100 px-3 py-1 text-xs font-semibold text-saffron-800 dark:bg-saffron-950 dark:text-saffron-300">
                AI Recommendations
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Matching Roles */}
              {Array.isArray(aiRec.matchingRoles) && aiRec.matchingRoles.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
                    <UserCheck className="text-emerald-500" size={18} /> Recommended Job Roles
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {aiRec.matchingRoles.map((role, i) => (
                      <span key={i} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {role}
                      </span>
                    ))}
                  </div>
                  {aiRec.whyMatched ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{aiRec.whyMatched}</p>
                  ) : null}
                </div>
              )}

              {/* Skills Analysis */}
              {((Array.isArray(aiRec.missingSkills) && aiRec.missingSkills.length > 0) || (Array.isArray(aiRec.suggestedSkills) && aiRec.suggestedSkills.length > 0)) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
                    <Award className="text-saffron-500" size={18} /> Skills & Learning Roadmap
                  </h3>
                  {Array.isArray(aiRec.suggestedSkills) && aiRec.suggestedSkills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">Skills to Learn Next:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {aiRec.suggestedSkills.map((sk, i) => (
                          <span key={i} className="rounded-full bg-saffron-50 px-3 py-1 text-xs font-semibold text-saffron-700 dark:bg-saffron-950/60 dark:text-saffron-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {Array.isArray(aiRec.missingSkills) && aiRec.missingSkills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">Missing Skills for High Pay:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {aiRec.missingSkills.map((sk, i) => (
                          <span key={i} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resume Tips */}
              {aiRec.resumeTips && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
                    <BookOpen className="text-blue-500" size={18} /> ATS Resume Advice
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{aiRec.resumeTips}</p>
                </div>
              )}

              {/* Interview Preparation */}
              {aiRec.interviewPrep && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
                    <ShieldAlert className="text-purple-500" size={18} /> Interview Preparation Tips
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{aiRec.interviewPrep}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: DIRECT VERIFIED EXTERNAL PORTAL LINKS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Direct One-Click Verified Job Portals</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Click below to view live vacancies matching your exact inputs directly on trusted job platforms:
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(queryTerms)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Search on LinkedIn <ExternalLink size={14} />
              </a>

              <a
                href={`https://www.naukri.com/${encodeURIComponent(queryTerms.toLowerCase().replace(/\s+/g, '-'))}-jobs`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Search on Naukri <ExternalLink size={14} />
              </a>

              <a
                href={`https://in.indeed.com/jobs?q=${encodeURIComponent(queryTerms)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Search on Indeed <ExternalLink size={14} />
              </a>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(queryTerms + ' jobs')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                Search Google Jobs <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}