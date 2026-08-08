/**
 * Government Schemes API Service
 * Handles API calls to the backend for database-driven scheme matching
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Import the SchemeMatch type from the types file to ensure consistency
import type { SchemeMatch as EligibilitySchemeMatch } from '../types/eligibility';

export interface SchemeMatch extends EligibilitySchemeMatch {
  scheme: any;
}

export interface Scheme {
  id: string;
  scheme_name: string;
  ministry: string;
  central_state: string;
  state: string[];
  category: string;
  age_requirement?: string;
  gender_requirement?: string;
  caste_category?: string;
  disability_requirement?: string;
  income_limit?: string;
  rural_urban_requirement?: string;
  occupation?: string[];
  benefits: string[];
  required_documents: string[];
  application_process: string;
  official_url?: string;
  last_verified_date: string;
  source: string;
  dataset_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Match schemes based on user eligibility profile
 */
export async function matchSchemes(profile: any): Promise<{ success: boolean; matches: SchemeMatch[]; total: number; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schemes-db/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error matching schemes:', error);
    return {
      success: false,
      matches: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to match schemes',
    };
  }
}

/**
 * Search schemes by query and filters
 */
export async function searchSchemes(query: string, filters: any = {}): Promise<{ success: boolean; data: Scheme[]; count: number; error?: string }> {
  try {
    const params = new URLSearchParams({ query, ...filters });
    const response = await fetch(`${API_BASE_URL}/api/schemes-db/search?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching schemes:', error);
    return {
      success: false,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to search schemes',
    };
  }
}

/**
 * Get scheme by ID
 */
export async function getSchemeById(schemeId: string): Promise<{ success: boolean; data?: Scheme; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schemes-db/${schemeId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting scheme:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get scheme',
    };
  }
}

/**
 * Get all schemes with optional filters
 */
export async function getAllSchemes(filters: any = {}): Promise<{ success: boolean; data: Scheme[]; count: number; error?: string }> {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/schemes-db?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting schemes:', error);
    return {
      success: false,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to get schemes',
    };
  }
}
