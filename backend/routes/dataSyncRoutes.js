import express from 'express';
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
