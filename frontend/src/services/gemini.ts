import { GoogleGenAI } from '@google/genai';

const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const missingKeyMessage = 'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.';

export type GeminiPrompt = {
  prompt: string;
  language?: 'hi' | 'en';
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

export async function generateGeminiText({ prompt, language = 'hi', history = [] }: GeminiPrompt) {
  const cleanPrompt = validatePrompt(prompt);
  const client = getClient();
  const conversationText = history
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : item.role === 'system' ? 'System' : 'User'}: ${item.content}`)
    .join('\n');
  const instruction = language === 'hi'
    ? 'उत्तर हिंदी में दें, सरल और सहायक रहें।'
    : 'Respond in clear, concise English with practical guidance.';
  const content = conversationText ? `${conversationText}\nUser: ${cleanPrompt}` : `User: ${cleanPrompt}`;

  const result = await client.models.generateContent({
    model: modelName,
    contents: content,
    config: {
      systemInstruction: instruction,
      temperature: 0.4,
    },
  });

  return result.text?.trim() || 'मुझे अभी उत्तर बनाने में समस्या हुई। कृपया फिर से पूछें।';
}

export async function generateStructuredSupport(prompt: string) {
  const text = await generateGeminiText({ prompt, language: 'hi' });

  return {
    summary: text,
    items: text.split(/[•\n\r]+/).map((item) => item.trim()).filter(Boolean).slice(0, 5),
  };
}