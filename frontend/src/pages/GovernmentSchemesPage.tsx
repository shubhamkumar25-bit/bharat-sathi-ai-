import { useEffect, useMemo, useState } from "react";
import { generateTaskOutput } from "@/services/backend";
import { ShieldCheck, FileSearch, MapPin, Users, Search, Bookmark, BookmarkCheck, Filter } from 'lucide-react';
import { deleteSchemeBookmark, loadBookmarks, loadSchemes, saveSchemeBookmark } from '@/services/backend';

const categoryOptions = ['all', 'Education', 'Agriculture', 'Employment', 'Social Welfare'];
const occupationOptions = ['all', 'student', 'farmer', 'worker', 'entrepreneur'];

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

const [stateName, setStateName] = useState("Uttar Pradesh");
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
const [age, setAge] = useState("");
const [aiResult, setAiResult] = useState("");
const [aiLoading, setAiLoading] = useState(false);

  const bookmarkedIds = useMemo(() => new Set(bookmarks.map((item) => item.schemeId)), [bookmarks]);

  async function refreshSchemes() {
    const response = await loadSchemes({
  query,
  category,
  occupation,
  state: stateName,
});
    setSchemes((response as { schemes: Scheme[] }).schemes || []);
  }

  async function refreshBookmarks() {
    const response = await loadBookmarks();
    setBookmarks((response as { bookmarks: Bookmark[] }).bookmarks || []);
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

Give answer in simple Hindi.
`,
    });

    setAiResult(result.answer);
  } catch (error) {
    alert("AI recommendation failed.");
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

  return (
    <div className="space-y-6 py-8">
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
          <ShieldCheck className="h-4 w-4" />
          Government Schemes
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Filter the right schemes for the right person.</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Search, filter, and bookmark the schemes that match the user profile. Saved items are synced to Firestore.
        </p>
      </section>
<section className="hero-frame p-6">

<h2 className="mb-6 text-2xl font-bold">

🤖 AI Government Scheme Finder

</h2>

<div className="grid gap-4 md:grid-cols-4">



<input
className="rounded-xl border p-3"
placeholder="Age"
value={age}
onChange={(e)=>setAge(e.target.value)}
/>
<select
  className="rounded-xl border p-3"
  value={stateName}
  onChange={(e) => setStateName(e.target.value)}
>
  {states.map((item) => (
    <option key={item} value={item}>
      {item}
    </option>
  ))}
</select>
<select
className="rounded-xl border p-3"
value={occupation}
onChange={(e)=>setOccupation(e.target.value)}
>

<option value="student">Student</option>

<option value="farmer">Farmer</option>

<option value="worker">Worker</option>

<option value="entrepreneur">Entrepreneur</option>

</select>

<button
className="rounded-xl bg-blue-600 p-3 text-white"
onClick={getAISchemes}
>

{aiLoading ? "Searching..." : "Find Schemes"}

</button>

</div>

{
aiResult && (

<div className="mt-6 rounded-xl border p-5 whitespace-pre-wrap">

{aiResult}

</div>

)

}

</section>
      <section className="hero-frame p-6">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
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
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {(loading ? [] : schemes).map((scheme) => (
          <article key={scheme.id} className="hero-frame p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                <FileSearch className="h-6 w-6" />
              </div>
              <button type="button" onClick={() => void toggleBookmark(scheme)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950">
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

      <section className="glass rounded-3xl p-6">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          <Users className="h-4 w-4 text-saffron-500" />
          Saved Bookmarks
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {bookmarks.length ? bookmarks.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <div className="font-semibold text-slate-950 dark:text-white">{item.title}</div>
              <div className="mt-1 text-slate-500 dark:text-slate-400">{item.category}</div>
            </div>
          )) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              No bookmarked schemes yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}