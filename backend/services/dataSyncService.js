import dataGovService from './dataGovService.js';
import { DATA_GOV_CONFIG } from '../config/dataGovConfig.js';
import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

/**
 * Data Sync Service
 * Handles synchronization of Data.gov.in datasets with Firestore
 */

class DataSyncService {
  constructor() {
    try {
      this.db = getFirebaseAdminDb();
      this.firebaseAvailable = true;
    } catch (error) {
      console.warn('Firebase Admin not available. Data sync will be disabled.');
      this.db = null;
      this.firebaseAvailable = false;
    }
  }

  /**
   * Initialize dataset registry in Firestore
   */
  async initializeDatasetRegistry() {
    if (!this.firebaseAvailable || !this.db) {
      return {
        success: false,
        error: 'Firebase not available. Cannot initialize dataset registry.',
      };
    }

    try {
      const batch = this.db.batch();
      
      for (const dataset of DATA_GOV_CONFIG.DATASET_REGISTRY) {
        const docRef = this.db.collection('datasets').doc(dataset.id);
        batch.set(docRef, {
          ...dataset,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { merge: true });
      }
      
      await batch.commit();
      
      return {
        success: true,
        message: 'Dataset registry initialized successfully',
        count: DATA_GOV_CONFIG.DATASET_REGISTRY.length,
      };
    } catch (error) {
      console.error('Error initializing dataset registry:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sync a specific dataset from Data.gov.in
   * @param {string} datasetId - Dataset identifier
   * @param {Object} options - Sync options
   */
  async syncDataset(datasetId, options = {}) {
    const startTime = Date.now();
    const syncId = `${datasetId}-${startTime}`;
    
    try {
      // Get dataset configuration
      const datasetConfig = DATA_GOV_CONFIG.DATASET_REGISTRY.find(d => d.id === datasetId);
      
      if (!datasetConfig) {
        throw new Error(`Dataset configuration not found for: ${datasetId}`);
      }

      // Update dataset status to syncing
      await dataGovService.updateDatasetMetadata(datasetId, {
        status: 'SYNCING',
        last_sync_started_at: new Date().toISOString(),
      });

      // Log sync start
      await dataGovService.logSync(datasetId, {
        sync_id: syncId,
        status: 'STARTED',
        message: 'Sync started',
      });

      // Fetch records from Data.gov.in
      const fetchResult = await dataGovService.fetchAllRecords(
        datasetConfig.resource_id,
        options.filters || {}
      );

      if (!fetchResult.success) {
        throw new Error(`Failed to fetch records: ${fetchResult.error}`);
      }

      // Normalize records
      const normalizedRecords = dataGovService.normalizeRecords(
        datasetId,
        fetchResult.data
      );

      // Save to Firestore
      const collectionName = this.getCollectionName(datasetId);
      const saveResult = await dataGovService.saveRecords(
        collectionName,
        normalizedRecords,
        datasetId
      );

      if (!saveResult.success) {
        throw new Error(`Failed to save records: ${saveResult.error}`);
      }

      // Update dataset metadata
      await dataGovService.updateDatasetMetadata(datasetId, {
        status: 'ACTIVE',
        last_sync_completed_at: new Date().toISOString(),
        last_sync_duration: Date.now() - startTime,
        record_count: saveResult.count,
        api_available: true,
      });

      // Log sync completion
      await dataGovService.logSync(datasetId, {
        sync_id: syncId,
        status: 'COMPLETED',
        message: 'Sync completed successfully',
        records_processed: saveResult.count,
        duration: Date.now() - startTime,
      });

      return {
        success: true,
        datasetId,
        recordsProcessed: saveResult.count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`Error syncing dataset ${datasetId}:`, error);

      // Update dataset status to error
      await dataGovService.updateDatasetMetadata(datasetId, {
        status: 'ERROR',
        last_sync_error: error.message,
        last_sync_failed_at: new Date().toISOString(),
      });

      // Log sync failure
      await dataGovService.logSync(datasetId, {
        sync_id: syncId,
        status: 'FAILED',
        message: error.message,
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        datasetId,
        error: error.message,
      };
    }
  }

  /**
   * Sync all active datasets
   */
  async syncAllDatasets() {
    const results = [];
    
    for (const dataset of DATA_GOV_CONFIG.DATASET_REGISTRY) {
      if (dataset.status === 'ACTIVE') {
        const result = await this.syncDataset(dataset.id);
        results.push(result);
      }
    }
    
    return {
      success: true,
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };
  }

  /**
   * Get collection name for a dataset
   * @param {string} datasetId - Dataset identifier
   */
  getCollectionName(datasetId) {
    const collectionMap = {
      'lgd-states': 'states',
      'lgd-districts': 'districts',
      'msme-udyam': 'msme_units',
      'gov-schemes': 'government_schemes',
    };
    
    return collectionMap[datasetId] || `dataset_${datasetId}`;
  }

  /**
   * Get sync status for a dataset
   * @param {string} datasetId - Dataset identifier
   */
  async getSyncStatus(datasetId) {
    if (!this.firebaseAvailable || !this.db) {
      return {
        success: false,
        error: 'Firebase not available',
      };
    }

    try {
      const doc = await this.db.collection('datasets').doc(datasetId).get();
      
      if (!doc.exists) {
        return {
          success: false,
          error: 'Dataset not found',
        };
      }
      
      return {
        success: true,
        data: doc.data(),
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all datasets status
   */
  async getAllDatasetsStatus() {
    if (!this.firebaseAvailable || !this.db) {
      return {
        success: false,
        error: 'Firebase not available',
        data: [],
      };
    }

    try {
      const snapshot = await this.db.collection('datasets').get();
      const datasets = [];
      
      snapshot.forEach(doc => {
        datasets.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return {
        success: true,
        data: datasets,
      };
    } catch (error) {
      console.error('Error getting all datasets status:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get sync logs for a dataset
   * @param {string} datasetId - Dataset identifier
   * @param {number} limit - Number of logs to retrieve
   */
  async getSyncLogs(datasetId, limit = 10) {
    if (!this.firebaseAvailable || !this.db) {
      return {
        success: false,
        error: 'Firebase not available',
        data: [],
      };
    }

    try {
      const snapshot = await this.db
        .collection('sync_logs')
        .where('dataset_id', '==', datasetId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get();
      
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return {
        success: true,
        data: logs,
      };
    } catch (error) {
      console.error('Error getting sync logs:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Enable/disable a dataset
   * @param {string} datasetId - Dataset identifier
   * @param {boolean} enabled - Enable or disable
   */
  async toggleDataset(datasetId, enabled) {
    try {
      await dataGovService.updateDatasetMetadata(datasetId, {
        status: enabled ? 'ACTIVE' : 'DISABLED',
      });
      
      return {
        success: true,
        message: `Dataset ${enabled ? 'enabled' : 'disabled'} successfully`,
      };
    } catch (error) {
      console.error('Error toggling dataset:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new DataSyncService();
