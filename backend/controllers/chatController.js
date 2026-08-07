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
  const hindiPattern = /[\u0900-\u097F]/; // Devanagari script
  const hinglishPattern = /\b(kya|kaise|hai|hoga|karein|kar|sakta|hai|kripya|please|thanks|dhanyawad)\b/i;
  
  if (hindiPattern.test(text)) {
    return 'hindi';
  } else if (hinglishPattern.test(text)) {
    return 'hinglish';
  }
  return 'english';
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
      const outOfScopeResponse = OUT_OF_SCOPE_RESPONSES[detectedLanguage] || OUT_OF_SCOPE_RESPONSES.english;
      
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
      systemInstruction: BHARATSAATHI_SYSTEM_PROMPT,
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