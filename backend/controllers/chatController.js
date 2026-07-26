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

export async function sendChatMessage(req, res, next) {
  try {
    const payload = chatMessageSchema.parse(req.body);

    const conversationId =
      payload.conversationId || crypto.randomUUID();

    const answerText = await generateGeminiResponse({
      prompt: payload.message,
      history: payload.history.slice(-12),
      systemInstruction: `You are BharatSaathi AI, an intelligent, empathetic, and friendly AI assistant.
Answer any question asked by the user in detail:
1. Programming & Learning: If user asks for courses (HTML, CSS, JavaScript, React, Python, etc.), provide a structured, step-by-step learning guide with code snippets and practical projects.
2. Career & Job Advice: If user asks why they aren't getting a job or how to get hired, give actionable advice on ATS resumes, missing skills, portfolio projects, GitHub profile, and interview preparation.
3. Government Schemes & Services: Explain eligibility, required documents, benefits, and official application process.
4. General Assistance: Always give practical, encouraging, and clear answers in the user's preferred language (Hindi, Hinglish, English, etc.).`,
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
      content: answerText,
      createdAt: new Date().toISOString(),
    };

    // Firestore disabled temporarily

    return res.json({
      conversationId,
      answer: answerText,
      messages: [
        userMessage,
        assistantMessage,
      ],
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