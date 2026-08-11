import crypto from "node:crypto";
import { z } from "zod";
import { generateGeminiResponse } from "../services/geminiService.js";
import { BHARATSAATHI_SYSTEM_PROMPT, OUT_OF_SCOPE_RESPONSES } from "../config/systemPrompt.js";

const chatMessageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
  language: z.string().optional(),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
      createdAt: z.string().optional(),
      id: z.string().optional(),
    })
  ).default([]),
});

// Language detection helper function
function detectLanguage(text) {
  if (!text || !text.trim()) return 'english';

  // 1. Devanagari script → pure Hindi
  const hindiScriptPattern = /[\u0900-\u097F]/;
  if (hindiScriptPattern.test(text)) return 'hindi';

  // 2. Other Indian scripts → treat as regional (respond in that script)
  const otherIndianScripts = /[\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0600-\u06FF]/;
  if (otherIndianScripts.test(text)) return 'regional';

  // 3. Latin script — distinguish English from Hinglish
  // Hinglish: common romanised Hindi words that wouldn't appear in pure English
  const hinglishWords = /\b(kya|kaise|kyun|kyunki|kaun|kahan|kab|kitna|kitni|woh|yeh|ye|vo|aur|hai|hain|tha|thi|the|ho|hoga|hogi|hoge|kar|karo|karna|karein|karta|karti|karte|nahi|nahin|nhi|mat|mujhe|mujhko|mera|meri|mere|tera|teri|tere|aapka|aapki|apna|apni|apne|hum|tum|aap|main|mein|bhi|toh|to|se|ke|ki|ka|pe|par|mein|ab|abhi|phir|fir|lekin|par|bas|sirf|bahut|thoda|zyada|accha|achha|theek|sahi|galat|bata|batao|bataye|chahiye|chahte|chahta|chahti|milega|milegi|milte|dena|dedo|lena|lelo|aana|jao|jana|raho|dekho|suno|padho|likho|karo|puchho|samjho|bolo|bolna|sunna|dekhna|jaana|aana|rehna|reh|kuch|koi|sab|sabhi|pura|poora|saath|liye|wala|wali|wale|waala|waali|waale)\b/i;

  // Count Latin words vs Hinglish words
  const words = text.trim().split(/\s+/);
  const hinglishMatches = (text.match(hinglishWords) || []).length;
  const hinglishRatio = words.length > 0 ? hinglishMatches / words.length : 0;

  // If more than 20% of words are Hinglish markers → Hinglish
  if (hinglishRatio >= 0.2) return 'hinglish';

  // 4. Pure Latin with no Hinglish markers → English
  return 'english';
}

// Build a one-line language instruction to prepend to the system prompt
function buildLanguageHint(detectedLanguage) {
  const hints = {
    hindi:    'IMPORTANT: The user is writing in Hindi (Devanagari script). You MUST reply entirely in Hindi using Devanagari script. Do NOT switch to English.',
    hinglish: 'IMPORTANT: The user is writing in Hinglish (romanised Hindi-English mix). You MUST reply in natural Hinglish using Latin script. Do NOT switch to pure Hindi or pure English.',
    english:  'IMPORTANT: The user is writing in English. You MUST reply entirely in English. Do NOT switch to Hindi or Hinglish.',
    regional: 'IMPORTANT: The user is writing in a regional Indian language. Detect the exact script and reply in the same language and script.',
  };
  return hints[detectedLanguage] || hints.english;
}

// Out of scope detection
function isOutOfScope(message) {
  const outOfScopeTopics = [
    'politics', 'religion', 'entertainment', 'movies', 'sports', 
    'news', 'coding', 'programming', 'mathematics', 'medical advice',
    'legal advice', 'finance', 'stock market', 'cryptocurrency',
    'personal opinions', 'weather', 'jokes', 'games'
  ];
  
  const lowerMessage = message.toLowerCase();
  return outOfScopeTopics.some(topic => lowerMessage.includes(topic));
}

export async function sendChatMessage(req, res, next) {
  try {
    const payload = chatMessageSchema.parse(req.body);

    const conversationId = payload.conversationId || crypto.randomUUID();

    // Detect language
    const detectedLanguage = detectLanguage(payload.message);

    // Check if message is out of scope
    if (isOutOfScope(payload.message)) {
      const lang = ['hindi', 'hinglish', 'english', 'regional'].includes(detectedLanguage)
        ? detectedLanguage
        : 'english';
      const outOfScopeResponse = OUT_OF_SCOPE_RESPONSES[lang] || OUT_OF_SCOPE_RESPONSES.english;
      
      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: payload.message,
        createdAt: new Date().toISOString(),
      };

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: outOfScopeResponse,
        createdAt: new Date().toISOString(),
      };

      return res.json({
        conversationId,
        answer: outOfScopeResponse,
        messages: [userMessage, assistantMessage],
        detectedLanguage,
      });
    }

    const answerText = await generateGeminiResponse({
      prompt: payload.message,
      history: payload.history.slice(-12),
      systemInstruction: `${buildLanguageHint(detectedLanguage)}\n\n${BHARATSAATHI_SYSTEM_PROMPT}`,
    });

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: payload.message,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: answerText || "Pardon, I could not process your message. Please try again.",
      createdAt: new Date().toISOString(),
    };

    return res.json({
      conversationId,
      answer: answerText || "",
      messages: [userMessage, assistantMessage],
      detectedLanguage,
    });
  } catch (error) {
    next(error);
  }
}

export async function getChatHistory(req, res) {
  return res.json({
    conversations: [],
  });
}

export async function deleteConversation(req, res) {
  return res.json({
    success: true,
  });
}