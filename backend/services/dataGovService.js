import { DATA_GOV_CONFIG, validateDataGovConfig } from '../config/dataGovConfig.js';
import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

/**
 * Data.gov.in API Service
 * Handles all interactions with Data.gov.in API including fetching datasets, records, and normalization
 */

class DataGovService {
  constructor() {
    try {
      this.db = getFirebaseAdminDb();
      this.firebaseAvailable = true;
    } catch (error) {
      console.warn('Firebase Admin not available. Data.gov.in integration will be disabled.');
      this.db = null;
      this.firebaseAvailable = false;
    }
    this.rateLimitDelay = DATA_GOV_CONFIG.API_SETTINGS.RATE_LIMIT_DELAY;
    this.lastRequestTime = 0;
  }

  /**
   * Enforce rate limiting between API requests
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch dataset from Data.gov.in API
   * @param {string} resourceId - The Data.gov.in resource ID
   * @param {Object} filters - Optional filters for the API request
   * @param {number} limit - Number of records to fetch
   * @param {number} offset - Offset for pagination
   */
  async fetchDataset(resourceId, filters = {}, limit = 100, offset = 0) {
    try {
      validateDataGovConfig();
      await this.enforceRateLimit();

      const url = new URL(`${DATA_GOV_CONFIG.BASE_URL}/resource/${resourceId}.json`);
      
      // Add API key
      url.searchParams.append('api-key', DATA_GOV_CONFIG.API_KEY);
      
      // Add limit and offset
      url.searchParams.append('limit', Math.min(limit, DATA_GOV_CONFIG.API_SETTINGS.MAX_LIMIT).toString());
      url.searchParams.append('offset', offset.toString());
      
      // Add filters if provided
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(`filters[${key}]`, value.toString());
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(DATA_GOV_CONFIG.API_SETTINGS.TIMEOUT),
      });

