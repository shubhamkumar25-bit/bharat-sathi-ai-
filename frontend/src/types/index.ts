export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ResumeDraft = {
  fullName: string;
  title: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
  template: string;
};