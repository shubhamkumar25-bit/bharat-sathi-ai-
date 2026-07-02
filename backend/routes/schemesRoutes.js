import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { addSchemeBookmark, getSchemeBookmarks, listSchemes, removeSchemeBookmark } from '../controllers/schemesController.js';

export const schemesRoutes = Router();

schemesRoutes.get('/', requireAuth, listSchemes);
schemesRoutes.get('/bookmarks', requireAuth, getSchemeBookmarks);
schemesRoutes.post('/bookmarks', requireAuth, addSchemeBookmark);
schemesRoutes.delete('/bookmarks/:bookmarkId', requireAuth, removeSchemeBookmark);