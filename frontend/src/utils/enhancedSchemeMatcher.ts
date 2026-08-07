import { EligibilityProfile, SchemeMatch, GovernmentScheme } from '../types/eligibility';
import { governmentSchemes } from '../data/governmentSchemes';

export function matchSchemesEnhanced(profile: EligibilityProfile): SchemeMatch[] {
  const matches: SchemeMatch[] = [];

  for (const scheme of governmentSchemes) {
    const matchResult = evaluateEligibility(profile, scheme);
    
    if (matchResult.score > 0) {
      matches.push({
        scheme,
        eligibilityReason: matchResult.reason,
        benefits: scheme.benefits,
        requiredDocuments: scheme.required_documents,
        applicationProcess: scheme.application_process,
        officialLink: scheme.official_url,
        lastDate: undefined,
        confidenceScore: matchResult.confidence,
        matchCategory: matchResult.category,
        eligibilityExplanation: matchResult.explanation
      });
    }
  }

  // Sort by confidence score and match category
  matches.sort((a, b) => {
    const categoryOrder = { 'highly_relevant': 3, 'may_be_eligible': 2, 'explore_more': 1 };
    const confidenceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    
    const categoryDiff = categoryOrder[b.matchCategory] - categoryOrder[a.matchCategory];
    if (categoryDiff !== 0) return categoryDiff;
    
    return confidenceOrder[b.confidenceScore] - confidenceOrder[a.confidenceScore];
  });

  return matches;
}

function evaluateEligibility(profile: EligibilityProfile, scheme: GovernmentScheme): {
  score: number;
  confidence: 'high' | 'medium' | 'low';
  category: 'highly_relevant' | 'may_be_eligible' | 'explore_more';
  reason: string;
  explanation: string[];
} {
  let score = 0;
  const explanation: string[] = [];
  const maxScore = 10;

  // State eligibility
  if (scheme.state.includes('all') || (profile.state && scheme.state.includes(profile.state))) {
    score += 2;
    explanation.push('Your state is eligible for this scheme');
  } else if (!profile.state) {
    score += 0.5;
  }

  // Age eligibility
  if (checkAgeEligibility(profile, scheme.age_requirement || 'All')) {
    score += 2;
    if (profile.age) {
      explanation.push(`Your age (${profile.age}) meets the requirement`);
    }
  } else if (!profile.age) {
    score += 0.5;
  }

  // Gender eligibility
  if (checkGenderEligibility(profile, scheme.gender_requirement || 'All')) {
    score += 1;
    if (profile.gender) {
      explanation.push(`Gender requirement matches`);
    }
  } else if (!profile.gender) {
    score += 0.3;
  }

  // Occupation eligibility
  if (checkOccupationEligibility(profile, scheme.occupation || ['all'])) {
    score += 2;
    if (profile.occupation) {
      explanation.push(`Your occupation is eligible`);
    }
  } else if (!profile.occupation) {
    score += 0.5;
  }

  // Income eligibility
  if (checkIncomeEligibility(profile, scheme.income_limit || 'No income limit')) {
    score += 1.5;
    explanation.push(`Your income falls within the scheme limit`);
  } else if (!profile.annualIncome) {
    score += 0.3;
  }

  // Caste category eligibility
  if (checkCasteEligibility(profile, scheme.caste_category || 'All')) {
    score += 1;
    explanation.push(`Your caste/social category is eligible`);
  } else if (!profile.casteCategory) {
    score += 0.3;
  }

  // Rural/Urban eligibility
  if (checkAreaEligibility(profile, scheme.rural_urban_requirement || 'Both')) {
    score += 0.5;
    explanation.push(`Your area type is eligible`);
  } else if (!profile.areaType) {
    score += 0.2;
  }

  // Student eligibility
  if (checkStudentEligibility(profile, scheme.student_requirement || 'All')) {
    score += 1;
    explanation.push(`Student requirement matches`);
  } else if (profile.isStudent === undefined) {
    score += 0.3;
  }

  // Disability eligibility
  if (checkDisabilityEligibility(profile, scheme.disability_requirement || 'All')) {
    score += 0.5;
    explanation.push(`Disability requirement matches`);
  } else if (profile.disabilityStatus === undefined) {
    score += 0.2;
  }

  // Additional context matching
  if (profile.seekingScholarship && scheme.category === 'Education') {
    score += 1;
    explanation.push('You are seeking scholarship schemes');
  }

  if (profile.seekingEmployment && scheme.category === 'Employment') {
    score += 1;
    explanation.push('You are seeking employment schemes');
  }

  if (profile.seekingHousing && scheme.category === 'Housing') {
    score += 1;
    explanation.push('You are seeking housing schemes');
  }

  if (profile.seekingHealthcare && scheme.category === 'Health') {
    score += 1;
    explanation.push('You are seeking healthcare schemes');
  }

  if (profile.isFarmer && scheme.category === 'Agriculture') {
    score += 1;
    explanation.push('You are a farmer seeking agriculture schemes');
  }

  if (profile.isWoman && scheme.category === 'Women & Child') {
    score += 1;
    explanation.push('You are seeking women-specific schemes');
  }

  if (profile.isSeniorCitizen && scheme.category === 'Social Security') {
    score += 1;
    explanation.push('You are seeking senior citizen schemes');
  }

  // Determine confidence and category
  let confidence: 'high' | 'medium' | 'low';
  let category: 'highly_relevant' | 'may_be_eligible' | 'explore_more';

  if (score >= maxScore * 0.8) {
    confidence = 'high';
    category = 'highly_relevant';
  } else if (score >= maxScore * 0.5) {
    confidence = 'medium';
    category = 'may_be_eligible';
  } else {
    confidence = 'low';
    category = 'explore_more';
  }

  // Generate reason
  const reason = generateEligibilityReason(score, maxScore, category);

  return { score, confidence, category, reason, explanation };
}

