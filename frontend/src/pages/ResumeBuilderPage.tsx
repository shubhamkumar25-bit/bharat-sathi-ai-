import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { Download, FileText, RefreshCcw, Save, Sparkles, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import { generateTaskOutput, saveResume, updateResume } from '@/services/backend';
import { useAuth } from '@/context/AuthContext';

type EducationEntry = {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
};

type ExperienceEntry = {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
};

type ProjectEntry = {
  id: string;
  name: string;
  description: string;
  technologies: string;
};

type CertificationEntry = {
  id: string;
  name: string;
  issuer: string;
  date: string;
};

type ResumeDraft = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  skills: string;
  languages: string;
  achievements: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
};

type ResumeTemplate = 'modern' | 'professional' | 'minimal' | 'fresher' | 'ats-friendly' | 'technical';

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
  portfolio: '',
  summary: '',
  skills: '',
  languages: '',
  achievements: '',
  education: [],
  experience: [],
  projects: [],
  certifications: [],
};

function formatEducationArray(education: EducationEntry[]) {
  return education.map(edu => ({
    degree: edu.degree.trim(),
    institution: edu.institution.trim(),
    year: edu.year.trim(),
    detail: edu.description.trim(),
  }));
}

function formatExperienceArray(experience: ExperienceEntry[]) {
  return experience.map(exp => ({
    title: exp.title.trim(),
    company: exp.company.trim(),
    duration: exp.duration.trim(),
    detail: exp.description.trim(),
  }));
}

function formatProjectsArray(projects: ProjectEntry[]) {
  return projects.map(proj => ({
    name: proj.name.trim(),
    technologies: proj.technologies.trim(),
    detail: proj.description.trim(),
  }));
}

function formatCertificationsArray(certifications: CertificationEntry[]) {
  return certifications.map(cert => ({
    name: cert.name.trim(),
    issuer: cert.issuer.trim(),
    date: cert.date.trim(),
  }));
}

