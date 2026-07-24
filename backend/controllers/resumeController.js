import crypto from 'node:crypto';
import { PassThrough } from 'node:stream';
import PDFDocument from 'pdfkit';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { z } from 'zod';
import { addActivity, deleteResume, duplicateResume, getResume, listResumes, saveResume, updateResume } from '../services/firestoreService.js';
import { generateResumeAssist } from '../services/geminiService.js';
import { buildResumeAnalysis } from '../services/resumeAnalysisService.js';

const resumeSchema = z.object({
  name: z.string().min(1).default('Untitled Resume'),
  template: z.string().default('ATS Professional'),
  profile: z.record(z.any()).default({}),
  objective: z.string().optional().default(''),
  education: z.array(z.record(z.any())).default([]),
  experience: z.array(z.record(z.any())).default([]),
  projects: z.array(z.record(z.any())).default([]),
  skills: z.array(z.record(z.any())).default([]),
  certifications: z.array(z.record(z.any())).default([]),
  achievements: z.array(z.record(z.any())).default([]),
  internships: z.array(z.record(z.any())).default([]),
  training: z.array(z.record(z.any())).default([]),
  workshops: z.array(z.record(z.any())).default([]),
  languages: z.array(z.record(z.any())).default([]),
  interests: z.array(z.string()).default([]),
  hobbies: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  references: z.array(z.record(z.any())).default([]),
  socialLinks: z.record(z.any()).default({}),
});

function sectionParagraph(title, body) {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: title, bold: true })],
    }),
    new Paragraph({ text: body || '-' }),
  ];
}

function makeResumeDoc(resume, analysis) {
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: resume.profile?.fullName || resume.name || 'BharatSaathi Candidate', bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: resume.profile?.professionalTitle || resume.template || 'Professional Resume', size: 22 })],
    }),
    new Paragraph({ text: '' }),
    ...sectionParagraph('Career Objective', resume.objective || analysis?.objective || 'Professional career objective will appear here.'),
    ...sectionParagraph('Education', (resume.education || []).map((item) => item.degree || item.course || item.school || '').filter(Boolean).join(' | ') || 'No education added.'),
    ...sectionParagraph('Experience', (resume.experience || []).map((item) => item.position || item.company || '').filter(Boolean).join(' | ') || 'No experience added.'),
    ...sectionParagraph('Projects', (resume.projects || []).map((item) => item.projectName || item.description || '').filter(Boolean).join(' | ') || 'No projects added.'),
    ...sectionParagraph('Skills', (resume.skills || []).map((item) => item.name || item.skill || item).filter(Boolean).join(', ') || 'No skills added.'),
    ...sectionParagraph('Certifications', (resume.certifications || []).map((item) => item.certificateName || item.organization || '').filter(Boolean).join(' | ') || 'No certifications added.'),
  ];

  if (analysis) {
    children.push(
      ...sectionParagraph('ATS Analysis', `ATS Score: ${analysis.atsScore}. Missing Keywords: ${analysis.missingKeywords.join(', ') || 'None'}. Readability: ${analysis.readabilityScore}.`),
    );
  }

  return new Document({
    sections: [{ children }],
  });
}

function generateTxt(resume, analysis) {
  const lines = [
    resume.profile?.fullName || resume.name || 'Resume',
    resume.profile?.professionalTitle || '',
    '',
    'Career Objective',
    resume.objective || analysis?.objective || '-',
    '',
    'Education',
    (resume.education || []).map((item) => Object.values(item).filter(Boolean).join(' - ')).join('\n') || '-',
    '',
    'Experience',
    (resume.experience || []).map((item) => Object.values(item).filter(Boolean).join(' - ')).join('\n') || '-',
    '',
    'Skills',
    (resume.skills || []).map((item) => item.name || item.skill || item).filter(Boolean).join(', ') || '-',
    '',
    'ATS Score',
    String(analysis?.atsScore || 0),
  ];

  return lines.join('\n');
}

