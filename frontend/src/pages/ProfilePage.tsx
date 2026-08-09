import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, UserRound, Sparkles } from 'lucide-react';
import { loadDashboard, syncProfile } from '@/services/backend';
import { useAuth } from '@/context/AuthContext';

type ProfileForm = {
  displayName: string;
  phoneNumber: string;
  location: string;
  education: string;
  skills: string;
  linkedin: string;
  github: string;
  portfolio: string;
};

const defaultProfile: ProfileForm = {
  displayName: '',
  phoneNumber: '',
  location: '',
  education: '',
  skills: '',
  linkedin: '',
  github: '',
  portfolio: '',
};

export function ProfilePage() {
  const { user, role } = useAuth();
  const [form, setForm] = useState<ProfileForm>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    void loadDashboard()
      .then((response) => {
        if (!mounted) {
          return;
        }

        const profile = (response as { profile?: Record<string, unknown> }).profile || {};
        setForm({
          displayName: String(profile.displayName || profile.name || user?.displayName || ''),
          phoneNumber: String(profile.phoneNumber || ''),
          location: String(profile.location || ''),
          education: String(profile.education || ''),
          skills: String(profile.skills || ''),
          linkedin: String(profile.linkedin || ''),
          github: String(profile.github || ''),
          portfolio: String(profile.portfolio || ''),
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [user?.displayName]);

  const completion = useMemo(() => {
    const fields = Object.values(form).filter((value) => String(value).trim().length > 0).length;
    return Math.round((fields / Object.keys(form).length) * 100);
  }, [form]);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!form.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!user?.email) {
      newErrors.email = 'Email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) {
      setStatus('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setStatus('Saving profile...');
    try {
      await syncProfile({
        uid: user?.uid,
        email: user?.email,
        displayName: form.displayName || user?.displayName,
        phoneNumber: form.phoneNumber,
        location: form.location,
        education: form.education,
        skills: form.skills,
        linkedin: form.linkedin,
        github: form.github,
        portfolio: form.portfolio,
        role,
      });
      setStatus('Profile saved and synced to Firestore.');
      setErrors({});
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Profile save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 py-8">
      <section className="hero-frame p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
          <UserRound className="h-4 w-4" />
          Profile
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Keep your profile synced across chat, resumes, and dashboards.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Update the same profile data BharatSaathi AI uses to personalize guidance, resume exports, and activity tracking.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Profile details</h2>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              Completion {completion}%
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { field: 'displayName', label: 'Display name', required: true },
              { field: 'phoneNumber', label: 'Phone number', required: true },
              { field: 'location', label: 'Location', required: true },
              { field: 'linkedin', label: 'LinkedIn', required: false },
              { field: 'github', label: 'GitHub', required: false },
              { field: 'portfolio', label: 'Portfolio', required: false },
            ].map(({ field, label, required }) => (
              <label key={field} className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </span>
                <input
                  value={form[field as keyof ProfileForm]}
                  onChange={(event) => updateField(field as keyof ProfileForm, event.target.value)}
                  className={`focus-ring w-full rounded-2xl border px-4 py-3 text-slate-900 dark:bg-slate-950 dark:text-white ${
                    errors[field as keyof ProfileForm]
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder={label}
                />
                {errors[field as keyof ProfileForm] && (
                  <span className="text-xs text-red-500">{errors[field as keyof ProfileForm]}</span>
                )}
              </label>
            ))}
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-200">Education</span>
              <textarea
                rows={4}
                value={form.education}
                onChange={(event) => updateField('education', event.target.value)}
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                placeholder="School, college, certifications, or degrees"
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-200">Skills</span>
              <textarea
                rows={4}
                value={form.skills}
                onChange={(event) => updateField('skills', event.target.value)}
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                placeholder="Technical and non-technical skills"
              />
            </label>
          </div>

          <button type="button" onClick={() => void handleSave()} disabled={saving || loading} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save profile'}
          </button>

          {status ? <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">{status}</div> : null}
        </section>

        <section className="hero-frame p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Signed in as</div>
              <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{user?.email || 'Guest'}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Role</div>
              <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{role}</div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-saffron-200 bg-saffron-50 p-5 text-sm leading-7 text-slate-700 dark:border-saffron-900/50 dark:bg-saffron-950/40 dark:text-slate-200">
            <div className="mb-2 flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
              <Sparkles className="h-4 w-4" />
              Why this matters
            </div>
            <p className="mb-2">
              A complete profile improves chat answers, resume exports, and any future role-based experiences you enable in Firebase custom claims.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium">Required fields:</span> Display name, Phone number, Location, and Email are required to use all platform features.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
