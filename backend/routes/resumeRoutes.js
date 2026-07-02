import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  analyzeResumeById,
  createResume,
  deleteResumeById,
  duplicateResumeById,
  exportResumeById,
  generateResumeCopy,
  getResumeById,
  getResumes,
  updateResumeById,
} from '../controllers/resumeController.js';

export const resumeRoutes = Router();

resumeRoutes.get('/', requireAuth, getResumes);
resumeRoutes.post('/', requireAuth, createResume);
resumeRoutes.post('/generate', requireAuth, generateResumeCopy);
resumeRoutes.get('/:resumeId', requireAuth, getResumeById);
resumeRoutes.patch('/:resumeId', requireAuth, updateResumeById);
resumeRoutes.delete('/:resumeId', requireAuth, deleteResumeById);
resumeRoutes.post('/:resumeId/duplicate', requireAuth, duplicateResumeById);
resumeRoutes.get('/:resumeId/analyze', requireAuth, analyzeResumeById);
resumeRoutes.get('/:resumeId/export', requireAuth, exportResumeById);