import { firebaseAuth } from '@/lib/firebase';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

async function getAuthToken() {
  if (!firebaseAuth) {
    return null;
  }

  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    return null;
  }

  return currentUser.getIdToken();
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers || {});
  const bodyIsFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!bodyIsFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const token = await getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload?.message || 'Request failed.';
    throw new Error(message);
  }

  return payload as T;
}

export type ChatApiMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

export type GeminiHistoryMessage = {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
};

export type ChatConversation = {
  id: string;
  title: string;
  messages: ChatApiMessage[];
  updatedAt?: string;
};

export type ResumePayload = Record<string, unknown>;
export type SchemePayload = Record<string, unknown> & { schemeId: string; title: string };

export async function syncProfile(profile: Record<string, unknown>) {
  return request<{ profile: Record<string, unknown> }>('/api/auth/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function loadDashboard() {
  return request('/api/auth/dashboard');
}

export async function loadChatHistory(limit = 20) {
  return request<{ conversations: ChatConversation[] }>(`/api/chat/history?limit=${limit}`);
}

export async function sendChatMessage(payload: { message: string; conversationId?: string; language?: 'hi' | 'en'; history?: ChatApiMessage[] }) {
  return request<{ conversationId: string; answer: string; messages: ChatApiMessage[] }>('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function clearChatConversation(conversationId: string) {
  return request<{ success: boolean }>(`/api/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });
}

export async function askGemini(payload: { prompt: string; language?: 'hi' | 'en'; history?: GeminiHistoryMessage[]; task?: string }) {
  return request<{ answer: string }>('/api/gemini/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function generateTaskOutput(payload: { prompt: string; language?: 'hi' | 'en'; history?: GeminiHistoryMessage[]; task?: string }) {
  return request<{ answer: string }>('/api/gemini/task', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loadResumes() {
  return request('/api/resumes');
}

export async function saveResume(payload: ResumePayload) {
  return request('/api/resumes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateResume(resumeId: string, payload: ResumePayload) {
  return request(`/api/resumes/${resumeId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function analyzeResume(resumeId: string) {
  return request(`/api/resumes/${resumeId}/analyze`);
}

export async function exportResume(resumeId: string, format: 'pdf' | 'docx' | 'txt') {
  const response = await fetch(`${apiBaseUrl}/api/resumes/${resumeId}/export?format=${format}`, {
    headers: await buildAuthHeaders(),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || 'Export failed.');
  }

  return response.blob();
}

async function buildAuthHeaders() {
  const headers = new Headers();
  const token = await getAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

export async function loadSchemes(filters: { query?: string; category?: string; occupation?: string; state?: string }) {
  const params = new URLSearchParams();

  if (filters.query) params.set('query', filters.query);
  if (filters.category) params.set('category', filters.category);
  if (filters.occupation) params.set('occupation', filters.occupation);
  if (filters.state) params.set('state', filters.state);

  return request(`/api/schemes?${params.toString()}`);
}

export async function loadBookmarks() {
  return request('/api/schemes/bookmarks');
}

export async function saveSchemeBookmark(bookmark: SchemePayload) {
  return request('/api/schemes/bookmarks', {
    method: 'POST',
    body: JSON.stringify(bookmark),
  });
}

export async function deleteSchemeBookmark(bookmarkId: string) {
  return request(`/api/schemes/bookmarks/${bookmarkId}`, {
    method: 'DELETE',
  });
}