import { useEffect, useMemo, useState } from "react";
import { generateTaskOutput } from "@/services/backend";
import { ShieldCheck, FileSearch, MapPin, Users, Search, Bookmark, BookmarkCheck, Filter, X, Loader2, Sparkles } from 'lucide-react';
import { deleteSchemeBookmark, loadBookmarks, loadSchemes, saveSchemeBookmark } from '@/services/backend';
import { EligibilityFlow } from '@/components/EligibilityFlow';
import { SchemeResults } from '@/components/SchemeResults';
import { matchSchemes } from '@/utils/schemeMatcher';
import { EligibilityProfile, SchemeMatch } from '@/types/eligibility';

const categoryOptions = ['all', 'Education', 'Agriculture', 'Employment', 'Social Welfare', 'Health', 'Housing', 'Women & Child'];
const occupationOptions = ['all', 'student', 'teenager_student', 'adult', 'senior_citizen', 'farmer', 'unemployed', 'employed', 'self_employed', 'women', 'other'];

// Generate age options from 3 to 100+
const ageOptions = Array.from({ length: 98 }, (_, i) => i + 3).map(age => ({ value: age.toString(), label: age.toString() }));
ageOptions.push({ value: '100+', label: '100+' });

type Scheme = {
  id: string;
  title: string;
  category: string;
  summary: string;
  eligibility?: string;
  documents?: string[];
};

type Bookmark = {
  id: string;
  schemeId: string;
  title: string;
  category?: string;
  summary?: string;
};

