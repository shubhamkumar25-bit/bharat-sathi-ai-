import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminAuthMiddleware.js';
import {
  initializeDatasetRegistry,
  syncDataset,
  syncAllDatasets,
  getDatasetStatus,
  getAllDatasetsStatus,
  getSyncLogs,
  toggleDataset,
  fetchDatasetData,
} from '../controllers/dataSyncController.js';

const router = express.Router();

// Secure all routes with authentication and admin authorization
router.use(requireAuth);
router.use(requireAdmin);

// Initialize dataset registry
router.post('/registry/initialize', initializeDatasetRegistry);

// Sync operations
router.post('/sync/:datasetId', syncDataset);
router.post('/sync-all', syncAllDatasets);

// Dataset status
router.get('/datasets', getAllDatasetsStatus);
router.get('/datasets/:datasetId', getDatasetStatus);
router.patch('/datasets/:datasetId/toggle', toggleDataset);

// Sync logs
router.get('/datasets/:datasetId/logs', getSyncLogs);

// Direct data fetching (for testing)
router.get('/fetch/:resourceId', fetchDatasetData);

export default router;