function splitLines(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function toListItems(value: string, field: string) {
  return splitLines(value).map((line) => ({ [field]: line }));
}

function buildPayload(draft: ResumeDraft, objective: string, template: ResumeTemplate) {
  return {
    name: draft.name.trim() || 'Untitled Resume',
    template: template.charAt(0).toUpperCase() + template.slice(1),
    profile: {
      fullName: draft.name.trim(),
      professionalTitle: draft.title.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      location: draft.location.trim(),
      socialLinks: {
        linkedin: draft.linkedin.trim(),
        github: draft.github.trim(),
        portfolio: draft.portfolio.trim(),
      },
    },
    objective,
    education: formatEducationArray(draft.education),
    experience: formatExperienceArray(draft.experience),
    projects: formatProjectsArray(draft.projects),
    skills: toListItems(draft.skills, 'name'),
    certifications: formatCertificationsArray(draft.certifications),
    achievements: toListItems(draft.achievements, 'detail'),
    languages: toListItems(draft.languages, 'name'),
    internships: [],
    training: [],
    workshops: [],
    interests: [],
    hobbies: [],
    strengths: [],
    references: [],
    socialLinks: {
      linkedin: draft.linkedin.trim(),
      github: draft.github.trim(),
      portfolio: draft.portfolio.trim(),
    },
  };
}

function buildDocxDocument(draft: ResumeDraft, aiSummary: string) {
  const educationText = draft.education.map(edu => `${edu.degree} - ${edu.institution} (${edu.year})`).join('\n');
  const experienceText = draft.experience.map(exp => `${exp.title} at ${exp.company} (${exp.duration})`).join('\n');
  const projectsText = draft.projects.map(proj => `${proj.name} - ${proj.technologies}`).join('\n');
  const certificationsText = draft.certifications.map(cert => `${cert.name} - ${cert.issuer} (${cert.date})`).join('\n');

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
          new Paragraph({ text: educationText || '-' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Skills', bold: true })] }),
          new Paragraph({ text: draft.skills || '-' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Experience', bold: true })] }),
          new Paragraph({ text: experienceText || '-' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Projects', bold: true })] }),
          new Paragraph({ text: projectsText || '-' }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Certifications', bold: true })] }),
          new Paragraph({ text: certificationsText || '-' }),
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
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('modern');
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
    const signalCount = [
      draft.summary,
      draft.education.length > 0,
      draft.skills,
      draft.experience.length > 0,
      draft.projects.length > 0,
    ].filter((item) => typeof item === 'string' ? item.trim().length > 0 : item).length;
    return Math.min(98, 45 + signalCount * 10 + Math.min(15, splitLines(draft.skills).length * 3));
  }, [draft]);

  async function generateResume() {
    const educationText = draft.education.map(edu => `${edu.degree} from ${edu.institution} (${edu.year})`).join('\n');
    const experienceText = draft.experience.map(exp => `${exp.title} at ${exp.company} (${exp.duration})`).join('\n');
    const projectsText = draft.projects.map(proj => `${proj.name} - ${proj.technologies}`).join('\n');

    const prompt = `Create a professional ATS-friendly resume summary and improvement suggestions for this candidate.\n\nName: ${draft.name}\nTitle: ${draft.title}\nLocation: ${draft.location}\nEducation:\n${educationText}\nSkills:\n${draft.skills}\nExperience:\n${experienceText}\nProjects:\n${projectsText}\n\nReturn concise, practical guidance in simple Hindi or mixed Hindi-English. Do not overwrite the user's existing summary.`;

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
    const payload = buildPayload(draft, objective, selectedTemplate);

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

    const educationText = draft.education.map(edu => `${edu.degree} - ${edu.institution} (${edu.year})`).join('\n');
    const experienceText = draft.experience.map(exp => `${exp.title} at ${exp.company} (${exp.duration})`).join('\n');
    const projectsText = draft.projects.map(proj => `${proj.name} - ${proj.technologies}`).join('\n');
    const certificationsText = draft.certifications.map(cert => `${cert.name} - ${cert.issuer} (${cert.date})`).join('\n');

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
    writeSection('Education', educationText);
    writeSection('Skills', draft.skills);
    writeSection('Experience', experienceText);
    writeSection('Projects', projectsText);
    writeSection('Certifications', certificationsText);
    writeSection('Languages', draft.languages);
    writeSection('Achievements', draft.achievements);

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

  function addEducation() {
    setDraft((current) => ({
      ...current,
      education: [...current.education, { id: crypto.randomUUID(), degree: '', institution: '', year: '', description: '' }],
    }));
  }

  function updateEducation(id: string, field: keyof EducationEntry, value: string) {
    setDraft((current) => ({
      ...current,
      education: current.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  }

  function removeEducation(id: string) {
    setDraft((current) => ({
      ...current,
      education: current.education.filter((edu) => edu.id !== id),
    }));
  }

  function addExperience() {
    setDraft((current) => ({
      ...current,
      experience: [...current.experience, { id: crypto.randomUUID(), title: '', company: '', duration: '', description: '' }],
    }));
  }

  function updateExperience(id: string, field: keyof ExperienceEntry, value: string) {
    setDraft((current) => ({
      ...current,
      experience: current.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  }

  function removeExperience(id: string) {
    setDraft((current) => ({
      ...current,
      experience: current.experience.filter((exp) => exp.id !== id),
    }));
  }

  function addProject() {
    setDraft((current) => ({
      ...current,
      projects: [...current.projects, { id: crypto.randomUUID(), name: '', description: '', technologies: '' }],
    }));
  }

  function updateProject(id: string, field: keyof ProjectEntry, value: string) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    }));
  }

  function removeProject(id: string) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.filter((proj) => proj.id !== id),
    }));
  }

  function addCertification() {
    setDraft((current) => ({
      ...current,
      certifications: [...current.certifications, { id: crypto.randomUUID(), name: '', issuer: '', date: '' }],
    }));
  }

  function updateCertification(id: string, field: keyof CertificationEntry, value: string) {
    setDraft((current) => ({
      ...current,
      certifications: current.certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    }));
  }

  function removeCertification(id: string) {
    setDraft((current) => ({
      ...current,
      certifications: current.certifications.filter((cert) => cert.id !== id),
    }));
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
              Build an ATS-friendly resume with multiple professional templates.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Save locally, sync to Firestore when authenticated, generate an AI improvement summary, and export to PDF or DOCX from the same draft.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['ATS Score', `${atsScore}`],
              ['Sections', `${[draft.summary, draft.education.length > 0, draft.skills, draft.experience.length > 0, draft.projects.length > 0].filter((item) => typeof item === 'string' && item.trim().length > 0 || typeof item === 'boolean' && item).length}`],
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

          <div className="mt-6 space-y-4">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Select Template</span>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as ResumeTemplate)}
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="modern">Modern</option>
                <option value="professional">Professional</option>
                <option value="minimal">Minimal</option>
                <option value="fresher">Fresher</option>
                <option value="ats-friendly">ATS-Friendly</option>
                <option value="technical">Technical/Developer</option>
              </select>
            </label>
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
              ['portfolio', 'Portfolio'],
            ].map(([field, label]) => (
              <label key={field} className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
                <input
                  value={typeof draft[field as keyof ResumeDraft] === 'string' ? draft[field as keyof ResumeDraft] as string : ''}
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
              ['skills', 'Skills'],
              ['languages', 'Languages'],
              ['achievements', 'Achievements'],
            ].map(([field, label]) => (
              <label key={field} className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
                <textarea
                  rows={field === 'summary' ? 5 : 3}
                  value={typeof draft[field as keyof ResumeDraft] === 'string' ? draft[field as keyof ResumeDraft] as string : ''}
                  onChange={(event) => updateField(field as keyof ResumeDraft, event.target.value)}
                  className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder={`Add ${label.toLowerCase()} on separate lines for best export formatting.`}
                />
              </label>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Education</h3>
              <button type="button" onClick={addEducation} className="focus-ring inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <Plus className="h-3 w-3" /> Add Education
              </button>
            </div>
            {Array.isArray(draft.education) && draft.education.map((edu) => (
              <div key={edu.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Degree (e.g., B.Tech Computer Science)"
                  />
                  <input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Institution"
                  />
                  <input
                    value={edu.year}
                    onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Year (e.g., 2020-2024)"
                  />
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
                <textarea
                  value={edu.description}
                  onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                  className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="Description (grades, achievements, etc.)"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Experience</h3>
              <button type="button" onClick={addExperience} className="focus-ring inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <Plus className="h-3 w-3" /> Add Experience
              </button>
            </div>
            {Array.isArray(draft.experience) && draft.experience.map((exp) => (
              <div key={exp.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Job Title"
                  />
                  <input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Company"
                  />
                  <input
                    value={exp.duration}
                    onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Duration (e.g., Jan 2022 - Present)"
                  />
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="Job description and achievements"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Projects</h3>
              <button type="button" onClick={addProject} className="focus-ring inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <Plus className="h-3 w-3" /> Add Project
              </button>
            </div>
            {Array.isArray(draft.projects) && draft.projects.map((proj) => (
              <div key={proj.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Project Name"
                  />
                  <input
                    value={proj.technologies}
                    onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Technologies (e.g., React, Node.js)"
                  />
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="focus-ring col-span-2 inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
                <textarea
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="Project description"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Certifications</h3>
              <button type="button" onClick={addCertification} className="focus-ring inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <Plus className="h-3 w-3" /> Add Certification
              </button>
            </div>
            {Array.isArray(draft.certifications) && draft.certifications.map((cert) => (
              <div key={cert.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-4">
                <input
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                  className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="Certification Name"
                />
                <input
                  value={cert.issuer}
                  onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                  className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="Issuer"
                />
                <input
                  value={cert.date}
                  onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                  className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="Date"
                />
                <button
                  type="button"
                  onClick={() => removeCertification(cert.id)}
                  className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
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

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Education</h4>
              <div className="mt-3 space-y-2">
                {draft.education.length > 0 ? draft.education.map((edu) => (
                  <p key={edu.id} className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                    <strong>{edu.degree}</strong> - {edu.institution} ({edu.year})
                  </p>
                )) : <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">Add education details to generate a cleaner preview.</p>}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Skills</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{draft.skills || 'List technical and non-technical skills.'}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Experience</h4>
              <div className="mt-3 space-y-2">
                {draft.experience.length > 0 ? draft.experience.map((exp) => (
                  <p key={exp.id} className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                    <strong>{exp.title}</strong> at {exp.company} ({exp.duration})
                  </p>
                )) : <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">Add recent work or internship experience.</p>}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Projects</h4>
              <div className="mt-3 space-y-2">
                {draft.projects.length > 0 ? draft.projects.map((proj) => (
                  <p key={proj.id} className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                    <strong>{proj.name}</strong> - {proj.technologies}
                  </p>
                )) : <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">Mention live projects, internships, or case studies.</p>}
              </div>
            </div>

            {draft.certifications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Certifications</h4>
                <div className="mt-3 space-y-2">
                  {draft.certifications.map((cert) => (
                    <p key={cert.id} className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                      <strong>{cert.name}</strong> - {cert.issuer} ({cert.date})
                    </p>
                  ))}
                </div>
              </div>
            )}
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