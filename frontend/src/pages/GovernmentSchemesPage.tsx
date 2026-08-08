import { useEffect, useMemo, useState } from "react";
import { generateTaskOutput } from "@/services/backend";
import { ShieldCheck, FileSearch, MapPin, Users, Search, Bookmark, BookmarkCheck, Filter, X, Loader2, Sparkles } from 'lucide-react';
import { deleteSchemeBookmark, loadBookmarks, loadSchemes, saveSchemeBookmark } from '@/services/backend';
import { EligibilityFlow } from '@/components/EligibilityFlow';
import { SchemeResults } from '@/components/SchemeResults';
import { SchemeOnboarding } from '@/components/SchemeOnboarding';
import { SchemeResultsCategorized } from '@/components/SchemeResultsCategorized';
import { matchSchemesEnhanced } from '@/utils/enhancedSchemeMatcher';
import { matchSchemes as matchSchemesApi } from '@/services/schemesApi';
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
  const [useNewOnboarding, setUseNewOnboarding] = useState(true);
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

  const handleEligibilityComplete = async (profile: EligibilityProfile) => {
    setEligibilityProfile(profile);
    // Use database-driven matching via API
    const result = await matchSchemesApi(profile);
    if (result.success) {
      setMatchedSchemes(result.matches);
    } else {
      // Fallback to enhanced matcher if API fails
      const matches = matchSchemesEnhanced(profile);
      setMatchedSchemes(matches);
    }
  };

  const handleStartOver = () => {
    setEligibilityProfile(null);
    setMatchedSchemes([]);
    setUseSmartFlow(false);
    setUseNewOnboarding(true);
  };

  const handleNewOnboardingComplete = async (profile: EligibilityProfile) => {
    setEligibilityProfile(profile);
    // Use database-driven matching via API
    const result = await matchSchemesApi(profile);
    if (result.success) {
      setMatchedSchemes(result.matches);
    } else {
      // Fallback to enhanced matcher if API fails
      const matches = matchSchemesEnhanced(profile);
      setMatchedSchemes(matches);
    }
  };

  const handleSkipOnboarding = () => {
    setUseNewOnboarding(false);
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
      {/* New Onboarding Flow */}
      {useNewOnboarding && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {!eligibilityProfile ? (
            <SchemeOnboarding onComplete={handleNewOnboardingComplete} onSkip={handleSkipOnboarding} />
          ) : (
            <SchemeResultsCategorized matches={matchedSchemes} onStartOver={handleStartOver} />
          )}
        </section>
      )}
    </div>
  );
}