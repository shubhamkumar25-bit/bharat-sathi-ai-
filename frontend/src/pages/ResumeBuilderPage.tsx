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
  githubLink: string;
  liveDemoLink: string;
  docLink: string;
};

type CertificationEntry = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  verificationLink: string;
  certificateLink: string;
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
  website: string;
  summary: string;
  technicalSkills: string;
  softSkills: string;
  tools: string;
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
  website: '',
  summary: '',
  technicalSkills: '',
  softSkills: '',
  tools: '',
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
    skills: [...toListItems(draft.technicalSkills, 'name'), ...toListItems(draft.softSkills, 'name'), ...toListItems(draft.tools, 'name')],
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
          new Paragraph({ text: [draft.technicalSkills, draft.softSkills, draft.tools].filter(Boolean).join('\n') || '-' }),
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(errors).length === 0) {
        setStatus('Auto-saved locally');
        setTimeout(() => setStatus(''), 2000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [draft, errors]);

  const atsScore = useMemo(() => {
    const signalCount = [
      draft.summary,
      draft.education.length > 0,
      draft.technicalSkills,
      draft.softSkills,
      draft.tools,
      draft.experience.length > 0,
      draft.projects.length > 0,
    ].filter((item) => typeof item === 'string' ? item.trim().length > 0 : item).length;
    const allSkills = [draft.technicalSkills, draft.softSkills, draft.tools].join(' ');
    return Math.min(98, 45 + signalCount * 10 + Math.min(15, splitLines(allSkills).length * 3));
  }, [draft]);

  const jobReadinessScore = useMemo(() => {
    let score = 0;
    const maxScore = 100;

    // Personal Details (15 points)
    if (draft.name.trim()) score += 5;
    if (draft.title.trim()) score += 5;
    if (draft.location.trim()) score += 5;

    // Education - Mandatory (20 points)
    if (draft.education.length > 0) {
      const hasCompleteEducation = draft.education.some(edu => 
        edu.degree.trim() && edu.institution.trim() && edu.year.trim()
      );
      if (hasCompleteEducation) score += 20;
    }

    // Contact Information (10 points)
    if (draft.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) score += 5;
    if (draft.phone.trim() && /^\+91 \d{10}$/.test(draft.phone)) score += 5;

    // Professional Summary (10 points)
    if (draft.summary.trim() && draft.summary.split(' ').length >= 20) score += 10;

    // Experience (15 points)
    if (draft.experience.length > 0) {
      const hasCompleteExperience = draft.experience.some(exp => 
        exp.title.trim() && exp.company.trim() && exp.duration.trim()
      );
      if (hasCompleteExperience) score += 15;
    }

    // Projects (10 points)
    if (draft.projects.length > 0) {
      const hasCompleteProject = draft.projects.some(proj => 
        proj.name.trim() && proj.technologies.trim()
      );
      if (hasCompleteProject) score += 10;
    }

    // Skills (10 points)
    const hasTechnicalSkills = draft.technicalSkills.trim().length > 0;
    const hasSoftSkills = draft.softSkills.trim().length > 0;
    const hasTools = draft.tools.trim().length > 0;
    if (hasTechnicalSkills) score += 4;
    if (hasSoftSkills) score += 3;
    if (hasTools) score += 3;

    // Certifications (5 points)
    if (draft.certifications.length > 0) {
      const hasCompleteCert = draft.certifications.some(cert => 
        cert.name.trim() && cert.issuer.trim() && cert.date.trim()
      );
      if (hasCompleteCert) score += 5;
    }

    // Social Links (5 points)
    if (draft.linkedin.trim() && isValidUrl(draft.linkedin)) score += 2;
    if ((draft.github.trim() && isValidUrl(draft.github)) || (draft.portfolio.trim() && isValidUrl(draft.portfolio))) score += 3;

    // ATS Score Bonus (10 points)
    if (atsScore >= 80) score += 10;
    else if (atsScore >= 60) score += 7;
    else if (atsScore >= 40) score += 4;
    else if (atsScore >= 20) score += 2;

    return Math.min(maxScore, score);
  }, [draft, atsScore]);

  const getJobReadinessStatus = (score: number) => {
    if (score >= 80) return 'Ready to Apply ✅';
    if (score >= 60) return 'Almost Ready ⚠️';
    if (score >= 40) return 'Work in Progress 🔄';
    return 'Just Started 📝';
  };

  async function generateResume() {
    const educationText = draft.education.map(edu => `${edu.degree} from ${edu.institution} (${edu.year})`).join('\n');
    const experienceText = draft.experience.map(exp => `${exp.title} at ${exp.company} (${exp.duration})`).join('\n');
    const projectsText = draft.projects.map(proj => `${proj.name} - ${proj.technologies}`).join('\n');

    const prompt = `You are an expert ATS resume optimizer. Analyze this resume and provide specific, actionable improvements.

Candidate Information:
Name: ${draft.name}
Title: ${draft.title}
Location: ${draft.location}

Education:
${educationText}

Technical Skills:
${draft.technicalSkills}

Soft Skills:
${draft.softSkills}

Tools & Technologies:
${draft.tools}

Experience:
${experienceText}

Projects:
${projectsText}

Provide your response in this exact format:

**ATS Score Analysis:**
[Give a score out of 100 and explain why]

**Missing Keywords:**
[List 5-10 important ATS keywords missing from the resume]

**Professional Summary Improvement:**
[Provide an improved, ATS-friendly professional summary]

**Action Verbs Suggestions:**
[List 5-10 strong action verbs to replace weak ones]

**Skills Recommendations:**
[Suggest missing skills based on the job title]

**Grammar & Spelling Fixes:**
[Point out any grammar or spelling issues]

Return your response in simple Hindi or mixed Hindi-English. Be specific and practical.`;

    try {
      setLoadingSummary(true);
      setStatus('Analyzing resume with AI...');
      const result = await generateTaskOutput({ task: 'Resume Builder', prompt });
      setAiSummary(result.answer.trim());
      setStatus('AI analysis completed successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Resume generation failed.');
    } finally {
      setLoadingSummary(false);
    }
  }

  async function saveDraft() {
    if (!validateDraft()) {
      setStatus('Please fix validation errors before saving.');
      return;
    }

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
    if (!validateDraft()) {
      setStatus('Please fix validation errors before exporting.');
      return;
    }

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

    const writeClickableLink = (text: string, url: string) => {
      if (url && isValidUrl(url)) {
        doc.setTextColor(59, 130, 246);
        doc.textWithLink(text, marginX, cursorY, { url });
        cursorY += 15;
        doc.setTextColor(51, 65, 85);
      }
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

    // Add clickable social links
    if (draft.linkedin || draft.github || draft.portfolio || draft.website) {
      cursorY += 10;
      if (draft.linkedin) writeClickableLink('LinkedIn', draft.linkedin);
      if (draft.github) writeClickableLink('GitHub', draft.github);
      if (draft.portfolio) writeClickableLink('Portfolio', draft.portfolio);
      if (draft.website) writeClickableLink('Website', draft.website);
      cursorY += 10;
    }

    writeSection('Professional Summary', draft.summary || aiSummary);
    writeSection('Education', educationText);
    writeSection('Skills', [draft.technicalSkills, draft.softSkills, draft.tools].filter(Boolean).join('\n'));
    writeSection('Experience', experienceText);
    writeSection('Projects', projectsText);
    writeSection('Certifications', certificationsText);
    writeSection('Languages', draft.languages);
    writeSection('Achievements', draft.achievements);

    doc.save(`${(draft.name || 'bharatsaathi-resume').replace(/\s+/g, '-').toLowerCase()}.pdf`);
    setStatus('PDF exported successfully.');
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

  function validateDraft(): boolean {
    const newErrors: Record<string, string> = {};

    if (!draft.name.trim()) newErrors.name = 'Name is required';
    if (!draft.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) newErrors.email = 'Invalid email format';
    if (!draft.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+91 \d{10}$/.test(draft.phone)) newErrors.phone = 'Phone must be in format: +91 XXXXXXXXXX';
    if (!draft.title.trim()) newErrors.title = 'Professional title is required';
    if (!draft.location.trim()) newErrors.location = 'Location is required';

    if (draft.education.length === 0) {
      newErrors.education = 'At least one education entry is required';
    } else {
      draft.education.forEach((edu, index) => {
        if (!edu.degree.trim()) newErrors[`education_${index}_degree`] = 'Degree is required';
        if (!edu.institution.trim()) newErrors[`education_${index}_institution`] = 'Institution is required';
        if (!edu.year.trim()) newErrors[`education_${index}_year`] = 'Year is required';
      });
    }

    // URL validation
    const urlFields = ['linkedin', 'github', 'portfolio', 'website'];
    urlFields.forEach(field => {
      const value = draft[field as keyof ResumeDraft] as string;
      if (value && !isValidUrl(value)) {
        newErrors[field] = 'Invalid URL format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function updateField(field: keyof ResumeDraft, value: string) {
    if (field === 'phone') {
      // Indian phone number validation: +91 followed by 10 digits
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length === 10) {
        value = '+91 ' + cleaned;
      } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        value = '+91 ' + cleaned.slice(2);
      } else if (cleaned.length === 13 && cleaned.startsWith('9191')) {
        value = '+91 ' + cleaned.slice(4);
      }
    }
    setDraft((current) => ({ ...current, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  function addEducation() {
    setDraft((current) => ({
      ...current,
      education: [...current.education, { id: crypto.randomUUID(), degree: '', institution: '', year: '', description: '' }],
    }));
  }

  // Ensure at least one education entry exists
  useEffect(() => {
    if (draft.education.length === 0) {
      setDraft((current) => ({
        ...current,
        education: [{ id: crypto.randomUUID(), degree: '', institution: '', year: '', description: '' }],
      }));
    }
  }, []);

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
      projects: [...current.projects, { id: crypto.randomUUID(), name: '', description: '', technologies: '', githubLink: '', liveDemoLink: '', docLink: '' }],
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
      certifications: [...current.certifications, { id: crypto.randomUUID(), name: '', issuer: '', date: '', credentialId: '', verificationLink: '', certificateLink: '' }],
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['ATS Score', `${atsScore}`],
              ['Sections', `${[draft.summary, draft.education.length > 0, draft.technicalSkills, draft.softSkills, draft.tools, draft.experience.length > 0, draft.projects.length > 0].filter((item) => typeof item === 'string' && item.trim().length > 0 || typeof item === 'boolean' && item).length}`],
              ['Job Readiness', `${jobReadinessScore}%`, getJobReadinessStatus(jobReadinessScore)],
            ].map(([label, value, status]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
                {status && <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{status}</div>}
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
              ['phone', 'Phone (+91 XXXXXXXXXX)'],
              ['location', 'Location'],
              ['linkedin', 'LinkedIn'],
              ['github', 'GitHub'],
              ['portfolio', 'Portfolio'],
              ['website', 'Personal Website'],
            ].map(([field, label]) => (
              <label key={field} className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
                <input
                  value={typeof draft[field as keyof ResumeDraft] === 'string' ? draft[field as keyof ResumeDraft] as string : ''}
                  onChange={(event) => updateField(field as keyof ResumeDraft, event.target.value)}
                  className={`focus-ring w-full rounded-2xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:bg-slate-950 dark:text-white ${errors[field] ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30' : 'border-slate-200 bg-white dark:border-slate-800'}`}
                  placeholder={label}
                />
                {errors[field] && <p className="text-xs text-red-600 dark:text-red-400">{errors[field]}</p>}
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4">
            {[
              ['summary', 'Professional Summary'],
              ['technicalSkills', 'Technical Skills'],
              ['softSkills', 'Soft Skills'],
              ['tools', 'Tools & Technologies'],
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
            {Array.isArray(draft.education) && draft.education.map((edu, index) => (
              <div key={edu.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <input
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className={`focus-ring w-full rounded-xl border px-3 py-2 text-sm text-slate-900 dark:bg-slate-950 dark:text-white ${errors[`education_${index}_degree`] ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30' : 'border-slate-200 bg-white dark:border-slate-800'}`}
                      placeholder="Degree (e.g., B.Tech Computer Science)"
                    />
                    {errors[`education_${index}_degree`] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors[`education_${index}_degree`]}</p>}
                  </div>
                  <div>
                    <input
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      className={`focus-ring w-full rounded-xl border px-3 py-2 text-sm text-slate-900 dark:bg-slate-950 dark:text-white ${errors[`education_${index}_institution`] ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30' : 'border-slate-200 bg-white dark:border-slate-800'}`}
                      placeholder="Institution"
                    />
                    {errors[`education_${index}_institution`] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors[`education_${index}_institution`]}</p>}
                  </div>
                  <div>
                    <input
                      value={edu.year}
                      onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                      className={`focus-ring w-full rounded-xl border px-3 py-2 text-sm text-slate-900 dark:bg-slate-950 dark:text-white ${errors[`education_${index}_year`] ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30' : 'border-slate-200 bg-white dark:border-slate-800'}`}
                      placeholder="Year (e.g., 2020-2024)"
                    />
                    {errors[`education_${index}_year`] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors[`education_${index}_year`]}</p>}
                  </div>
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
            {errors.education && <p className="text-xs text-red-600 dark:text-red-400">{errors.education}</p>}
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
                  <input
                    value={proj.githubLink}
                    onChange={(e) => updateProject(proj.id, 'githubLink', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="GitHub Repository URL"
                  />
                  <input
                    value={proj.liveDemoLink}
                    onChange={(e) => updateProject(proj.id, 'liveDemoLink', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Live Demo URL"
                  />
                  <input
                    value={proj.docLink}
                    onChange={(e) => updateProject(proj.id, 'docLink', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Documentation/Google Drive URL"
                  />
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
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
              <div key={cert.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="grid gap-3 sm:grid-cols-2">
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
                  <input
                    value={cert.credentialId}
                    onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Credential ID (optional)"
                  />
                  <input
                    value={cert.verificationLink}
                    onChange={(e) => updateCertification(cert.id, 'verificationLink', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Verification URL"
                  />
                  <input
                    value={cert.certificateLink}
                    onChange={(e) => updateCertification(cert.id, 'certificateLink', e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Certificate/Google Drive URL"
                  />
                  <button
                    type="button"
                    onClick={() => removeCertification(cert.id)}
                    className="focus-ring col-span-2 inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
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
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {draft.linkedin && <a href={draft.linkedin} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline dark:text-saffron-400">LinkedIn</a>}
                {draft.github && <a href={draft.github} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline dark:text-saffron-400">GitHub</a>}
                {draft.portfolio && <a href={draft.portfolio} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline dark:text-saffron-400">Portfolio</a>}
                {draft.website && <a href={draft.website} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline dark:text-saffron-400">Website</a>}
              </div>
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
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Technical Skills</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{draft.technicalSkills || 'List your technical skills.'}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Soft Skills</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{draft.softSkills || 'List your soft skills.'}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tools & Technologies</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{draft.tools || 'List tools and technologies you use.'}</p>
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
              <div className="mt-3 space-y-3">
                {draft.projects.length > 0 ? draft.projects.map((proj) => (
                  <div key={proj.id} className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                    <p><strong>{proj.name}</strong> - {proj.technologies}</p>
                    {proj.description && <p className="mt-1 text-xs text-slate-500">{proj.description}</p>}
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline dark:text-saffron-400">GitHub</a>}
                      {proj.liveDemoLink && <a href={proj.liveDemoLink} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline dark:text-saffron-400">Live Demo</a>}
                      {proj.docLink && <a href={proj.docLink} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline dark:text-saffron-400">Documentation</a>}
                    </div>
                  </div>
                )) : <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">Mention live projects, internships, or case studies.</p>}
              </div>
            </div>

            {draft.certifications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Certifications</h4>
                <div className="mt-3 space-y-3">
                  {draft.certifications.map((cert) => (
                    <div key={cert.id} className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                      <p><strong>{cert.name}</strong> - {cert.issuer} ({cert.date})</p>
                      {cert.credentialId && <p className="text-xs text-slate-500">Credential ID: {cert.credentialId}</p>}
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        {cert.verificationLink && <a href={cert.verificationLink} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline dark:text-saffron-400">Verify</a>}
                        {cert.certificateLink && <a href={cert.certificateLink} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline dark:text-saffron-400">Certificate</a>}
                      </div>
                    </div>
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