import { ExternalLink, FileText, CheckCircle, Clock, AlertCircle, Bookmark, BookmarkCheck, ArrowLeft, Sparkles } from 'lucide-react';
import { SchemeMatch } from '../types/eligibility';

interface SchemeResultsProps {
  matches: SchemeMatch[];
  onStartOver: () => void;
  bookmarkedIds?: Set<string>;
  onToggleBookmark?: (scheme: any) => void;
}

export function SchemeResults({ matches, onStartOver, bookmarkedIds = new Set(), onToggleBookmark }: SchemeResultsProps) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'High Match';
      case 'medium':
        return 'Medium Match';
      case 'low':
        return 'Potential Match';
      default:
        return 'Unknown';
    }
  };

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-950 dark:text-white">No schemes found</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Based on your profile, we couldn't find any matching government schemes. 
            Try adjusting your answers or check back later for new schemes.
          </p>
          <button
            onClick={onStartOver}
            className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <ArrowLeft size={16} />
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
            <Sparkles className="h-4 w-4" />
            Your Results
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">
            {matches.length} Scheme{matches.length !== 1 ? 's' : ''} Found
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Based on your profile, these government schemes may be relevant to you.
          </p>
        </div>
        <button
          onClick={onStartOver}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <ArrowLeft size={16} />
          Start Over
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {matches.map((match, index) => (
          <article
            key={match.scheme.id}
            className="hero-frame rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getConfidenceColor(match.confidenceScore)}`}>
                      {getConfidenceLabel(match.confidenceScore)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-saffron-100 px-3 py-1 text-xs font-semibold text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400">
                      {match.scheme.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
                    {match.scheme.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {match.scheme.summary}
                  </p>
                </div>
                {onToggleBookmark && (
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(match.scheme)}
                    className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                  >
                    {bookmarkedIds.has(match.scheme.id || match.scheme.scheme_name || '') ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 text-saffron-500" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 text-saffron-500" />
                        Save
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Eligibility Reason */}
              <div className="rounded-2xl bg-saffron-50 px-4 py-3 dark:bg-saffron-950/20">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-saffron-600 mt-0.5 dark:text-saffron-400" />
                  <div>
                    <p className="text-xs font-semibold text-saffron-900 dark:text-saffron-300">Why you're eligible</p>
                    <p className="mt-1 text-sm text-saffron-800 dark:text-saffron-200">{match.eligibilityReason}</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                  <FileText className="h-4 w-4 text-saffron-500" />
                  Benefits
                </h4>
                <ul className="mt-2 space-y-1">
                  {match.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-saffron-500 mt-1">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                  <FileText className="h-4 w-4 text-saffron-500" />
                  Required Documents
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {match.requiredDocuments.map((doc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Application Process */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                  <CheckCircle className="h-4 w-4 text-saffron-500" />
                  How to Apply
                </h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{match.applicationProcess}</p>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                {match.lastDate && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Clock className="h-4 w-4" />
                    <span>Last Date: <span className="font-medium text-slate-950 dark:text-white">{match.lastDate}</span></span>
                  </div>
                )}
                <a
                  href={match.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  <ExternalLink size={16} />
                  Official Website
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <p className="font-medium text-slate-950 dark:text-white">Note:</p>
        <p className="mt-1">
          The eligibility results are based on the information you provided. Please verify the exact eligibility criteria 
          and application process on the official government websites before applying. Schemes and their criteria may change over time.
        </p>
      </div>
    </div>
  );
}
