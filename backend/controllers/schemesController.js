import { z } from 'zod';
import { deleteBookmark, listBookmarks, saveBookmark } from '../services/firestoreService.js';
import { filterSchemes, schemeCatalog } from '../services/schemeCatalog.js';

const bookmarkSchema = z.object({
  schemeId: z.string().min(1),
  title: z.string().min(1),
  category: z.string().optional(),
  summary: z.string().optional(),
  eligibility: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

export async function listSchemes(req, res) {
  const schemes = filterSchemes({
    query: String(req.query.query || ''),
    category: String(req.query.category || 'all'),
    occupation: String(req.query.occupation || 'all'),
    state: String(req.query.state || 'all'),
  });

  res.json({ schemes, categories: [...new Set(schemeCatalog.map((scheme) => scheme.category))] });
}

export async function addSchemeBookmark(req, res, next) {
  try {
    const payload = bookmarkSchema.parse(req.body);
    const bookmark = await saveBookmark(req.user.uid, payload);
    res.status(201).json({ bookmark });
  } catch (error) {
    next(error);
  }
}

export async function getSchemeBookmarks(req, res, next) {
  try {
    const bookmarks = await listBookmarks(req.user.uid);
    res.json({ bookmarks });
  } catch (error) {
    next(error);
  }
}

export async function removeSchemeBookmark(req, res, next) {
  try {
    await deleteBookmark(req.user.uid, req.params.bookmarkId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}