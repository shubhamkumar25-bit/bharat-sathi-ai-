import { useState } from 'react';
import { Search, Filter, ExternalLink, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { searchSchemes, type Scheme } from '../services/schemesApi';

export function SchemeSearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    category: '',
    central_state: '',
  });
  const [results, setResults] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearched(true);
    
    try {
      const result = await searchSchemes(query, filters);
      if (result.success) {
        setResults(result.data);
      } else {
        setError(result.error || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      setError('Failed to search schemes');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const categories = [
    'Education', 'Agriculture', 'Employment', 'Social Welfare', 
    'Health', 'Housing', 'Women & Child', 'Business', 'Pension'
  ];

  const centralStateOptions = ['central', 'state'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400 mb-4">
          <ShieldCheck className="h-4 w-4" />
          Government Schemes
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white mb-3">
          Search Government Schemes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Search through thousands of government schemes from Data.gov.in
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search schemes by name, category, or ministry..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="focus-ring w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-lg text-slate-950 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-8 py-4 bg-saffron-500 text-white font-semibold rounded-2xl hover:bg-saffron-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-950 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.central_state}
            onChange={(e) => setFilters({ ...filters, central_state: e.target.value })}
            className="px-4 py-2 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-950 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          >
            <option value="">All Levels</option>
            {centralStateOptions.map(opt => (
              <option key={opt} value={opt}>{opt === 'central' ? 'Central' : 'State'}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by state..."
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-4 py-2 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-950 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && (
        <div>
          <div className="mb-4 text-slate-600 dark:text-slate-300">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>

          {results.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">
                No schemes found
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {results.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">
                    {scheme.scheme_name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
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

                {scheme.benefits && scheme.benefits.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-950 dark:text-white mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-saffron-500" />
                      Benefits
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      {scheme.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-saffron-500 mt-1">•</span>
                          {benefit}
                        </li>
                      ))}
                      {scheme.benefits.length > 3 && (
                        <li className="text-slate-500 italic">
                          +{scheme.benefits.length - 3} more benefits
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <p className="mb-1">
                      <span className="font-medium">Data source:</span> {scheme.source}
                    </p>
                    <p>
                      <span className="font-medium">Last updated:</span> {new Date(scheme.last_verified_date).toLocaleDateString()}
                    </p>
                  </div>
                  {scheme.official_url ? (
                    <a
                      href={scheme.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-saffron-500 text-white text-sm font-semibold rounded-2xl hover:bg-saffron-600 transition-colors"
                    >
                      View Details
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No link available</span>
                  )}
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-2xl dark:bg-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-saffron-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Disclaimer:</strong> This is based on available data from {scheme.source}. Please verify eligibility and details on the official website.
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
