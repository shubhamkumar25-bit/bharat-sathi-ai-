import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { generateChatReply, generateTaskOutput } from '../controllers/geminiController.js';

export const geminiRoutes = Router();

geminiRoutes.post('/chat', requireAuth, generateChatReply);
geminiRoutes.post('/task', requireAuth, generateTaskOutput);                                                                                                                                                                                                                                                                  

