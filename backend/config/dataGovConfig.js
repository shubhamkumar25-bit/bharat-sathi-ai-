// Data.gov.in API Configuration
// This file contains the configuration for Data.gov.in API integration

export const DATA_GOV_CONFIG = {
  // Base URL for Data.gov.in API
  BASE_URL: process.env.DATA_GOV_BASE_URL || 'https://api.data.gov.in',
  
  // API Key (should be set in environment variable)
  API_KEY: process.env.DATA_GOV_API_KEY,
  
  // Resource IDs for specific datasets
  RESOURCE_IDS: {
    // Local Government Directory (LGD) - States, Districts, Local government info
    LGD: '579b464db66ec23bdd000001d60688f740b7481e6dd60ddba514a935',
    
    // MSME / UDYAM Registered Units
    MSME: '579b464db66ec23bdd000001d26659b8597046b97da55739a8cc995f',
    
    // Government scheme / expenditure / assistance dataset
    GOVERNMENT_SCHEMES: '579b464db66ec23bdd000001cfa1e80844734f394d0b0845f8dccee5',
  },
  
  // Dataset categories
  CATEGORIES: {
    LOCATION: 'LOCATION',
    WOMEN: 'WOMEN',
    PENSION: 'PENSION',
    EMPLOYMENT: 'EMPLOYMENT',
    MSME: 'MSME',
    AGRICULTURE: 'AGRICULTURE',
    FINANCE: 'FINANCE',
    HEALTH: 'HEALTH',
    EDUCATION: 'EDUCATION',
    HOUSING: 'HOUSING',
  },
  
  // API settings
  API_SETTINGS: {
    DEFAULT_LIMIT: 100,
    MAX_LIMIT: 1000,
    RATE_LIMIT_DELAY: 1000, // 1 second between requests
    TIMEOUT: 30000, // 30 seconds
  },
  
  // Dataset registry configuration
  DATASET_REGISTRY: [
    {
      id: 'lgd-states',
      name: 'Local Government Directory - States',
      resource_id: '579b464db66ec23bdd000001d60688f740b7481e6dd60ddba514a935',
      category: 'LOCATION',
      description: 'States and union territories of India',
      api_available: true,
      status: 'ACTIVE',
    },
    {
      id: 'lgd-districts',
      name: 'Local Government Directory - Districts',
      resource_id: '579b464db66ec23bdd000001d60688f740b7481e6dd60ddba514a935',
      category: 'LOCATION',
      description: 'Districts of India by state',
      api_available: true,
      status: 'ACTIVE',
    },
    {
      id: 'msme-udyam',
      name: 'MSME / UDYAM Registered Units',
      resource_id: '579b464db66ec23bdd000001d26659b8597046b97da55739a8cc995f',
      category: 'MSME',
      description: 'MSME and UDYAM registered business units',
      api_available: true,
      status: 'ACTIVE',
    },
    {
      id: 'gov-schemes',
      name: 'Government Schemes Dataset',
      resource_id: '579b464db66ec23bdd000001cfa1e80844734f394d0b0845f8dccee5',
      category: 'GOVERNMENT_SCHEMES',
      description: 'Central and state government schemes',
      api_available: true,
      status: 'ACTIVE',
    },
  ],
};

// Validation function to check if API key is configured
export function validateDataGovConfig() {
  if (!DATA_GOV_CONFIG.API_KEY) {
    throw new Error('DATA_GOV_API_KEY environment variable is not set. Please configure it in .env file.');
  }
  
  if (!DATA_GOV_CONFIG.BASE_URL) {
    throw new Error('DATA_GOV_BASE_URL environment variable is not set.');
  }
  
  return true;
}

export default DATA_GOV_CONFIG;