      if (!response.ok) {
        throw new Error(`Data.gov.in API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.records || data,
        total: data.total_records || data.length,
        limit: data.limit || limit,
        offset: data.offset || offset,
      };
    } catch (error) {
      console.error('Error fetching dataset from Data.gov.in:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        total: 0,
      };
    }
  }

  /**
   * Fetch all records from a dataset with pagination
   * @param {string} resourceId - The Data.gov.in resource ID
   * @param {Object} filters - Optional filters
   */
  async fetchAllRecords(resourceId, filters = {}) {
    const allRecords = [];
    let offset = 0;
    const limit = DATA_GOV_CONFIG.API_SETTINGS.DEFAULT_LIMIT;
    let hasMore = true;

    while (hasMore) {
      const result = await this.fetchDataset(resourceId, filters, limit, offset);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          data: allRecords,
        };
      }

      allRecords.push(...result.data);
      
      // Check if we've fetched all records
      if (result.data.length < limit || allRecords.length >= result.total) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    return {
      success: true,
      data: allRecords,
      total: allRecords.length,
    };
  }

  /**
   * Normalize LGD (Local Government Directory) data
   * @param {Array} records - Raw LGD records
   */
  normalizeLGDData(records) {
    return records.map(record => ({
      state_code: record.state_code || record.Statecode,
      state_name: record.state_name || record.Statename || record.State,
      district_code: record.district_code || record.Districtcode,
      district_name: record.district_name || record.Districtname || record.District,
      level: record.level || record.Level,
      raw_data: record,
    }));
  }

  /**
   * Normalize MSME data
   * @param {Array} records - Raw MSME records
   */
  normalizeMSMEData(records) {
    return records.map(record => ({
      udyam_number: record.udyam_number || record.UdyamNumber,
      business_name: record.business_name || record.BusinessName,
      state: record.state || record.State,
      district: record.district || record.District,
      sector: record.sector || record.Sector,
      registration_date: record.registration_date || record.RegistrationDate,
      raw_data: record,
    }));
  }

  /**
   * Normalize Government Schemes data
   * @param {Array} records - Raw scheme records
   */
  normalizeSchemeData(records) {
    return records.map(record => ({
      scheme_name: record.scheme_name || record.SchemeName || record.name,
      ministry: record.ministry || record.Ministry || record.ministry_name,
      central_state: record.central_state || record.CentralState || record.level,
      state: Array.isArray(record.state) ? record.state : 
             (record.state ? [record.state] : 
             (record.State ? [record.State] : ['all'])),
      category: record.category || record.Category || record.sector,
      age_requirement: record.age_requirement || record.AgeRequirement,
      gender_requirement: record.gender_requirement || record.GenderRequirement,
      caste_category: record.caste_category || record.CasteCategory,
      disability_requirement: record.disability_requirement || record.DisabilityRequirement,
      income_limit: record.income_limit || record.IncomeLimit,
      benefits: Array.isArray(record.benefits) ? record.benefits : 
                (record.benefits ? [record.benefits] : []),
      required_documents: Array.isArray(record.required_documents) ? record.required_documents :
                          (record.documents ? [record.documents] : []),
      application_process: record.application_process || record.ApplicationProcess,
      official_url: record.official_url || record.OfficialUrl || record.website,
      last_verified_date: record.last_verified_date || record.LastVerifiedDate || new Date().toISOString(),
      source: 'Data.gov.in',
      // Beneficiary/Usage Statistics (from government data)
      beneficiary_count: record.beneficiary_count || record.total_beneficiaries || record.beneficiaries || null,
      applications_received: record.applications_received || record.applications || null,
      applications_approved: record.applications_approved || record.approved_applications || record.sanctioned_applications || null,
      amount_disbursed: record.amount_disbursed || record.funds_disbursed || record.disbursement_amount || null,
      beneficiary_data_source: record.beneficiary_data_source || record.data_source || null,
      beneficiary_data_period: record.beneficiary_data_period || record.data_period || record.fiscal_year || null,
      beneficiary_data_last_updated: record.beneficiary_data_last_updated || record.data_last_updated || null,
      // Bharat Sathi User Ratings
      bharat_sathi_rating: record.bharat_sathi_rating || record.user_rating || null,
      bharat_sathi_rating_count: record.bharat_sathi_rating_count || record.rating_count || record.user_ratings || null,
      raw_data: record,
    }));
  }

  /**
   * Generic normalization function based on dataset type
   * @param {string} datasetId - Dataset identifier
   * @param {Array} records - Raw records
   */
  normalizeRecords(datasetId, records) {
    switch (datasetId) {
      case 'lgd-states':
      case 'lgd-districts':
        return this.normalizeLGDData(records);
      case 'msme-udyam':
        return this.normalizeMSMEData(records);
      case 'gov-schemes':
        return this.normalizeSchemeData(records);
      default:
        // Return raw data if no specific normalization is available
        return records.map(record => ({ raw_data: record }));
    }
  }

  /**
   * Save normalized records to Firestore
   * @param {string} collectionName - Firestore collection name
   * @param {Array} records - Normalized records
   * @param {string} datasetId - Dataset identifier for tracking
   */
  async saveRecords(collectionName, records, datasetId) {
    if (!this.firebaseAvailable || !this.db) {
      console.warn('Firebase not available. Skipping save to Firestore.');
      return { success: false, error: 'Firebase not available' };
    }

    try {
      const batch = this.db.batch();
      const collectionRef = this.db.collection(collectionName);
      
      // Delete existing records for this dataset
      const existingSnapshot = await collectionRef
        .where('dataset_id', '==', datasetId)
        .get();
      
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Add new records
      records.forEach(record => {
        const docRef = collectionRef.doc();
        batch.set(docRef, {
          ...record,
          dataset_id: datasetId,
          created_at: new Date().toISOString(),
        });
      });
      
      await batch.commit();
      return { success: true, count: records.length };
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update dataset metadata
   * @param {string} datasetId - Dataset identifier
   * @param {Object} metadata - Metadata to update
   */
  async updateDatasetMetadata(datasetId, metadata) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available' };
    }

    try {
      const docRef = this.db.collection('datasets').doc(datasetId);
      await docRef.set({
        ...metadata,
        updated_at: new Date().toISOString(),
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating dataset metadata:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Log sync operation
   * @param {string} datasetId - Dataset identifier
   * @param {Object} syncDetails - Sync operation details
   */
  async logSync(datasetId, syncDetails) {
    if (!this.firebaseAvailable || !this.db) {
      return { success: false, error: 'Firebase not available' };
    }

    try {
      const logRef = this.db.collection('sync_logs').doc();
      await logRef.set({
        dataset_id: datasetId,
        ...syncDetails,
        created_at: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error logging sync:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new DataGovService();
