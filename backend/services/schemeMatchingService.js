import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

/**
 * Scheme Matching Service
 * Database-driven scheme matching using Firestore data from Data.gov.in
 */

class SchemeMatchingService {
  constructor() {
    try {
      this.db = getFirebaseAdminDb();
      this.firebaseAvailable = true;
    } catch (error) {
      console.warn('Firebase Admin not available. Scheme matching will use fallback.');
      this.db = null;
      this.firebaseAvailable = false;
    }
  }

  /**
   * Fetch schemes from Firestore database
   * @param {Object} filters - Optional filters for schemes
   */
  async fetchSchemes(filters = {}) {
    if (!this.firebaseAvailable || !this.db) {
      return {
        success: false,
        error: 'Firebase not available',
        data: [],
        count: 0,
      };
    }

    try {
      let query = this.db.collection('government_schemes');
      
      // Apply filters if provided
      if (filters.state) {
        query = query.where('state', 'array-contains', filters.state);
      }
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters.central_state) {
        query = query.where('central_state', '==', filters.central_state);
      }
      
      const snapshot = await query.limit(100).get();
      const schemes = [];
      
      snapshot.forEach(doc => {
        schemes.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return {
        success: true,
        data: schemes,
        count: schemes.length,
      };
    } catch (error) {
      console.error('Error fetching schemes from Firestore:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Match schemes based on user eligibility profile
   * @param {Object} profile - User eligibility profile
   */
  async matchSchemes(profile) {
    try {
      // Fetch all schemes from database
      const result = await this.fetchSchemes();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          matches: [],
        };
      }

      const schemes = result.data;
      const matches = [];

      // Evaluate each scheme against the profile
      for (const scheme of schemes) {
        const matchResult = this.evaluateEligibility(profile, scheme);
        
        if (matchResult.isMatch) {
          matches.push({
            scheme: scheme,
            matchCategory: matchResult.category,
            confidenceScore: matchResult.confidence,
            eligibilityExplanation: matchResult.explanation,
            eligibilityReason: matchResult.reason,
          });
        }
      }

      // Sort matches by confidence score
      matches.sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.confidenceScore] - confidenceOrder[a.confidenceScore];
      });

      return {
        success: true,
        matches,
        total: matches.length,
      };
    } catch (error) {
      console.error('Error matching schemes:', error);
      return {
        success: false,
        error: error.message,
        matches: [],
      };
    }
  }

  /**
   * Evaluate eligibility for a single scheme
   * @param {Object} profile - User eligibility profile
   * @param {Object} scheme - Scheme data from database
   */
  evaluateEligibility(profile, scheme) {
    let matchScore = 0;
    let totalCriteria = 0;
    const explanation = [];
    const reasons = [];

    // Age check
    if (scheme.age_requirement && profile.age) {
      totalCriteria++;
      if (this.checkAgeRequirement(profile.age, scheme.age_requirement)) {
        matchScore++;
        explanation.push(`Age ${profile.age} meets requirement: ${scheme.age_requirement}`);
        reasons.push('Age matches');
      } else {
        explanation.push(`Age ${profile.age} does not meet requirement: ${scheme.age_requirement}`);
      }
    }

    // Gender check
    if (scheme.gender_requirement && profile.gender) {
      totalCriteria++;
      if (this.checkGenderRequirement(profile.gender, scheme.gender_requirement)) {
        matchScore++;
        explanation.push(`Gender ${profile.gender} matches requirement: ${scheme.gender_requirement}`);
        reasons.push('Gender matches');
      } else {
        explanation.push(`Gender ${profile.gender} does not match requirement: ${scheme.gender_requirement}`);
      }
    }

    // Caste category check
    if (scheme.caste_category && profile.casteCategory) {
      totalCriteria++;
      if (this.checkCasteRequirement(profile.casteCategory, scheme.caste_category)) {
        matchScore++;
        explanation.push(`Caste category ${profile.casteCategory} matches: ${scheme.caste_category}`);
        reasons.push('Caste category matches');
      } else {
        explanation.push(`Caste category ${profile.casteCategory} does not match: ${scheme.caste_category}`);
      }
    }

    // State check
    if (scheme.state && profile.state) {
      totalCriteria++;
      if (scheme.state.includes('all') || scheme.state.includes(profile.state)) {
        matchScore++;
        explanation.push(`State ${profile.state} is covered by scheme`);
        reasons.push('State matches');
      } else {
        explanation.push(`State ${profile.state} is not covered by scheme`);
      }
    }

    // Rural/Urban check
    if (scheme.rural_urban_requirement && profile.areaType) {
      totalCriteria++;
      if (this.checkAreaRequirement(profile.areaType, scheme.rural_urban_requirement)) {
        matchScore++;
        explanation.push(`Area type ${profile.areaType} matches: ${scheme.rural_urban_requirement}`);
        reasons.push('Area type matches');
      } else {
        explanation.push(`Area type ${profile.areaType} does not match: ${scheme.rural_urban_requirement}`);
      }
    }

    // Occupation check
    if (scheme.occupation && profile.occupation) {
      totalCriteria++;
      if (scheme.occupation.includes(profile.occupation)) {
        matchScore++;
        explanation.push(`Occupation ${profile.occupation} matches scheme requirements`);
        reasons.push('Occupation matches');
      } else {
        explanation.push(`Occupation ${profile.occupation} does not match scheme requirements`);
      }
    }

    // Income check
    if (scheme.income_limit && profile.annualIncome) {
      totalCriteria++;
      if (this.checkIncomeRequirement(profile.annualIncome, scheme.income_limit)) {
        matchScore++;
        explanation.push(`Income ${profile.annualIncome} meets requirement: ${scheme.income_limit}`);
        reasons.push('Income matches');
      } else {
        explanation.push(`Income ${profile.annualIncome} exceeds limit: ${scheme.income_limit}`);
      }
    }

    // Calculate confidence score
    const confidenceRatio = totalCriteria > 0 ? matchScore / totalCriteria : 0;
    let confidence = 'low';
    let category = 'explore_more';

    if (confidenceRatio >= 0.8) {
      confidence = 'high';
      category = 'highly_relevant';
    } else if (confidenceRatio >= 0.5) {
      confidence = 'medium';
      category = 'may_be_eligible';
    }

    // Determine if it's a match (at least some criteria match)
    const isMatch = matchScore > 0;

    return {
      isMatch,
      confidence,
      category,
      explanation,
      reason: reasons.join(', ') || 'Profile partially matches scheme criteria',
      matchScore,
      totalCriteria,
    };
  }

  /**
   * Check age requirement
   */
  checkAgeRequirement(age, requirement) {
    if (requirement === 'All' || requirement === 'all') return true;
    
    // Parse age requirement (e.g., "18+", "18-35", "60+")
    if (requirement.includes('+')) {
      const minAge = parseInt(requirement);
      return age >= minAge;
    }
    
    if (requirement.includes('-')) {
      const [min, max] = requirement.split('-').map(Number);
      return age >= min && age <= max;
    }
    
    return true; // If we can't parse, assume eligible
  }

  /**
   * Check gender requirement
   */
  checkGenderRequirement(gender, requirement) {
    if (requirement === 'All' || requirement === 'all') return true;
    return gender.toLowerCase() === requirement.toLowerCase();
  }

  /**
   * Check caste requirement
   */
  checkCasteRequirement(caste, requirement) {
    if (requirement === 'All' || requirement === 'all') return true;
    return caste.toLowerCase() === requirement.toLowerCase();
  }

  /**
   * Check area requirement
   */
  checkAreaRequirement(areaType, requirement) {
    if (requirement === 'All' || requirement === 'all') return true;
    return areaType.toLowerCase() === requirement.toLowerCase();
  }

  /**
   * Check income requirement
   */
  checkIncomeRequirement(income, requirement) {
    if (requirement === 'No income limit' || requirement === 'all') return true;
    
    // Parse income ranges
    const incomeMap = {
      'below_1_lakh': 100000,
      '1_2_5_lakh': 250000,
      '2_5_5_lakh': 500000,
      '5_8_lakh': 800000,
      'above_8_lakh': 800001,
    };
    
    const userIncome = incomeMap[income] || 0;
    
    // Parse requirement (e.g., "Below 2 lakh", "Above 5 lakh")
    if (requirement.toLowerCase().includes('below')) {
      const limit = parseInt(requirement.replace(/\D/g, '')) * 100000;
      return userIncome <= limit;
    }
    
    if (requirement.toLowerCase().includes('above')) {
      const limit = parseInt(requirement.replace(/\D/g, '')) * 100000;
      return userIncome >= limit;
    }
    
    return true; // If we can't parse, assume eligible
  }

  /**
   * Search schemes by query
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   */
  async searchSchemes(query, filters = {}) {
    if (!this.firebaseAvailable || !this.db) {
      return {
        success: false,
        error: 'Firebase not available',
        data: [],
        count: 0,
      };
    }

    try {
      let queryRef = this.db.collection('government_schemes');
      
      // Apply filters
      if (filters.state) {
        queryRef = queryRef.where('state', 'array-contains', filters.state);
      }
      if (filters.category) {
        queryRef = queryRef.where('category', '==', filters.category);
      }
      
      const snapshot = await queryRef.limit(50).get();
      const schemes = [];
      
      snapshot.forEach(doc => {
        const scheme = { id: doc.id, ...doc.data() };
        
        // Text search in scheme name and description
        const searchText = `${scheme.scheme_name} ${scheme.category} ${scheme.ministry}`.toLowerCase();
        if (searchText.includes(query.toLowerCase())) {
          schemes.push(scheme);
        }
      });
      
      return {
        success: true,
        data: schemes,
        count: schemes.length,
      };
    } catch (error) {
      console.error('Error searching schemes:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Get scheme by ID
   * @param {string} schemeId - Scheme ID
   */
  async getSchemeById(schemeId) {
    if (!this.firebaseAvailable || !this.db) {
      return {
        success: false,
        error: 'Firebase not available',
      };
    }

    try {
      const doc = await this.db.collection('government_schemes').doc(schemeId).get();
      
      if (!doc.exists) {
        return {
          success: false,
          error: 'Scheme not found',
        };
      }
      
      return {
        success: true,
        data: {
          id: doc.id,
          ...doc.data(),
        },
      };
    } catch (error) {
      console.error('Error getting scheme by ID:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new SchemeMatchingService();