async function renderPdf(resume, analysis) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = new PassThrough();
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);

    doc.pipe(stream);
    doc.fontSize(20).text(resume.profile?.fullName || resume.name || 'Resume', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(resume.profile?.professionalTitle || 'Professional Resume', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('Career Objective', { underline: true });
    doc.fontSize(11).text(resume.objective || analysis?.objective || '-');
    doc.moveDown();
    doc.fontSize(14).text('Education', { underline: true });
    doc.fontSize(11).text((resume.education || []).map((item) => Object.values(item).filter(Boolean).join(' - ')).join('\n') || '-');
    doc.moveDown();
    doc.fontSize(14).text('Experience', { underline: true });
    doc.fontSize(11).text((resume.experience || []).map((item) => Object.values(item).filter(Boolean).join(' - ')).join('\n') || '-');
    doc.moveDown();
    doc.fontSize(14).text('Skills', { underline: true });
    doc.fontSize(11).text((resume.skills || []).map((item) => item.name || item.skill || item).filter(Boolean).join(', ') || '-');
    doc.moveDown();
    doc.fontSize(14).text('ATS Analysis', { underline: true });
    doc.fontSize(11).text(`ATS Score: ${analysis?.atsScore || 0}`);
    doc.end();
  });
}

async function renderDocx(resume, analysis) {
  const doc = makeResumeDoc(resume, analysis);
  return Packer.toBuffer(doc);
}

export async function createResume(req, res, next) {
  try {
    const payload = resumeSchema.parse(req.body);
    const objective = payload.objective || await generateResumeAssist({
      prompt: `Create a professional career objective for this candidate: ${JSON.stringify(payload.profile)}`,
      systemInstruction: 'Generate a professional career objective matching the language of the candidate profile details.',
    });

    const resume = await saveResume(req.user.uid, { ...payload, objective });
    await addActivity(req.user.uid, { type: 'resume', title: payload.name, meta: { template: payload.template } });
    res.status(201).json({ resume, objective });
  } catch (error) {
    next(error);
  }
}

export async function getResumes(req, res, next) {
  try {
    const resumes = await listResumes(req.user.uid, Number(req.query.limit || 20));
    res.json({ resumes });
  } catch (error) {
    next(error);
  }
}

export async function getResumeById(req, res, next) {
  try {
    const resume = await getResume(req.user.uid, req.params.resumeId);
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });
    res.json({ resume });
  } catch (error) {
    next(error);
  }
}

export async function updateResumeById(req, res, next) {
  try {
    const payload = resumeSchema.partial().parse(req.body);
    await updateResume(req.user.uid, req.params.resumeId, payload);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function deleteResumeById(req, res, next) {
  try {
    await deleteResume(req.user.uid, req.params.resumeId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function duplicateResumeById(req, res, next) {
  try {
    const resume = await duplicateResume(req.user.uid, req.params.resumeId);
    res.status(201).json({ resume });
  } catch (error) {
    next(error);
  }
}

export async function analyzeResumeById(req, res, next) {
  try {
    const resume = await getResume(req.user.uid, req.params.resumeId);
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });
    const analysis = await buildResumeAnalysis(resume);
    res.json({ analysis });
  } catch (error) {
    next(error);
  }
}

export async function exportResumeById(req, res, next) {
  try {
    const format = String(req.query.format || 'pdf').toLowerCase();
    const resume = await getResume(req.user.uid, req.params.resumeId);

    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const analysis = await buildResumeAnalysis(resume);

    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.name || 'resume'}.txt"`);
      return res.send(generateTxt(resume, analysis));
    }

    if (format === 'docx') {
      const buffer = await renderDocx(resume, analysis);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.name || 'resume'}.docx"`);
      return res.send(buffer);
    }

    const buffer = await renderPdf(resume, analysis);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.name || 'resume'}.pdf"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
}

export async function generateResumeCopy(req, res, next) {
  try {
    const payload = resumeSchema.parse(req.body);
    const answer = await generateResumeAssist({
      prompt: `Rewrite this resume professionally and improve the summary, experience bullets, and skills. Resume data: ${JSON.stringify(payload)}`,
      systemInstruction: 'Return a professional resume improvement in clear structured text matching the input language.',
    });
    res.json({ answer });
  } catch (error) {
    next(error);
  }
}