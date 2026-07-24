import { GoogleGenAI } from '@google/genai';

const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const missingKeyMessage = 'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.';

export const MULTILINGUAL_SYSTEM_INSTRUCTION =
  "You are BharatSaathi AI, a multilingual AI assistant for Indian users. Detect the language of the user's latest message and always respond in the same language. If the user writes in Hinglish or another mixed-language style, respond naturally in the same mixed-language style. Never switch to Hindi or English unless the user does so.";

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