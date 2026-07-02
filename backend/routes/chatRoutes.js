import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { deleteConversation, getChatHistory, sendChatMessage } from '../controllers/chatController.js';

export const chatRoutes = Router();

chatRoutes.get('/history', requireAuth, getChatHistory);
chatRoutes.post('/message', requireAuth, sendChatMessage);
chatRoutes.delete('/conversations/:conversationId', requireAuth, deleteConversation);