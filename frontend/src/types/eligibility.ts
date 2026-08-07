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

export type MaritalStatus = 'unmarried' | 'married' | 'widow' | 'divorced';
export type WomenStatus = 'pregnant' | 'lactating_mother' | 'single_mother' | 'shg_member' | 'none';

export type PensionStatus = 'receiving' | 'not_receiving' | 'pending';
export type DisabilityStatus = 'none' | 'partial' | 'full';
export type LivingStatus = 'alone' | 'with_family' | 'with_spouse';

export type EmploymentType = 'permanent' | 'contract' | 'temporary' | 'freelance';

export type IncomeRange = 
  | 'below_1_lakh' 
  | '1_3_lakh' 
  | '3_5_lakh' 
  | '5_8_lakh' 
  | '8_12_lakh' 
  | '12_20_lakh' 
  | 'above_20_lakh';

export type CasteCategory = 'general' | 'obc' | 'sc' | 'st' | 'other';
export type MinorityStatus = 'yes' | 'no';
export type BplAplStatus = 'bpl' | 'apl';
export type RationCardType = 'priority' | 'non_priority' | 'antyodaya' | 'none';

export interface EligibilityProfile {
  age?: number;
  ageCategory?: AgeCategory;
  gender?: Gender;
  occupation?: Occupation;
  
  // Student-specific
  educationType?: EducationType;
  institutionType?: InstitutionType;
  currentClass?: string;
  
  // Farmer-specific
  landOwnership?: boolean;
  farmSize?: string;
  irrigationStatus?: boolean;
  
  // Women-specific
  maritalStatus?: MaritalStatus;
  womenStatus?: WomenStatus;
  
  // Senior citizen-specific
  pensionStatus?: PensionStatus;
  disabilityStatus?: DisabilityStatus;
  livingStatus?: LivingStatus;
  
  // Working professional-specific
  monthlyIncome?: IncomeRange;
  employmentType?: EmploymentType;
  
  // General
  annualIncome?: IncomeRange;
  
  // Location
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
  
  // Optional filters
  casteCategory?: CasteCategory;
  minorityStatus?: MinorityStatus;
  bplAplStatus?: BplAplStatus;
  rationCardType?: RationCardType;
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
  scheme: any;
  eligibilityReason: string;
  benefits: string[];
  requiredDocuments: string[];
  applicationProcess: string;
  officialLink: string;
  lastDate?: string;
  confidenceScore: 'high' | 'medium' | 'low';
}
