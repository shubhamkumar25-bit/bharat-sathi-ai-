import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, ShieldCheck, AlertCircle, Building2, Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { getSchemeById, type Scheme } from '../services/schemesApi';

export function SchemeDetailPage() {
  const { schemeId } = useParams<{ schemeId: string }>();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (schemeId) {
      fetchScheme(schemeId);
    }
  }, [schemeId]);

  const fetchScheme = async (id: string) => {
    try {
      setLoading(true);
      const result = await getSchemeById(id);
      if (result.success && result.data) {
        setScheme(result.data);
      } else {
        setError(result.error || 'Failed to load scheme details');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-saffron-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading scheme details...</p>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center dark:bg-red-950/30 dark:border-red-900/40">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
            {error || 'Scheme not found'}
          </h2>
          <p className="text-red-700 dark:text-red-400">
            Please try again or go back to the schemes page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-saffron-100 text-saffron-700 text-sm font-medium rounded-full dark:bg-saffron-900/30 dark:text-saffron-400">
            {scheme.category}
          </span>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full dark:bg-slate-800 dark:text-slate-300">
            {scheme.central_state === 'central' ? 'Central' : 'State'}
          </span>
          {scheme.state && scheme.state.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full dark:bg-blue-900/30 dark:text-blue-400">
              {scheme.state.join(', ')}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white mb-4">
          {scheme.scheme_name}
        </h1>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-4">
          <Building2 className="h-5 w-5" />
          <span>{scheme.ministry}</span>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date(scheme.last_verified_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Source: {scheme.source}</span>
          </div>
        </div>
      </div>

      {/* Eligibility Criteria */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-saffron-500" />
          Eligibility Criteria
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {scheme.age_requirement && (
            <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Age Requirement</p>
              <p className="font-medium text-slate-950 dark:text-white">{scheme.age_requirement}</p>
            </div>
          )}
          {scheme.gender_requirement && (
            <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Gender Requirement</p>
              <p className="font-medium text-slate-950 dark:text-white">{scheme.gender_requirement}</p>
            </div>
          )}
          {scheme.caste_category && (
            <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Caste Category</p>
              <p className="font-medium text-slate-950 dark:text-white">{scheme.caste_category}</p>
            </div>
          )}
          {scheme.income_limit && (
            <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Income Limit</p>
              <p className="font-medium text-slate-950 dark:text-white">{scheme.income_limit}</p>
            </div>
          )}
          {scheme.rural_urban_requirement && (
            <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Area Type</p>
              <p className="font-medium text-slate-950 dark:text-white">{scheme.rural_urban_requirement}</p>
            </div>
          )}
          {scheme.occupation && scheme.occupation.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Occupation</p>
              <p className="font-medium text-slate-950 dark:text-white">{scheme.occupation.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Benefits */}
      {scheme.benefits && scheme.benefits.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 dark:bg-slate-900 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-saffron-500" />
            Benefits
          </h2>
          <ul className="space-y-3">
            {scheme.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Documents */}
      {scheme.required_documents && scheme.required_documents.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 dark:bg-slate-900 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-saffron-500" />
            Required Documents
          </h2>
          <ul className="space-y-3">
            {scheme.required_documents.map((doc, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-saffron-500 mt-1">•</span>
                <span className="text-slate-700 dark:text-slate-300">{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Application Process */}
      {scheme.application_process && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 dark:bg-slate-900 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-saffron-500" />
            Application Process
          </h2>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{scheme.application_process}</p>
        </div>
      )}

      {/* Apply Button */}
      {scheme.official_url ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 dark:bg-slate-900 dark:border-slate-800">
          <a
            href={scheme.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-saffron-500 text-white font-semibold rounded-2xl hover:bg-saffron-600 transition-colors"
          >
            Apply Now on Official Website
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 dark:bg-slate-800 dark:border-slate-700">
          <p className="text-center text-slate-600 dark:text-slate-300">
            Application link not available in the connected dataset. Please visit the official website of {scheme.ministry} for more information.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-saffron-500 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Disclaimer:</strong> This information is based on available data from {scheme.source}. Please verify all eligibility criteria, benefits, and application details on the official website before applying. Bharat Sathi AI does not guarantee the accuracy or completeness of this information.
          </span>
        </p>
      </div>
    </div>
  );
}
