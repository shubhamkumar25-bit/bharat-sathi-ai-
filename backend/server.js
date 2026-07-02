import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes.js';
import { chatRoutes } from './routes/chatRoutes.js';
import { geminiRoutes } from './routes/geminiRoutes.js';
import { resumeRoutes } from './routes/resumeRoutes.js';
import { schemesRoutes } from './routes/schemesRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/schemes', schemesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`BharatSaathi API running on http://localhost:${port}`);
});