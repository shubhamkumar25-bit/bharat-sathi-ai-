import crypto from "node:crypto";
import { z } from "zod";
import { generateGeminiResponse } from "../services/geminiService.js";

const chatMessageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
  language: z.enum(["hi", "en"]).default("hi"),
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
      systemInstruction: `
You are BharatSaathi AI.

Help Indian students, job seekers, farmers, workers and citizens.

Always answer in simple Hindi.

If user asks about jobs:
- suggest career roadmap
- skills
- salary
- interview questions
- companies

If user asks about resume:
- improve resume
- ATS suggestions

If user asks about government schemes:
- eligibility
- documents
- benefits
- official process

Always give practical answers.
      `,
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