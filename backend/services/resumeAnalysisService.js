import { generateResumeAssist } from './geminiService.js';

function textBlob(resume) {
  return JSON.stringify(resume || {}).toLowerCase();
}

export async function buildResumeAnalysis(resume) {
  const blob = textBlob(resume);
  const hasEducation = blob.includes('education') || (resume.education || []).length > 0;
  const hasExperience = blob.includes('experience') || (resume.experience || []).length > 0;
  const hasSkills = blob.includes('skills') || (resume.skills || []).length > 0;
  const keywordHits = ['react', 'javascript', 'html', 'css', 'firebase', 'communication', 'teamwork', 'python', 'excel']
    .filter((keyword) => blob.includes(keyword));

  const atsScore = Math.min(100, 35 + (hasEducation ? 15 : 0) + (hasExperience ? 20 : 0) + (hasSkills ? 15 : 0) + Math.min(keywordHits.length * 5, 15));
  const missingKeywords = ['resume', 'project', 'achievement', 'contact', 'linkedin'].filter((keyword) => !blob.includes(keyword));
  const readabilityScore = Math.min(100, 60 + Math.max(0, (resume.objective || '').length > 60 ? 10 : 0) + Math.min((resume.skills || []).length * 2, 10));
  const formattingScore = Math.min(100, 70 + (resume.profile?.fullName ? 10 : 0) + (resume.profile?.professionalTitle ? 10 : 0));
  const grammarScore = Math.min(100, 68 + Math.min((resume.objective || '').split(' ').length / 5, 20));

  const prompt = `Analyze this resume in simple Hindi. Give a short improvement plan and mention missing keywords. Resume: ${JSON.stringify(resume)}`;
  const aiSummary = await generateResumeAssist({ prompt, systemInstruction: 'You are BharatSaathi AI. Produce resume improvement advice in simple Hindi.' }).catch(() => '');

  return {
    atsScore,
    missingKeywords,
    grammarScore,
    formattingScore,
    readabilityScore,
    summary: aiSummary,
    objective: resume.objective || '',
    keywordHits,
  };
}