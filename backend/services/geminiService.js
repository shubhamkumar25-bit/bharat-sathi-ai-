// Uses Gemini REST API directly — works with both AIzaSy and AQ. format keys

const MODEL = "gemini-2.5-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function getApiKey() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API Key not found. Please set GOOGLE_AI_API_KEY in your .env file."
    );
  }
  return apiKey;
}

function buildHistory(history = []) {
  return history
    .map((item) => {
      const role =
        item.role === "assistant" ? "Assistant"
        : item.role === "system"  ? "System"
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
  const apiKey = getApiKey();

  const conversation = buildHistory(history);
  const finalPrompt  = conversation ? `${conversation}\nUser: ${prompt}` : prompt;

  const effectiveInstruction = systemInstruction
    ? `${MULTILINGUAL_SYSTEM_INSTRUCTION}\n\nAdditional domain guidance:\n${systemInstruction}`
    : `${MULTILINGUAL_SYSTEM_INSTRUCTION}\n\nHelp Indian students, job seekers, farmers, workers and citizens with practical, actionable guidance.`;

  const body = {
    system_instruction: {
      parts: [{ text: effectiveInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: finalPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.5,
    },
  };

  const url = `${BASE_URL}/${MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // Extract text from response
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response.");

  return text;
}

export async function generateResumeAssist(input) {
  return generateGeminiResponse({
    ...input,
    systemInstruction:
      "You are an expert ATS Resume Writer. Help create or improve professional ATS-friendly resumes.",
  });
}
