import express from 'express';
import {
  matchSchemes,
  searchSchemes,
  getSchemeById,
  getAllSchemes,
} from '../controllers/schemeMatchingController.js';

const router = express.Router();

// Scheme matching
router.post('/match', matchSchemes);

// Scheme search
router.get('/search', searchSchemes);

// Get scheme by ID
router.get('/:schemeId', getSchemeById);

// Get all schemes with optional filters
router.get('/', getAllSchemes);

export default router;
