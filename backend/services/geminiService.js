import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

function getClient() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API Key not found. Please set GEMINI_API_KEY in your .env file."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

function buildHistory(history = []) {
  return history
    .map((item) => {
      const role =
        item.role === "assistant"
          ? "Assistant"
          : item.role === "system"
          ? "System"
          : "User";

      return `${role}: ${item.content}`;
    })
    .join("\n");
}

export const MULTILINGUAL_SYSTEM_INSTRUCTION =
  "You are BharatSaathi AI, a multilingual AI assistant for Indian users. Detect the language of the user's latest message and always respond in the same language. If the user writes in Hinglish or another mixed-language style, respond naturally in the same mixed-language style. Never switch to Hindi or English unless the user does so.";

export async function generateGeminiResponse({
  prompt,
  history = [],
  systemInstruction,
}) {
  const ai = getClient();

  const conversation = buildHistory(history);

  const finalPrompt = conversation
    ? `${conversation}\nUser: ${prompt}`
    : prompt;

  const effectiveInstruction = systemInstruction
    ? `${MULTILINGUAL_SYSTEM_INSTRUCTION}\n\nAdditional domain guidance:\n${systemInstruction}`
    : `${MULTILINGUAL_SYSTEM_INSTRUCTION}\n\nHelp Indian students, job seekers, farmers, workers and citizens with practical, actionable guidance.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: finalPrompt,
    config: {
      systemInstruction: effectiveInstruction,
      temperature: 0.5,
    },
  });

  return response.text;
}

export async function generateResumeAssist(input) {
  return generateGeminiResponse({
    ...input,
    systemInstruction:
      "You are an expert ATS Resume Writer. Help create or improve professional ATS-friendly resumes.",
  });
}