import schemeMatchingService from '../services/schemeMatchingService.js';

/**
 * Scheme Matching Controller
 * Handles HTTP requests for scheme matching and search
 */

export async function matchSchemes(req, res, next) {
  try {
    const profile = req.body;
    
    const result = await schemeMatchingService.matchSchemes(profile);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function searchSchemes(req, res, next) {
  try {
    const { query } = req.query;
    const filters = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }
    
    const result = await schemeMatchingService.searchSchemes(query, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSchemeById(req, res, next) {
  try {
    const { schemeId } = req.params;
    
    const result = await schemeMatchingService.getSchemeById(schemeId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAllSchemes(req, res, next) {
  try {
    const filters = req.query;
    
    const result = await schemeMatchingService.fetchSchemes(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
