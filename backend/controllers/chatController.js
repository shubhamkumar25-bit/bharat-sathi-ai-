import crypto from 'node:crypto';
import { z } from 'zod';
import { addActivity, clearConversation, listConversations, saveConversationTurn } from '../services/firestoreService.js';
import { generateGeminiResponse } from '../services/geminiService.js';

const chatMessageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
  language: z.enum(['hi', 'en']).default('hi'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    createdAt: z.string().optional(),
    id: z.string().optional(),
  })).default([]),
});

export async function sendChatMessage(req, res, next) {
  try {
    const payload = chatMessageSchema.parse(req.body);
    const conversationId = payload.conversationId || crypto.randomUUID();
    const answerText = await generateGeminiResponse({
      prompt: payload.message,
      history: payload.history.slice(-12),
      systemInstruction: 'You are BharatSaathi AI. Help Indian students, job seekers, farmers and workers. Always answer in simple Hindi. Provide practical solutions.',
    });

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: payload.message,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: answerText,
      createdAt: new Date().toISOString(),
    };

    const conversation = await saveConversationTurn({
      userId: req.user.uid,
      conversationId,
      message: userMessage,
      answer: assistantMessage,
      title: payload.message.slice(0, 48),
    });

    await addActivity(req.user.uid, {
      type: 'chat',
      title: payload.message.slice(0, 64),
      meta: { conversationId },
    });

    return res.json({
      conversationId,
      answer: answerText,
      messages: conversation.messages,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getChatHistory(req, res, next) {
  try {
    const limitCount = Number(req.query.limit || 20);
    const conversations = await listConversations(req.user.uid, limitCount);
    return res.json({ conversations });
  } catch (error) {
    return next(error);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    await clearConversation(req.user.uid, req.params.conversationId);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}