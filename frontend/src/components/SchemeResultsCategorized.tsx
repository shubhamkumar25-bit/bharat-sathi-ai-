import { ShieldCheck, ExternalLink, CheckCircle, AlertCircle, Info, ArrowLeft } from 'lucide-react';
import { SchemeMatch } from '../types/eligibility';

interface SchemeResultsCategorizedProps {
  matches: SchemeMatch[];
  onStartOver: () => void;
}

export function SchemeResultsCategorized({ matches, onStartOver }: SchemeResultsCategorizedProps) {
  const highlyRelevant = matches.filter(m => m.matchCategory === 'highly_relevant');
  const mayBeEligible = matches.filter(m => m.matchCategory === 'may_be_eligible');
  const exploreMore = matches.filter(m => m.matchCategory === 'explore_more');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400 mb-4">
          <ShieldCheck className="h-4 w-4" />
          Government Schemes
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white mb-3">
          Government Schemes You May Be Eligible For
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Based on your profile, here are the schemes that match your eligibility
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 dark:bg-amber-950/30 dark:border-amber-900">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <Info className="inline h-4 w-4 mr-1" />
          Eligibility is based on the information you provided. Please verify the latest eligibility criteria on the official government website before applying.
        </p>
      </div>

      {/* Highly Relevant */}
      {highlyRelevant.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Highly Relevant ({highlyRelevant.length})
            </h2>
          </div>
          <div className="space-y-4">
            {highlyRelevant.map((match) => (
              <SchemeCard key={match.scheme.scheme_name} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* May Be Eligible */}
      {mayBeEligible.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              You May Be Eligible ({mayBeEligible.length})
            </h2>
          </div>
          <div className="space-y-4">
            {mayBeEligible.map((match) => (
              <SchemeCard key={match.scheme.scheme_name} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Explore More */}
      {exploreMore.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Explore More ({exploreMore.length})
            </h2>
          </div>
          <div className="space-y-4">
            {exploreMore.map((match) => (
              <SchemeCard key={match.scheme.scheme_name} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {matches.length === 0 && (
        <div className="text-center py-12">
          <ShieldCheck className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-2">
            No matching schemes found
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Try adjusting your profile or explore all schemes
          </p>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={onStartOver}
          className="focus-ring w-full sm:w-auto px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="inline h-5 w-5 mr-2" />
          Start Over
        </button>
      </div>
    </div>
  );
}

function SchemeCard({ match }: { match: SchemeMatch }) {
  const scheme = match.scheme;
  const confidenceColors = {
    high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      {/* Scheme Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-1">
            {scheme.scheme_name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {scheme.ministry} • {scheme.central_state === 'central' ? 'Central' : 'State'} Scheme
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${confidenceColors[match.confidenceScore]}`}>
          {match.confidenceScore === 'high' ? 'High Match' : match.confidenceScore === 'medium' ? 'Medium Match' : 'Explore'}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-600 dark:text-slate-300 mb-4">
        {scheme.category} scheme with {scheme.benefits.length} key benefits
      </p>

      {/* AI Explanation */}
      <div className="bg-saffron-50 rounded-xl p-4 mb-4 dark:bg-saffron-950/20">
        <p className="text-sm font-semibold text-saffron-700 dark:text-saffron-400 mb-2">
          Why this scheme matches you:
        </p>
        <ul className="space-y-1">
          {match.eligibilityExplanation.map((explanation, index) => (
            <li key={index} className="text-sm text-slate-700 dark:text-slate-300 flex items-start">
              <span className="text-saffron-500 mr-2">✓</span>
              {explanation}
            </li>
          ))}
        </ul>
      </div>

      {/* Benefits */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-950 dark:text-white mb-2">Benefits:</h4>
        <ul className="space-y-1">
          {scheme.benefits.slice(0, 3).map((benefit, index) => (
            <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-start">
              <span className="text-saffron-500 mr-2">•</span>
              {benefit}
            </li>
          ))}
        </ul>
        {scheme.benefit_amount && (
          <p className="text-sm font-semibold text-saffron-600 dark:text-saffron-400 mt-2">
            Benefit Amount: {scheme.benefit_amount}
          </p>
        )}
      </div>

      {/* Required Documents */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-950 dark:text-white mb-2">Required Documents:</h4>
        <div className="flex flex-wrap gap-2">
          {scheme.required_documents.slice(0, 4).map((doc, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {doc}
            </span>
          ))}
        </div>
      </div>

      {/* Application Process */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-950 dark:text-white mb-2">Application Process:</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {scheme.application_process}
        </p>
      </div>

      {/* Source & Last Verified */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span>Source: {scheme.source}</span>
        <span>Last Verified: {new Date(scheme.last_verified_date).toLocaleDateString()}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={scheme.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring flex-1 px-4 py-3 bg-saffron-500 text-white font-semibold rounded-xl hover:bg-saffron-600 transition-colors text-center"
        >
          <ExternalLink className="inline h-4 w-4 mr-2" />
          Apply Now
        </a>
        <a
          href={scheme.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors text-center"
        >
          Check Eligibility
        </a>
      </div>
    </div>
  );
}
