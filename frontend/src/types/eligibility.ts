export type AgeCategory = 
  | 'infant' 
  | 'school_student' 
  | 'adult' 
  | 'senior_citizen';

export type Gender = 'male' | 'female' | 'other';

export type Occupation = 
  | 'student' 
  | 'farmer' 
  | 'homemaker' 
  | 'salaried_employee' 
  | 'self_employed' 
  | 'entrepreneur' 
  | 'labourer' 
  | 'unemployed' 
  | 'pensioner' 
  | 'retired' 
  | 'other';

export type EducationType = 'school' | 'college' | 'university' | 'vocational';
export type InstitutionType = 'government' | 'private';

export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced' | 'prefer_not_to_say';
export type WomenStatus = 'pregnant' | 'lactating_mother' | 'single_mother' | 'shg_member' | 'none';
export type AreaType = 'urban' | 'rural';

export type PensionStatus = 'receiving' | 'not_receiving' | 'pending';
export type LivingStatus = 'alone' | 'with_family' | 'with_spouse';

export type EmploymentType = 'permanent' | 'contract' | 'temporary' | 'freelance';

export type IncomeRange = 
  | 'below_1_lakh' 
  | '1_2_5_lakh' 
  | '2_5_5_lakh' 
  | '5_8_lakh' 
  | 'above_8_lakh' 
  | 'prefer_not_to_say';

export type CasteCategory = 'general' | 'obc' | 'sc' | 'st' | 'other' | 'prefer_not_to_say';
export type MinorityStatus = 'yes' | 'no' | 'prefer_not_to_say';
export type DisabilityStatus = 'yes' | 'no' | 'prefer_not_to_say';
export type BplAplStatus = 'bpl' | 'apl';
export type RationCardType = 'priority' | 'non_priority' | 'antyodaya' | 'none';

export interface EligibilityProfile {
  // Basic info
  name?: string;
  age?: number;
  ageCategory?: AgeCategory;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  
  // Location
  state?: string;
  district?: string;
  areaType?: AreaType;
  
  // Social/Economic
  casteCategory?: CasteCategory;
  minorityStatus?: MinorityStatus;
  disabilityStatus?: DisabilityStatus;
  
  // Education & Employment
  isStudent?: boolean;
  occupation?: Occupation;
  educationType?: EducationType;
  currentClass?: string;
  
  // Student-specific
  educationLevel?: string;
  courseStream?: string;
  institutionType?: string;
  
  // Farmer-specific
  landOwnership?: string;
  landSize?: string;
  farmingType?: string;
  
  // Employee-specific
  employmentType?: string;
  employmentSector?: string;
  
  // Entrepreneur-specific
  businessType?: string;
  businessStage?: string;
  msmeStatus?: string;
  
  // Unemployed-specific
  unemployedEducation?: string;
  skills?: string;
  employmentPreference?: string;
  
  // Women-specific
  womenStatus?: WomenStatus;
  
  // Senior citizen-specific
  pensionStatus?: PensionStatus;
  livingStatus?: LivingStatus;
  
  // Working professional-specific
  monthlyIncome?: IncomeRange;
  
  // General
  annualIncome?: IncomeRange;
  
  // Additional location
  taluka?: string;
  village?: string;
  
  // Optional filters
  bplAplStatus?: BplAplStatus;
  rationCardType?: RationCardType;
  
  // Additional context
  isFarmer?: boolean;
  isBusinessOwner?: boolean;
  isWoman?: boolean;
  isSeniorCitizen?: boolean;
  seekingScholarship?: boolean;
  seekingEmployment?: boolean;
  seekingHousing?: boolean;
  seekingHealthcare?: boolean;
  seekingFinancialAssistance?: boolean;
  seekingPension?: boolean;
  hasDependents?: boolean;
}

export interface EligibilityQuestion {
  id: string;
  step: number;
  totalSteps: number;
  question: string;
  type: 'choice' | 'input' | 'select';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  skipCondition?: (profile: EligibilityProfile) => boolean;
}

export interface SchemeMatch {
  scheme: GovernmentScheme;
  eligibilityReason: string;
  benefits: string[];
  requiredDocuments: string[];
  applicationProcess: string;
  officialLink: string;
  lastDate?: string;
  confidenceScore: 'high' | 'medium' | 'low';
  matchCategory: 'highly_relevant' | 'may_be_eligible' | 'explore_more';
  eligibilityExplanation: string[];
}

export interface GovernmentScheme {
  scheme_name: string;
  ministry: string;
  central_state: 'central' | 'state';
  state: string[];
  category: string;
  age_requirement?: string;
  gender_requirement?: string;
  marital_status?: string;
  caste_category?: string;
  disability_requirement?: string;
  student_requirement?: string;
  employment_requirement?: string;
  income_limit?: string;
  rural_urban_requirement?: string;
  occupation?: string[];
  benefits: string[];
  benefit_amount?: string;
  required_documents: string[];
  application_process: string;
  official_url: string;
  last_verified_date: string;
  source: string;
}
