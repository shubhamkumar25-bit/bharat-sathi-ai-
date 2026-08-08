import express from 'express';
import { getStates, getDistricts } from '../controllers/locationController.js';

const router = express.Router();

// Get all states
router.get('/states', getStates);

// Get districts (optionally filtered by state)
router.get('/districts', getDistricts);

export default router;
