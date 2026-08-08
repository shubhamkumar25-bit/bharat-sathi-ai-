import dataSyncService from '../services/dataSyncService.js';
import dataGovService from '../services/dataGovService.js';

/**
 * Data Sync Controller
 * Handles HTTP requests for data synchronization operations
 */

export async function initializeDatasetRegistry(req, res, next) {
  try {
    const result = await dataSyncService.initializeDatasetRegistry();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function syncDataset(req, res, next) {
  try {
    const { datasetId } = req.params;
    const options = req.body || {};
    
    const result = await dataSyncService.syncDataset(datasetId, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function syncAllDatasets(req, res, next) {
  try {
    const result = await dataSyncService.syncAllDatasets();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getDatasetStatus(req, res, next) {
  try {
    const { datasetId } = req.params;
    const result = await dataSyncService.getSyncStatus(datasetId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAllDatasetsStatus(req, res, next) {
  try {
    const result = await dataSyncService.getAllDatasetsStatus();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSyncLogs(req, res, next) {
  try {
    const { datasetId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const result = await dataSyncService.getSyncLogs(datasetId, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function toggleDataset(req, res, next) {
  try {
    const { datasetId } = req.params;
    const { enabled } = req.body;
    
    const result = await dataSyncService.toggleDataset(datasetId, enabled);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function fetchDatasetData(req, res, next) {
  try {
    const { resourceId } = req.params;
    const filters = req.query;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const result = await dataGovService.fetchDataset(resourceId, filters, limit, offset);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
