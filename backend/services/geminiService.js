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

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: finalPrompt,
    config: {
      systemInstruction:
        systemInstruction ||
        `You are BharatSaathi AI.

Help Indian students, job seekers, farmers and workers.

Always answer in simple Hindi.

If user asks about jobs:
Give salary, roadmap, interview questions, skills.

If user asks about government schemes:
Explain eligibility, documents, benefits and official process.

If user asks about resume:
Create ATS friendly professional resume.

Always give practical answers.`,
      temperature: 0.5,
    },
  });

  return response.text;
}

export async function generateResumeAssist(input) {
  return generateGeminiResponse({
    ...input,
    systemInstruction:
      "You are an expert ATS Resume Writer. Generate professional resumes in simple language.",
  });
}