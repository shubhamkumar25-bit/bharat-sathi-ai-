import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { Download, FileText, RefreshCcw, Save, Sparkles } from 'lucide-react';
import { generateTaskOutput, saveResume, updateResume } from '@/services/backend';
import { useAuth } from '@/context/AuthContext';

type ResumeDraft = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  education: string;
  skills: string;
  experience: string;
  projects: string;
};

const draftStorageKey = 'bharatsaathi-resume-draft';
const resumeIdKey = 'bharatsaathi-resume-id';

const defaultDraft: ResumeDraft = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  summary: '',
  education: '',
  skills: '',
  experience: '',
  projects: '',
};

function splitLines(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function toListItems(value: string, field: string) {
  return splitLines(value).map((line) => ({ [field]: line }));
}

function buildPayload(draft: ResumeDraft, objective: string) {
  return {
    name: draft.name.trim() || 'Untitled Resume',
    template: 'ATS Professional',
    profile: {
      fullName: draft.name.trim(),
      professionalTitle: draft.title.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      location: draft.location.trim(),
      socialLinks: {
        linkedin: draft.linkedin.trim(),
        github: draft.github.trim(),
      },
    },
    objective,
    education: toListItems(draft.education, 'detail'),
    experience: toListItems(draft.experience, 'detail'),
    projects: toListItems(draft.projects, 'detail'),
    skills: toListItems(draft.skills, 'name'),
    certifications: [],
    achievements: [],
    internships: [],
    training: [],
    workshops: [],
    languages: [],
    interests: [],
    hobbies: [],
    strengths: [],
    references: [],
    socialLinks: {
      linkedin: draft.linkedin.trim(),
      github: draft.github.trim(),
    },
  };
}

function buildDocxDocument(draft: ResumeDraft, aiSummary: string) {
  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: draft.name || 'Your Name', bold: true, size: 32 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: draft.title || 'Professional Title', size: 22 })],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Contact', bold: true })] }),
          new Paragraph({ text: [draft.email, draft.phone, draft.location].filter(Boolean).join(' | ') || '-' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Professional Summary', bold: true })] }),
          new Paragraph({ text: draft.summary || aiSummary || '-' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Education', bold: true })] }),
          new Paragraph({ text: draft.education || '-' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Skills', bold: true })] }),
          new Paragraph({ text: draft.skills || '-' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Experience', bold: true })] }),
          new Paragraph({ text: draft.experience || '-' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Projects', bold: true })] }),
          new Paragraph({ text: draft.projects || '-' }),
        ],
      },
    ],
  });
}

export function ResumeBuilderPage() {
  const { user } = useAuth();
  const [draft, setDraft] = useState<ResumeDraft>(defaultDraft);
  const [aiSummary, setAiSummary] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | ''>('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const storedDraft = window.localStorage.getItem(draftStorageKey);
    const storedResumeId = window.localStorage.getItem(resumeIdKey);

    if (storedDraft) {
      try {
        setDraft({ ...defaultDraft, ...JSON.parse(storedDraft) });
      } catch {
        window.localStorage.removeItem(draftStorageKey);
      }
    }

    if (storedResumeId) {
      setResumeId(storedResumeId);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [draft]);

  const atsScore = useMemo(() => {
    const signalCount = [draft.summary, draft.education, draft.skills, draft.experience, draft.projects].filter((item) => item.trim().length > 0).length;
    return Math.min(98, 45 + signalCount * 10 + Math.min(15, splitLines(draft.skills).length * 3));
  }, [draft]);

  async function generateResume() {
    const prompt = `Create a professional ATS-friendly resume summary and improvement suggestions for this candidate.\n\nName: ${draft.name}\nTitle: ${draft.title}\nLocation: ${draft.location}\nEducation:\n${draft.education}\nSkills:\n${draft.skills}\nExperience:\n${draft.experience}\nProjects:\n${draft.projects}\n\nReturn concise, practical guidance in simple Hindi or mixed Hindi-English. Do not overwrite the user's existing summary.`;

    try {
      setLoadingSummary(true);
      setStatus('Generating AI summary...');
      const result = await generateTaskOutput({ task: 'Resume Builder', prompt });
      setAiSummary(result.answer.trim());
      setStatus('AI summary generated successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Resume generation failed.');
    } finally {
      setLoadingSummary(false);
    }
  }

  async function saveDraft() {
    const objective = draft.summary.trim() || aiSummary.trim();
    const payload = buildPayload(draft, objective);

    setSaving(true);
    setStatus('Saving resume draft...');

    try {
      if (user) {
        if (resumeId) {
          await updateResume(resumeId, payload);
        } else {
          const response = await saveResume(payload);
          const newResumeId = String((response as { resume?: { id?: string } }).resume?.id || '');

          if (newResumeId) {
            setResumeId(newResumeId);
            window.localStorage.setItem(resumeIdKey, newResumeId);
          }
        }
      }

      setStatus('Draft saved locally' + (user ? ' and synced to Firestore.' : '.'));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save draft.');
    } finally {
      setSaving(false);
    }
  }

  async function downloadPdf() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 48;
    let cursorY = 56;
    const contentWidth = 500;

    const writeSection = (title: string, body: string) => {
      const wrapped = doc.splitTextToSize(body || '-', contentWidth);
      if (cursorY > 740) {
        doc.addPage();
        cursorY = 56;
      }

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(title, marginX, cursorY);
      cursorY += 20;

      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text(wrapped, marginX, cursorY);
      cursorY += wrapped.length * 15 + 20;
    };

    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text(draft.name || 'Your Name', marginX, cursorY);
    cursorY += 24;
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text(draft.title || 'Professional Title', marginX, cursorY);
    cursorY += 24;
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text([draft.email, draft.phone, draft.location].filter(Boolean).join(' | ') || '-', marginX, cursorY);
    cursorY += 28;

    writeSection('Professional Summary', draft.summary || aiSummary);
    writeSection('Education', draft.education);
    writeSection('Skills', draft.skills);
    writeSection('Experience', draft.experience);
    writeSection('Projects', draft.projects);

    doc.save(`${(draft.name || 'bharatsaathi-resume').replace(/\s+/g, '-').toLowerCase()}.pdf`);
  }

  async function downloadDocx() {
    setExporting('docx');
    try {
      const docxDocument = buildDocxDocument(draft, aiSummary);
      const blob = await Packer.toBlob(docxDocument);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${(draft.name || 'bharatsaathi-resume').replace(/\s+/g, '-').toLowerCase()}.docx`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus('DOCX exported successfully.');
    } finally {
      setExporting('');
    }
  }

  function updateField(field: keyof ResumeDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function resetDraft() {
    setDraft(defaultDraft);
    setAiSummary('');
    setResumeId('');
    window.localStorage.removeItem(draftStorageKey);
    window.localStorage.removeItem(resumeIdKey);
    setStatus('Draft cleared.');
  }

  const previewSummary = draft.summary.trim() || aiSummary.trim() || 'Write a concise professional summary or generate one with AI.';

  return (
    <div className="space-y-8 py-8">
      <section className="hero-frame overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-saffron-50 px-4 py-2 text-sm font-semibold text-saffron-700 dark:border-saffron-900/60 dark:bg-saffron-950/60 dark:text-saffron-300">
              <FileText className="h-4 w-4" />
              AI Resume Builder
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Build an ATS-friendly resume without overwriting your draft.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Save locally, sync to Firestore when authenticated, generate an AI improvement summary, and export to PDF or DOCX from the same draft.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['ATS Score', `${atsScore}`],
              ['Sections', `${[draft.summary, draft.education, draft.skills, draft.experience, draft.projects].filter((item) => item.trim()).length}`],
              ['Status', user ? 'Cloud sync on' : 'Local draft only'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Resume Draft</h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void generateResume()} className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-saffron-300 hover:text-saffron-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-saffron-700" disabled={loadingSummary}>
                <Sparkles className="h-4 w-4 text-saffron-500" />
                {loadingSummary ? 'Generating...' : 'AI Improve'}
              </button>
              <button type="button" onClick={() => void saveDraft()} className="focus-ring inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button type="button" onClick={resetDraft} className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-red-700">
                <RefreshCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['name', 'Full Name'],
              ['title', 'Professional Title'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['location', 'Location'],
              ['linkedin', 'LinkedIn'],
              ['github', 'GitHub'],
            ].map(([field, label]) => (
              <label key={field} className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
                <input
                  value={draft[field as keyof ResumeDraft]}
                  onChange={(event) => updateField(field as keyof ResumeDraft, event.target.value)}
                  className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder={label}
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4">
            {[
              ['summary', 'Professional Summary'],
              ['education', 'Education'],
              ['skills', 'Skills'],
              ['experience', 'Experience'],
              ['projects', 'Projects'],
            ].map(([field, label]) => (
              <label key={field} className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
                <textarea
                  rows={field === 'summary' ? 5 : 4}
                  value={draft[field as keyof ResumeDraft]}
                  onChange={(event) => updateField(field as keyof ResumeDraft, event.target.value)}
                  className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder={`Add ${label.toLowerCase()} on separate lines for best export formatting.`}
                />
              </label>
            ))}
          </div>

          {status ? <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">{status}</div> : null}
        </section>

        <section className="hero-frame p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Live Preview</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => void downloadPdf()} className="focus-ring inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                <Download className="h-4 w-4" />
                PDF
              </button>
              <button type="button" onClick={() => void downloadDocx()} className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <Download className="h-4 w-4" />
                {exporting === 'docx' ? 'Exporting...' : 'DOCX'}
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">{draft.name || 'Your Name'}</h3>
              <p className="mt-1 text-sm font-medium text-saffron-600 dark:text-saffron-400">{draft.title || 'Professional Title'}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {[draft.email, draft.phone, draft.location].filter(Boolean).join(' | ') || 'Email | Phone | Location'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Professional Summary</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{previewSummary}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Education</h4>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{draft.education || 'Add education details to generate a cleaner preview.'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Skills</h4>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{draft.skills || 'List technical and non-technical skills.'}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Experience</h4>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{draft.experience || 'Add recent work or internship experience.'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Projects</h4>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{draft.projects || 'Mention live projects, internships, or case studies.'}</p>
              </div>
            </div>
          </div>

          {aiSummary ? (
            <div className="mt-6 rounded-3xl border border-saffron-200 bg-saffron-50 p-5 text-sm leading-7 text-slate-700 dark:border-saffron-900/50 dark:bg-saffron-950/40 dark:text-slate-200">
              <div className="font-semibold text-slate-950 dark:text-white">AI Improvement Suggestion</div>
              <p className="mt-2 whitespace-pre-wrap">{aiSummary}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}