export function GovernmentSchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [occupation, setOccupation] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stateName, setStateName] = useState("Uttar Pradesh");
  const [age, setAge] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  // Smart eligibility flow state
  const [useSmartFlow, setUseSmartFlow] = useState(false);
  const [eligibilityProfile, setEligibilityProfile] = useState<EligibilityProfile | null>(null);
  const [matchedSchemes, setMatchedSchemes] = useState<SchemeMatch[]>([]);

  const states = [
    "All India",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
  ];

  const bookmarkedIds = useMemo(() => new Set(bookmarks.map((item) => item.schemeId)), [bookmarks]);

  async function refreshSchemes() {
    try {
      const response = await loadSchemes({
        query,
        category,
        occupation,
        state: stateName,
      });
      setSchemes((response as { schemes: Scheme[] }).schemes || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schemes");
    }
  }

  async function refreshBookmarks() {
    try {
      const response = await loadBookmarks();
      setBookmarks((response as { bookmarks: Bookmark[] }).bookmarks || []);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    }
  }

  useEffect(() => {
    void Promise.all([refreshSchemes(), refreshBookmarks()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void refreshSchemes();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, category, occupation, stateName]);
async function getAISchemes() {
  try {
    setAiLoading(true);
    setError("");

    const result = await generateTaskOutput({
      task: "Government Schemes",
      prompt: `
You are BharatSaathi AI.

Suggest Indian Government Schemes.

State: ${stateName}

Age: ${age}

Occupation: ${occupation}

Search: ${query}

Return:

1. Scheme Name

2. Benefits

3. Eligibility

4. Documents Required

5. Official Website

6. How to Apply

7. Last Date

Detect the language of the search input and respond in the exact same language.
`,
    });

    setAiResult(result.answer);
  } catch (error) {
    setError(error instanceof Error ? error.message : "AI recommendation failed");
  } finally {
    setAiLoading(false);
  }
}
  async function toggleBookmark(scheme: Scheme) {
    if (bookmarkedIds.has(scheme.id)) {
      const existing = bookmarks.find((item) => item.schemeId === scheme.id);
      if (existing) {
        await deleteSchemeBookmark(existing.id);
      }
    } else {
      await saveSchemeBookmark({
        schemeId: scheme.id,
        title: scheme.title,
        category: scheme.category,
        summary: scheme.summary,
        eligibility: scheme.eligibility,
        documents: scheme.documents,
      });
    }

    await refreshBookmarks();
  }

  const handleEligibilityComplete = (profile: EligibilityProfile) => {
    setEligibilityProfile(profile);
    const matches = matchSchemes(profile);
    setMatchedSchemes(matches);
  };

  const handleStartOver = () => {
    setEligibilityProfile(null);
    setMatchedSchemes([]);
    setUseSmartFlow(false);
  };

  const handleToggleBookmark = (scheme: any) => {
    toggleBookmark(scheme);
  };

  // Auto-update occupation based on age
  const handleAgeChange = (selectedAge: string) => {
    setAge(selectedAge);
    
    const ageNum = parseInt(selectedAge);
    if (!isNaN(ageNum)) {
      if (ageNum >= 3 && ageNum <= 18) {
        setOccupation('teenager_student');
      } else if (ageNum >= 19 && ageNum <= 59) {
        setOccupation('adult');
      } else if (ageNum >= 60) {
        setOccupation('senior_citizen');
      }
    } else if (selectedAge === '100+') {
      setOccupation('senior_citizen');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-8 px-4 sm:px-6">
      <section className="hero-frame p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
          <ShieldCheck className="h-4 w-4" />
          Government Schemes
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">Filter the right schemes for the right person.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Search, filter, and bookmark the schemes that match the user profile. Saved items are synced to Firestore.
        </p>
        
        {/* Toggle between Smart Flow and Traditional Search */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => setUseSmartFlow(!useSmartFlow)}
            className={`focus-ring inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
              useSmartFlow
                ? 'bg-saffron-500 text-white hover:bg-saffron-600'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {useSmartFlow ? 'Smart Eligibility Check' : 'Try Smart Eligibility Check'}
          </button>
          {!useSmartFlow && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              AI-powered step-by-step eligibility checker
            </span>
          )}
        </div>
      </section>

      {/* Smart Eligibility Flow */}
      {useSmartFlow && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {!eligibilityProfile ? (
            <EligibilityFlow onComplete={handleEligibilityComplete} />
          ) : (
            <SchemeResults
              matches={matchedSchemes}
              onStartOver={handleStartOver}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
            />
          )}
        </section>
      )}

      {/* Traditional Search - Hidden when using smart flow */}
      {!useSmartFlow && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">🤖 AI Government Scheme Finder</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

        {showFilters && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Age</label>
              <select
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                value={age}
                onChange={(e) => handleAgeChange(e.target.value)}
              >
                <option value="">Select Age</option>
                {ageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">State</label>
              <select
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              >
                {states.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Occupation</label>
              <select
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              >
                <option value="all">All</option>
                <option value="student">Student</option>
                <option value="teenager_student">Teenager / Student</option>
                <option value="adult">Adult</option>
                <option value="senior_citizen">Senior Citizen</option>
                <option value="farmer">Farmer</option>
                <option value="unemployed">Unemployed</option>
                <option value="employed">Employed</option>
                <option value="self_employed">Self Employed</option>
                <option value="women">Woman</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                className="focus-ring w-full rounded-2xl bg-slate-950 p-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                onClick={getAISchemes}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
                {aiLoading ? "Searching..." : "Find Schemes"}
              </button>
            </div>
          </div>
        )}

        {aiResult && (
          <div className="mt-6 rounded-2xl border border-saffron-200 bg-saffron-50 p-5 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:border-saffron-900/50 dark:bg-saffron-950/40 dark:text-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-950 dark:text-white">AI Recommendation</span>
              <button
                onClick={() => setAiResult("")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>
            {aiResult}
          </div>
        )}
      </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <Search className="h-4 w-4 text-saffron-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search schemes, documents, benefits..." />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <Filter className="h-4 w-4 text-saffron-500" />
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full bg-transparent text-sm outline-none">
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <MapPin className="h-4 w-4 text-saffron-500" />
            <select value={occupation} onChange={(event) => setOccupation(event.target.value)} className="w-full bg-transparent text-sm outline-none">
              {occupationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <ShieldCheck className="h-4 w-4 text-saffron-500" />
            <select value={stateName} onChange={(e) => setStateName(e.target.value)} className="w-full bg-transparent text-sm outline-none">
              {states.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {!useSmartFlow && (
        <>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-300">
              <Loader2 className="animate-spin text-saffron-500" size={40} />
              <p className="font-medium animate-pulse">Loading schemes...</p>
            </div>
          ) : schemes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              No schemes found matching your filters. Try adjusting your search criteria.
            </div>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schemes.map((scheme) => (
                <article key={scheme.id} className="hero-frame p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                      <FileSearch className="h-6 w-6" />
                    </div>
                    <button type="button" onClick={() => void toggleBookmark(scheme)} className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950">
                      {bookmarkedIds.has(scheme.id) ? <BookmarkCheck className="h-4 w-4 text-saffron-500" /> : <Bookmark className="h-4 w-4 text-saffron-500" />}
                      {bookmarkedIds.has(scheme.id) ? 'Bookmarked' : 'Bookmark'}
                    </button>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{scheme.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{scheme.summary}</p>
                  {scheme.eligibility ? <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Eligibility: {scheme.eligibility}</p> : null}
                  {scheme.documents?.length ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Documents: {scheme.documents.join(', ')}</p> : null}
                </article>
              ))}
            </section>
          )}

          <section className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <Users className="h-4 w-4 text-saffron-500" />
              Saved Bookmarks
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.length ? bookmarks.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <div className="font-semibold text-slate-950 dark:text-white">{item.title}</div>
                  <div className="mt-1 text-slate-500 dark:text-slate-400">{item.category}</div>
                </div>
              )) : (
                <div className="col-span-full rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  No bookmarked schemes yet.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}