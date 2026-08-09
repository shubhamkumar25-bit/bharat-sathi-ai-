import { ChevronRight, ExternalLink, FileText, ShieldCheck, AlertCircle, Users, Star, ArrowUpDown } from 'lucide-react';
import { SchemeMatch } from '../types/eligibility';
import { useState } from 'react';

interface SchemeResultsCategorizedProps {
  matches: SchemeMatch[];
  onStartOver: () => void;
}

type SortOption = 'best_match' | 'most_beneficiaries' | 'highest_rated' | 'recently_updated';

export function SchemeResultsCategorized({ matches, onStartOver }: SchemeResultsCategorizedProps) {
  const [sortBy, setSortBy] = useState<SortOption>('best_match');

  // Sort matches based on selected option
  const sortedMatches = [...matches].sort((a, b) => {
    switch (sortBy) {
      case 'best_match':
        return (b.eligibilityPercentage || 0) - (a.eligibilityPercentage || 0);
      case 'most_beneficiaries':
        const aBeneficiaries = parseBeneficiaryCount(a.scheme.beneficiary_count);
        const bBeneficiaries = parseBeneficiaryCount(b.scheme.beneficiary_count);
        return bBeneficiaries - aBeneficiaries;
      case 'highest_rated':
        const aRating = a.scheme.bharat_sathi_rating || 0;
        const bRating = b.scheme.bharat_sathi_rating || 0;
        return bRating - aRating;
      case 'recently_updated':
        const aDate = new Date(a.scheme.last_verified_date || 0);
        const bDate = new Date(b.scheme.last_verified_date || 0);
        return bDate.getTime() - aDate.getTime();
      default:
        return 0;
    }
  });

  const highlyRelevant = sortedMatches.filter(m => m.matchCategory === 'highly_relevant');
  const mayBeEligible = sortedMatches.filter(m => m.matchCategory === 'may_be_eligible');
  const exploreMore = sortedMatches.filter(m => m.matchCategory === 'explore_more');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400 mb-4">
          <ShieldCheck className="h-4 w-4" />
          Government Schemes
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white mb-3">
          Based on your profile, we found {matches.length} potentially eligible schemes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          These schemes match your eligibility criteria. Please verify eligibility on official websites before applying.
        </p>
      </div>

      {/* Sorting Options */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mr-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort by:
        </span>
        {[
          { value: 'best_match', label: 'Best Match' },
          { value: 'most_beneficiaries', label: 'Most Beneficiaries' },
          { value: 'highest_rated', label: 'Highest Rated' },
          { value: 'recently_updated', label: 'Recently Updated' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value as SortOption)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === option.value
                ? 'bg-saffron-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
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

function parseBeneficiaryCount(count: any): number {
  if (!count) return 0;
  if (typeof count === 'number') return count;
  if (typeof count === 'string') {
    // Parse strings like "12.4 Lakh", "8,52,341", etc.
    const numStr = count.replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr);
    if (count.toLowerCase().includes('lakh')) {
      return num * 100000;
    }
    return num || 0;
  }
  return 0;
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

  // Format beneficiary count
  const formatBeneficiaryCount = (count: any) => {
    if (!count) return null;
    if (typeof count === 'number') {
      if (count >= 100000) {
        return `${(count / 100000).toFixed(1)} Lakh`;
      }
      return count.toLocaleString('en-IN');
    }
    if (typeof count === 'string') {
      return count;
    }
    return null;
  };

  const beneficiaryCount = formatBeneficiaryCount(scheme.beneficiary_count);
  const applicationsReceived = formatBeneficiaryCount(scheme.applications_received);
  const applicationsApproved = formatBeneficiaryCount(scheme.applications_approved);
  const amountDisbursed = scheme.amount_disbursed;

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
      </div>

      {/* Eligibility Match */}
      <div className="mb-4 p-4 bg-green-50 rounded-2xl dark:bg-green-950/20">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-green-900 dark:text-green-300">
            🎯 Eligibility Match: {match.eligibilityPercentage || 0}%
          </span>
        </div>
        <p className="text-sm text-green-800 dark:text-green-400 mb-2">
          Potentially Eligible
        </p>
        <div className="space-y-1">
          {match.eligibilityExplanation && match.eligibilityExplanation.length > 0 ? (
            match.eligibilityExplanation.slice(0, 4).map((explanation, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
                <span className="text-green-600 dark:text-green-500 mt-0.5">✓</span>
                <span>{explanation}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-green-700 dark:text-green-400">
              {match.eligibilityReason}
            </p>
          )}
        </div>
      </div>

      {/* Government Beneficiary/Usage Statistics */}
      {(beneficiaryCount || applicationsReceived || applicationsApproved || amountDisbursed) && (
        <div className="mb-4 p-4 bg-blue-50 rounded-2xl dark:bg-blue-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-900 dark:text-blue-300">
              👥 Government Beneficiary/Usage Data
            </span>
          </div>
          <div className="space-y-2 text-sm">
            {beneficiaryCount && (
              <div className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-400">Beneficiaries:</span>
                <span className="font-semibold text-blue-900 dark:text-blue-300">{beneficiaryCount}</span>
              </div>
            )}
            {applicationsReceived && (
              <div className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-400">Applications Received:</span>
                <span className="font-semibold text-blue-900 dark:text-blue-300">{applicationsReceived}</span>
              </div>
            )}
            {applicationsApproved && (
              <div className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-400">Applications Approved:</span>
                <span className="font-semibold text-blue-900 dark:text-blue-300">{applicationsApproved}</span>
              </div>
            )}
            {amountDisbursed && (
              <div className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-400">Amount Disbursed:</span>
                <span className="font-semibold text-blue-900 dark:text-blue-300">{amountDisbursed}</span>
              </div>
            )}
            <div className="pt-2 border-t border-blue-200 dark:border-blue-800 mt-2">
              {scheme.beneficiary_data_period && (
                <p className="text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Period:</span> {scheme.beneficiary_data_period}
                </p>
              )}
              {scheme.beneficiary_data_source && (
                <p className="text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Source:</span> {scheme.beneficiary_data_source}
                </p>
              )}
              {scheme.beneficiary_data_last_updated && (
                <p className="text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Last Updated:</span> {scheme.beneficiary_data_last_updated}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bharat Sathi User Rating */}
      <div className="mb-4 p-4 bg-yellow-50 rounded-2xl dark:bg-yellow-950/20">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="font-semibold text-yellow-900 dark:text-yellow-300">
            ⭐ Bharat Sathi User Rating
          </span>
        </div>
        {scheme.bharat_sathi_rating ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
              {scheme.bharat_sathi_rating.toFixed(1)}/5
            </span>
            {scheme.bharat_sathi_rating_count && (
              <span className="text-sm text-yellow-700 dark:text-yellow-400">
                Based on {scheme.bharat_sathi_rating_count} Bharat Sathi user ratings
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            No ratings yet
          </p>
        )}
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
