import crypto from "node:crypto";
import { z } from "zod";
import { generateGeminiResponse } from "../services/geminiService.js";

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

export const MULTILINGUAL_CHAT_SYSTEM_INSTRUCTION = `You are BharatSaathi AI, an intelligent, helpful, and empathetic AI assistant for Indian users.

LANGUAGE RULES:
1. Automatically detect the user's language (English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Urdu, Assamese, Odia, etc.).
2. Always respond in the EXACT SAME LANGUAGE and style as the user.
3. If the user writes in Hinglish (Roman Hindi), reply in natural, friendly Hinglish.
4. Never force the user into English if they asked in Hindi/Hinglish or another language.

TOPIC CAPABILITIES:
- Career Guidance & Job Preparation: "Frontend developer kaise bane", "Job lagne ke tips", interview questions, skills roadmap.
- Exam & Competitive Preparation: "Delhi Police preparation", SSC, UPSC, Bank exams, syllabus, strategy.
- Resume & ATS Optimization: "Resume kaise banau", ATS formatting tips, summary writing.
- Government Schemes & Scholarships: Central & State government schemes, scholarships, eligibility, document checklists.
- Programming & Education: "React samjhao", HTML/CSS/JS, Python, coding concepts with code snippets.
- Agriculture & Farming: PM-Kisan, soil health, crop guidance, weather/crop schemes.
- General Assistance: Clear, step-by-step, actionable, and encouraging answers.`;

export async function sendChatMessage(req, res, next) {
  try {
    const payload = chatMessageSchema.parse(req.body);

    const conversationId = payload.conversationId || crypto.randomUUID();

    const answerText = await generateGeminiResponse({
      prompt: payload.message,
      history: payload.history.slice(-12),
      systemInstruction: MULTILINGUAL_CHAT_SYSTEM_INSTRUCTION,
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