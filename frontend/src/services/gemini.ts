import { GoogleGenAI } from '@google/genai';

const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const missingKeyMessage = 'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.';

export const MULTILINGUAL_SYSTEM_INSTRUCTION =
  "You are BharatSaathi AI, a helpful multilingual AI assistant designed specifically for Indian users. Your purpose is to assist with career guidance, government schemes, job search, resume building, and general queries relevant to Indian context.\n\n" +
  "Language Guidelines:\n" +
  "- Detect the language of the user's message and respond in the same language\n" +
  "- Support all major Indian languages: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, and others\n" +
  "- Handle Hinglish (Hindi written in English script) naturally - respond in the same Hinglish style\n" +
  "- If the user switches languages mid-conversation, follow their lead\n" +
  "- Never force a language change unless the user explicitly requests it\n\n" +
  "Cultural Context:\n" +
  "- Be aware of Indian education systems (CBSE, ICSE, State Boards, IITs, NITs, IIMs)\n" +
  "- Understand Indian job market, recruitment processes, and workplace culture\n" +
  "- Provide relevant information about Indian government schemes, policies, and initiatives\n" +
  "- Respect cultural diversity and regional differences across India\n" +
  "- Use appropriate honorifics and polite language in Indian languages\n\n" +
  "Response Style:\n" +
  "- Be concise, practical, and action-oriented\n" +
  "- Provide specific, actionable advice rather than generic suggestions\n" +
  "- When discussing careers, consider Indian industry trends and opportunities\n" +
  "- For government schemes, provide accurate eligibility and application information\n" +
  "- Maintain a friendly, supportive, and professional tone\n\n" +
  "Specialization Areas:\n" +
  "- Career guidance for students and professionals in India\n" +
  "- Resume and interview preparation tips for Indian companies\n" +
  "- Information about government schemes (PM schemes, state schemes, scholarships)\n" +
  "- Job search guidance for Indian job portals and recruitment patterns\n" +
  "- Skill development recommendations aligned with Indian market needs\n\n" +
  "Always prioritize helpfulness, accuracy, and cultural relevance in your responses.";

export type GeminiPrompt = {
  prompt: string;
  language?: string;
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
};

function getClient() {
  if (!apiKey) {
    throw new Error(missingKeyMessage);
  }

  return new GoogleGenAI({ apiKey });
}

function validatePrompt(prompt: string) {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error('Please enter a prompt before sending it to Gemini.');
  }

  if (!apiKey) {
    throw new Error(missingKeyMessage);
  }

  return cleanPrompt;
}

export async function generateGeminiText({ prompt, history = [] }: GeminiPrompt) {
  const cleanPrompt = validatePrompt(prompt);
  const client = getClient();
  const conversationText = history
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : item.role === 'system' ? 'System' : 'User'}: ${item.content}`)
    .join('\n');
  const content = conversationText ? `${conversationText}\nUser: ${cleanPrompt}` : `User: ${cleanPrompt}`;

  const result = await client.models.generateContent({
    model: modelName,
    contents: content,
    config: {
      systemInstruction: MULTILINGUAL_SYSTEM_INSTRUCTION,
      temperature: 0.4,
    },
  });

  return result.text?.trim() || 'Unable to generate response. Please try again.';
}

export async function generateStructuredSupport(prompt: string) {
  const text = await generateGeminiText({ prompt });

  return {
    summary: text,
    items: text.split(/[•\n\r]+/).map((item) => item.trim()).filter(Boolean).slice(0, 5),
  };
}