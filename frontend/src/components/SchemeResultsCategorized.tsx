import { ChevronRight, ExternalLink, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
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
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400 mb-4">
          <ShieldCheck className="h-4 w-4" />
          Government Schemes
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white mb-3">
          Based on your profile, we found {matches.length} potentially relevant schemes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          These schemes match your eligibility criteria. Please verify eligibility on official websites before applying.
        </p>
      </div>

      <div className="space-y-8">
        {highlyRelevant.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Highly Relevant ({highlyRelevant.length})
            </h2>
            <div className="space-y-4">
              {highlyRelevant.map((match, index) => (
                <SchemeCard key={index} match={match} />
              ))}
            </div>
          </section>
        )}

        {mayBeEligible.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              You May Be Eligible ({mayBeEligible.length})
            </h2>
            <div className="space-y-4">
              {mayBeEligible.map((match, index) => (
                <SchemeCard key={index} match={match} />
              ))}
            </div>
          </section>
        )}

        {exploreMore.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Explore More ({exploreMore.length})
            </h2>
            <div className="space-y-4">
              {exploreMore.map((match, index) => (
                <SchemeCard key={index} match={match} />
              ))}
            </div>
          </section>
        )}

        {matches.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">
              No schemes found matching your profile
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Try adjusting your profile criteria or explore all available schemes.
            </p>
            <button
              onClick={onStartOver}
              className="px-6 py-3 bg-saffron-500 text-white font-semibold rounded-2xl hover:bg-saffron-600 transition-colors"
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onStartOver}
          className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

function SchemeCard({ match }: { match: SchemeMatch }) {
  const scheme = match.scheme;
  
  // Format the last verified date
  const lastVerified = scheme.last_verified_date ? 
    new Date(scheme.last_verified_date).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : 'Not available';
  
  // Get the data source
  const dataSource = scheme.source || 'Open Government Data Platform';
  
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">
            {scheme.scheme_name}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 bg-saffron-100 text-saffron-700 text-xs font-medium rounded-full dark:bg-saffron-900/30 dark:text-saffron-400">
              {scheme.category}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full dark:bg-slate-800 dark:text-slate-300">
              {scheme.central_state === 'central' ? 'Central' : 'State'}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full dark:bg-slate-800 dark:text-slate-300">
              {scheme.ministry}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          match.confidenceScore === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          match.confidenceScore === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {match.confidenceScore === 'high' ? 'High Match' : match.confidenceScore === 'medium' ? 'Medium Match' : 'Low Match'}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-950 dark:text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-saffron-500" />
          Why it matches
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {match.eligibilityReason}
        </p>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-950 dark:text-white mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-saffron-500" />
          Benefits
        </h4>
        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
          {scheme.benefits && scheme.benefits.length > 0 ? (
            scheme.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-saffron-500 mt-1">•</span>
                {benefit}
              </li>
            ))
          ) : (
            <li className="text-slate-500 italic">Benefits information not available in the connected dataset.</li>
          )}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-950 dark:text-white mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-saffron-500" />
          Required Documents
        </h4>
        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
          {scheme.required_documents && scheme.required_documents.length > 0 ? (
            scheme.required_documents.map((doc, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-saffron-500 mt-1">•</span>
                {doc}
              </li>
            ))
          ) : (
            <li className="text-slate-500 italic">Document information not available in the connected dataset.</li>
          )}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-950 dark:text-white mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-saffron-500" />
          Application Process
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {scheme.application_process || 'Application process information not available in the connected dataset.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p className="mb-1">
            <span className="font-medium">Data source:</span> {dataSource}
          </p>
          <p>
            <span className="font-medium">Last dataset update:</span> {lastVerified}
          </p>
        </div>
        {scheme.official_url ? (
          <a
            href={scheme.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-saffron-500 text-white text-sm font-semibold rounded-2xl hover:bg-saffron-600 transition-colors"
          >
            Apply Now
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-xs text-slate-500 italic">Application link not available in the connected dataset.</span>
        )}
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-2xl dark:bg-slate-800">
        <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-saffron-500 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Disclaimer:</strong> This is based on available data from {dataSource}. Please verify eligibility and details on the official website before applying.
          </span>
        </p>
      </div>
    </div>
  );
}
