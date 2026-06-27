const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

export type GeminiPrompt = {
  prompt: string;
  language?: 'hi' | 'en';
};

function fallbackResponse(prompt: string) {
  return [
    'I can help with career guidance, schemes, resumes, student support, and farmer support.',
    'If you add your Gemini API key, the assistant will respond with live AI output.',
    `You asked: ${prompt}`
  ].join(' ');
}

export async function generateGeminiText({ prompt, language = 'en' }: GeminiPrompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackResponse(prompt);
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: modelName });
  const instruction = language === 'hi'
    ? 'उत्तर हिंदी में दें, सरल और सहायक रहें।'
    : 'Respond in clear, concise English with practical guidance.';

  const result = await model.generateContent(`${instruction}\n\nUser prompt: ${prompt}`);
  return result.response.text();
}

export async function generateStructuredSupport(prompt: string) {
  const text = await generateGeminiText({ prompt });
  return {
    summary: text,
    items: text.split(/[•\n\r]+/).map((item) => item.trim()).filter(Boolean).slice(0, 5)
  };
}