function checkAgeEligibility(profile: EligibilityProfile, requirement: string): boolean {
  if (!profile.age || requirement === 'All' || requirement === 'No age limit') {
    return true;
  }

  const age = profile.age;

  if (requirement.includes('18+')) {
    return age >= 18;
  }
  if (requirement.includes('14-35')) {
    return age >= 14 && age <= 35;
  }
  if (requirement.includes('18-40')) {
    return age >= 18 && age <= 40;
  }
  if (requirement.includes('14+')) {
    return age >= 14;
  }
  if (requirement.includes('Adult')) {
    return age >= 18;
  }
  if (requirement.includes('Pregnant')) {
    return age >= 18 && age <= 50;
  }
  if (requirement.includes('Girl children')) {
    return age <= 18;
  }

  return true;
}

function checkGenderEligibility(profile: EligibilityProfile, requirement: string): boolean {
  if (!profile.gender || requirement === 'All') {
    return true;
  }

  if (requirement === 'Female' && profile.gender === 'female') {
    return true;
  }
  if (requirement === 'Male' && profile.gender === 'male') {
    return true;
  }
  if (requirement.includes('SC/ST/Women')) {
    return profile.gender === 'female' || profile.casteCategory === 'sc' || profile.casteCategory === 'st';
  }

  return false;
}

function checkOccupationEligibility(profile: EligibilityProfile, occupations: string[]): boolean {
  if (!profile.occupation || occupations.includes('all')) {
    return true;
  }

  return occupations.includes(profile.occupation) || 
         (profile.occupation === 'salaried_employee' && occupations.includes('employed')) ||
         (profile.occupation === 'self_employed' && occupations.includes('self_employed'));
}

function checkIncomeEligibility(profile: EligibilityProfile, limit: string): boolean {
  if (!profile.annualIncome || limit === 'No income limit' || limit === 'Varies by scholarship') {
    return true;
  }

  const income = profile.annualIncome;

  if (limit.includes('Below ₹1 lakh') && income === 'below_1_lakh') {
    return true;
  }
  if (limit.includes('₹1-2.5 lakh') && (income === 'below_1_lakh' || income === '1_2_5_lakh')) {
    return true;
  }
  if (limit.includes('₹2.5-5 lakh') && (income === '1_2_5_lakh' || income === '2_5_5_lakh')) {
    return true;
  }
  if (limit.includes('₹5-8 lakh') && (income === '2_5_5_lakh' || income === '5_8_lakh')) {
    return true;
  }
  if (limit.includes('₹6-18 lakh') && (income === '5_8_lakh' || income === 'above_8_lakh')) {
    return true;
  }
  if (limit.includes('Up to ₹15,000 monthly')) {
    return income === 'below_1_lakh' || income === '1_2_5_lakh';
  }
  if (limit.includes('BPL') || limit.includes('Below poverty line')) {
    return income === 'below_1_lakh';
  }

  return false;
}

function checkCasteEligibility(profile: EligibilityProfile, requirement: string): boolean {
  if (!profile.casteCategory || requirement === 'All') {
    return true;
  }

  if (requirement === 'EWS/LIG/MIG') {
    return profile.casteCategory === 'general' || profile.casteCategory === 'obc';
  }
  if (requirement === 'SC/ST/OBC/General') {
    return true;
  }
  if (requirement === 'BPL families') {
    return profile.annualIncome === 'below_1_lakh';
  }
  if (requirement === 'Rural households' || requirement === 'Rural poor') {
    return profile.areaType === 'rural';
  }
  if (requirement === 'Poor and vulnerable families') {
    return profile.annualIncome === 'below_1_lakh' || profile.annualIncome === '1_2_5_lakh';
  }

  return false;
}

function checkAreaEligibility(profile: EligibilityProfile, requirement: string): boolean {
  if (!profile.areaType || requirement === 'Both') {
    return true;
  }

  if (requirement === 'Urban' && profile.areaType === 'urban') {
    return true;
  }
  if (requirement === 'Rural' && profile.areaType === 'rural') {
    return true;
  }

  return false;
}

function checkStudentEligibility(profile: EligibilityProfile, requirement: string): boolean {
  if (requirement === 'All') {
    return true;
  }
  if (requirement === 'Yes' && profile.isStudent) {
    return true;
  }
  if (requirement === 'No' && !profile.isStudent) {
    return true;
  }
  if (requirement === 'Students of all ages' && profile.isStudent) {
    return true;
  }

  return !profile.isStudent;
}

function checkDisabilityEligibility(profile: EligibilityProfile, requirement: string): boolean {
  if (requirement === 'All') {
    return true;
  }
  if (requirement === 'All' || !profile.disabilityStatus) {
    return true;
  }

  return true;
}

function generateEligibilityReason(score: number, maxScore: number, category: string): string {
  const percentage = (score / maxScore) * 100;

  if (category === 'highly_relevant') {
    return `Strong match (${percentage.toFixed(0)}%) - Your profile closely matches the eligibility criteria`;
  } else if (category === 'may_be_eligible') {
    return `Potential match (${percentage.toFixed(0)}%) - You may be eligible with additional verification`;
  } else {
    return `Explore this scheme (${percentage.toFixed(0)}%) - Check official criteria for confirmation`;
  }
}
