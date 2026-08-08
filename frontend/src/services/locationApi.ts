/**
 * Location API Service
 * Handles API calls to fetch location data (states, districts) from database
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface State {
  id: string;
  name: string;
  code: string;
}

export interface District {
  id: string;
  name: string;
  code: string;
  stateCode: string;
}

/**
 * Get all states
 */
export async function getStates(): Promise<{ success: boolean; data: State[]; count: number; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/location/states`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching states:', error);
    return {
      success: false,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch states',
    };
  }
}

/**
 * Get districts (optionally filtered by state code)
 */
export async function getDistricts(stateCode?: string): Promise<{ success: boolean; data: District[]; count: number; error?: string }> {
  try {
    const params = stateCode ? `?stateCode=${encodeURIComponent(stateCode)}` : '';
    const response = await fetch(`${API_BASE_URL}/api/location/districts${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching districts:', error);
    return {
      success: false,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch districts',
    };
  }
}
