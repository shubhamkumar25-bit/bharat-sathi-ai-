import { EligibilityProfile, SchemeMatch } from '../types/eligibility';

// Enhanced scheme catalog with detailed eligibility criteria
const enhancedSchemeCatalog = [
  {
    id: 'pm-kisan-samman-nidhi',
    title: 'PM-Kisan Samman Nidhi',
    category: 'Agriculture',
    summary: 'Direct income support of ₹6,000 per year to farmers',
    eligibility: 'Small and marginal farmers with cultivable land up to 2 hectares',
    benefits: ['₹6,000 per year in three installments', 'Direct bank transfer', 'No application fee'],
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Mobile Number'],
    applicationProcess: 'Register online at pmkisan.gov.in or through CSC centers',
    officialLink: 'https://pmkisan.gov.in',
    lastDate: 'Ongoing',
    criteria: {
      occupation: ['farmer'],
      landOwnership: true,
      farmSize: ['small', 'medium'],
      states: ['all']
    }
  },
  {
    id: 'pm-kisan-credit-card',
    title: 'Kisan Credit Card (KCC)',
    category: 'Agriculture',
    summary: 'Credit facility for farmers to purchase inputs and meet cultivation needs',
    eligibility: 'Farmers, tenant farmers, sharecroppers, and agricultural laborers',
    benefits: ['Low interest rate (4% after subsidy)', 'Credit limit up to ₹3 lakh', 'Crop insurance coverage'],
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Passport Photo'],
    applicationProcess: 'Apply through nearest bank branch or agricultural department',
    officialLink: 'https://www.kisancreditcard.in',
    lastDate: 'Ongoing',
    criteria: {
      occupation: ['farmer'],
      states: ['all']
    }
  },
  {
    id: 'national-scholarship-portal',
    title: 'National Scholarship Portal',
    category: 'Education',
    summary: 'Central and state government scholarships for students from class 1 to PhD',
    eligibility: 'Students based on merit, income, and category criteria',
    benefits: ['Financial assistance for education', 'Merit scholarships', 'Post-matric scholarships'],
    documents: ['Aadhaar Card', 'Income Certificate', 'Marksheet', 'Bank Account', 'Caste Certificate (if applicable)'],
    applicationProcess: 'Apply online at scholarships.gov.in',
    officialLink: 'https://scholarships.gov.in',
    lastDate: 'Varies by scheme',
    criteria: {
      occupation: ['student'],
      ageCategory: ['school_student', 'adult'],
      states: ['all']
    }
  },
  {
    id: 'beti-bachao-beti-padhao',
    title: 'Beti Bachao Beti Padhao',
    category: 'Social Welfare',
    summary: 'Scheme for survival, protection, and education of girl child',
    eligibility: 'Families with girl children, especially in rural areas',
    benefits: ['Financial assistance for girl education', 'Sukanya Samriddhi Account', 'Awareness programs'],
    documents: ['Birth Certificate', 'Aadhaar Card', 'Parents ID Proof'],
    applicationProcess: 'Apply through district education officer or bank for Sukanya Samriddhi Account',
    officialLink: 'https://www.bbbp.gov.in',
    lastDate: 'Ongoing',
    criteria: {
      gender: ['female'],
      states: ['all']
    }
  },
  {
    id: 'sukanya-samriddhi-yojana',
    title: 'Sukanya Samriddhi Yojana',
    category: 'Social Welfare',
    summary: 'Savings scheme for girl child with high interest rate and tax benefits',
    eligibility: 'Parents of girl child below 10 years',
    benefits: ['8.2% interest rate (current)', 'Tax exemption under Section 80C', 'Maturity after 21 years'],
    documents: ['Girl Child Birth Certificate', 'Parents Aadhaar', 'Photographs'],
    applicationProcess: 'Open account at any post office or authorized bank',
    officialLink: 'https://www.ssy.gov.in',
    lastDate: 'Ongoing',
    criteria: {
      gender: ['female'],
      ageCategory: ['infant', 'school_student'],
      states: ['all']
    }
  },
  {
    id: 'pm-mudra-yojana',
    title: 'Pradhan Mantri Mudra Yojana',
    category: 'Employment',
    summary: 'Loans up to ₹10 lakh for micro enterprises and small businesses',
    eligibility: 'Indian citizens for business activities in manufacturing, trading, or services',
    benefits: ['Loans up to ₹10 lakh', 'No collateral required', 'Low interest rates'],
    documents: ['Aadhaar Card', 'PAN Card', 'Business Plan', 'Bank Account'],
    applicationProcess: 'Apply through any public sector bank, RRB, or MFIs',
    officialLink: 'https://www.mudra.org.in',
    lastDate: 'Ongoing',
    criteria: {
      occupation: ['entrepreneur', 'self_employed', 'labourer'],
      states: ['all']
    }
  },
  {
    id: 'stand-up-india',
    title: 'Stand-Up India Scheme',
    category: 'Employment',
    summary: 'Loans for SC/ST and women entrepreneurs for greenfield enterprises',
    eligibility: 'SC/ST or women entrepreneurs above 18 years for new business',
    benefits: ['Loans from ₹10 lakh to ₹1 crore', 'Composite loan for manufacturing and services', 'Margin money subsidy'],
    documents: ['Aadhaar Card', 'Caste Certificate (for SC/ST)', 'Business Plan', 'Project Report'],
    applicationProcess: 'Apply through scheduled commercial banks',
    officialLink: 'https://www.standupmitra.org',
    lastDate: 'Ongoing',
    criteria: {
      occupation: ['entrepreneur', 'self_employed'],
      ageCategory: ['young_adult', 'adult'],
      casteCategory: ['sc', 'st'],
      states: ['all']
    }
  },
  {
    id: 'pm-awas-yojana',
    title: 'Pradhan Mantri Awas Yojana (PMAY)',
    category: 'Housing',
    summary: 'Housing for All - subsidy on home loans for affordable housing',
    eligibility: 'EWS/LIG/MIG families without pucca house',
    benefits: ['Interest subsidy up to ₹2.67 lakh', 'Affordable housing', 'Credit-linked subsidy'],
    documents: ['Aadhaar Card', 'Income Certificate', 'Property Documents', 'Bank Account'],
    applicationProcess: 'Apply through PMAY portal or designated banks',
    officialLink: 'https://pmay.gov.in',
    lastDate: 'Ongoing',
    criteria: {
      annualIncome: ['below_1_lakh', '1_3_lakh', '3_5_lakh', '5_8_lakh'],
      bplAplStatus: ['bpl'],
      states: ['all']
    }
  },
  {
    id: 'ayushman-bharat',
    title: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
    category: 'Health',
    summary: 'Health insurance coverage of ₹5 lakh per family per year',
    eligibility: 'Poor and vulnerable families (based on SECC data)',
    benefits: ['₹5 lakh health coverage', 'Cashless treatment', '1,500+ empaneled hospitals'],
    documents: ['Aadhaar Card', 'Ration Card', 'BPL Certificate'],
    applicationProcess: 'Check eligibility on official portal and visit empaneled hospital',
    officialLink: 'https://www.pmjay.gov.in',
    lastDate: 'Ongoing',
    criteria: {
      bplAplStatus: ['bpl'],
      rationCardType: ['priority', 'antyodaya'],
      states: ['all']
    }
  },
  {
    id: 'national-pension-system',
    title: 'National Pension System (NPS)',
    category: 'Social Welfare',
    summary: 'Voluntary pension scheme for retirement planning',
    eligibility: 'Citizens aged 18-65 years',
    benefits: ['Market-linked returns', 'Tax benefits', 'Regular pension after retirement'],
    documents: ['Aadhaar Card', 'PAN Card', 'Bank Account', 'Photographs'],
    applicationProcess: 'Register through Point of Presence (banks) or online',
    officialLink: 'https://www.npstrust.in',
    lastDate: 'Ongoing',
    criteria: {
      ageCategory: ['adult'],
      occupation: ['salaried_employee', 'self_employed', 'entrepreneur'],
      states: ['all']
    }
  },
  {
    id: 'atal-pension-yojana',
    title: 'Atal Pension Yojana',
    category: 'Social Welfare',
    summary: 'Guaranteed pension for unorganized sector workers',
    eligibility: 'Unorganized sector workers aged 18-40 years',
    benefits: ['Guaranteed pension from ₹1,000 to ₹5,000', 'Government co-contribution', 'Spouse pension'],
    documents: ['Aadhaar Card', 'Bank Account', 'Mobile Number'],
    applicationProcess: 'Open APY account at any bank branch',
    officialLink: 'https://www.npstrust.in/apy',
    lastDate: 'Ongoing',
    criteria: {
      ageCategory: ['adult'],
      occupation: ['labourer', 'unemployed', 'self_employed'],
      states: ['all']
    }
  },
  {
    id: 'pradhan-mantri-matri-vandana-yojana',
    title: 'Pradhan Mantri Matru Vandana Yojana',
    category: 'Health',
    summary: 'Maternity benefit program for pregnant and lactating women',
    eligibility: 'Pregnant women and lactating mothers for first live birth',
    benefits: ['₹5,000 in three installments', 'Maternal health support', 'Childcare guidance'],
    documents: ['Aadhaar Card', 'ANC Card', 'Bank Account', 'MC/BC Certificate'],
    applicationProcess: 'Register at Anganwadi center or health facility',
    officialLink: 'https://www.wcd.gov.in',
    lastDate: 'Ongoing',
    criteria: {
      gender: ['female'],
      womenStatus: ['pregnant', 'lactating_mother'],
      states: ['all']
    }
  },
  {
    id: 'indira-gandhi-national-old-age-pension',
    title: 'Indira Gandhi National Old Age Pension Scheme',
    category: 'Social Welfare',
    summary: 'Pension for senior citizens below poverty line',
    eligibility: 'Senior citizens (60+) below poverty line',
    benefits: ['Monthly pension of ₹500-₹1,000', 'Direct bank transfer', 'State top-up available'],
    documents: ['Aadhaar Card', 'Age Proof', 'BPL Certificate', 'Bank Account'],
    applicationProcess: 'Apply through district social welfare officer',
    officialLink: 'https://socialjustice.nic.in',
    lastDate: 'Ongoing',
    criteria: {
      ageCategory: ['senior_citizen'],
      bplAplStatus: ['bpl'],
      states: ['all']
    }
  },
  {
    id: 'skill-india',
    title: 'Skill India Mission',
    category: 'Employment',
    summary: 'Skill development programs for youth and job seekers',
    eligibility: 'Youth and job seekers looking for skill training',
    benefits: ['Free skill training', 'Certification', 'Placement assistance'],
    documents: ['Aadhaar Card', 'Education Certificate', 'Photographs'],
    applicationProcess: 'Register on Skill India portal or visit training centers',
    officialLink: 'https://www.skillindia.gov.in',
    lastDate: 'Ongoing',
    criteria: {
      ageCategory: ['school_student', 'adult'],
      occupation: ['student', 'unemployed', 'labourer'],
      states: ['all']
    }
  },
  {
    id: 'national-livelihood-mission',
    title: 'National Rural Livelihood Mission',
    category: 'Social Welfare',
    summary: 'Self-employment and livelihood programs for rural poor',
    eligibility: 'Rural poor households, especially women through SHGs',
    benefits: ['SHG formation support', 'Micro-finance', 'Skill training'],
    documents: ['Aadhaar Card', 'BPL Certificate', 'Bank Account'],
    applicationProcess: 'Contact local NRLM implementing agency or SHG',
    officialLink: 'https://nrlm.gov.in',
    lastDate: 'Ongoing',
    criteria: {
      gender: ['female'],
      womenStatus: ['shg_member'],
      bplAplStatus: ['bpl'],
      states: ['all']
    }
  },
  {
    id: 'pm-ujjwala-yojana',
    title: 'Pradhan Mantri Ujjwala Yojana',
    category: 'Social Welfare',
    summary: 'Free LPG connections to BPL households',
    eligibility: 'BPL households without LPG connection',
    benefits: ['Free LPG connection', 'Stove and regulator', 'Refill subsidy'],
    documents: ['Aadhaar Card', 'BPL Certificate', 'Bank Account', 'Photograph'],
    applicationProcess: 'Apply through LPG distributor or online',
    officialLink: 'https://www.pmujjwalayojana.com',
    lastDate: 'Ongoing',
    criteria: {
      bplAplStatus: ['bpl'],
      rationCardType: ['priority', 'antyodaya'],
      states: ['all']
    }
  }
];

export function matchSchemes(profile: EligibilityProfile): SchemeMatch[] {
  const matches: SchemeMatch[] = [];

  for (const scheme of enhancedSchemeCatalog) {
    const matchResult = evaluateEligibility(profile, scheme);
    if (matchResult.isEligible) {
      matches.push({
        scheme: scheme as any,
        eligibilityReason: matchResult.reason,
        benefits: scheme.benefits,
        requiredDocuments: scheme.documents,
        applicationProcess: scheme.applicationProcess,
        officialLink: scheme.officialLink,
        lastDate: scheme.lastDate,
        confidenceScore: matchResult.confidence,
        matchCategory: 'may_be_eligible',
        eligibilityExplanation: [matchResult.reason]
      });
    }
  }

  // Sort by confidence score
  return matches.sort((a, b) => {
    const confidenceOrder = { high: 3, medium: 2, low: 1 };
    return confidenceOrder[b.confidenceScore] - confidenceOrder[a.confidenceScore];
  });
}

function evaluateEligibility(profile: EligibilityProfile, scheme: any): {
  isEligible: boolean;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
} {
  const criteria = scheme.criteria;
  let matchedCriteria = 0;
  let totalCriteria = 0;
  const reasons: string[] = [];

  // Check occupation
  if (criteria.occupation) {
    totalCriteria++;
    if (profile.occupation && criteria.occupation.includes(profile.occupation)) {
      matchedCriteria++;
      reasons.push(`You are a ${profile.occupation.replace('_', ' ')}`);
    }
  }

  // Check age category
  if (criteria.ageCategory) {
    totalCriteria++;
    if (profile.ageCategory && criteria.ageCategory.includes(profile.ageCategory)) {
      matchedCriteria++;
      reasons.push(`Your age category matches (${profile.ageCategory.replace('_', ' ')})`);
    }
  }

  // Check gender
  if (criteria.gender) {
    totalCriteria++;
    if (profile.gender && criteria.gender.includes(profile.gender)) {
      matchedCriteria++;
      reasons.push(`Gender requirement met`);
    }
  }

  // Check land ownership
  if (criteria.landOwnership !== undefined) {
    totalCriteria++;
    if (profile.landOwnership === criteria.landOwnership) {
      matchedCriteria++;
      reasons.push(`Land ownership requirement met`);
    }
  }

  // Check farm size
  if (criteria.farmSize) {
    totalCriteria++;
    if (profile.farmSize && criteria.farmSize.includes(profile.farmSize)) {
      matchedCriteria++;
      reasons.push(`Farm size matches (${profile.farmSize})`);
    }
  }

  // Check caste category
  if (criteria.casteCategory) {
    totalCriteria++;
    if (profile.casteCategory && criteria.casteCategory.includes(profile.casteCategory)) {
      matchedCriteria++;
      reasons.push(`Caste category eligible`);
    }
  }

  // Check BPL/APL status
  if (criteria.bplAplStatus) {
    totalCriteria++;
    if (profile.bplAplStatus && criteria.bplAplStatus.includes(profile.bplAplStatus)) {
      matchedCriteria++;
      reasons.push(`BPL/APL status matches`);
    }
  }

  // Check ration card type
  if (criteria.rationCardType) {
    totalCriteria++;
    if (profile.rationCardType && criteria.rationCardType.includes(profile.rationCardType)) {
      matchedCriteria++;
      reasons.push(`Ration card type eligible`);
    }
  }

  // Check women status
  if (criteria.womenStatus) {
    totalCriteria++;
    if (profile.womenStatus && criteria.womenStatus.includes(profile.womenStatus)) {
      matchedCriteria++;
      reasons.push(`Women-specific criteria met`);
    }
  }

  // Check annual income
  if (criteria.annualIncome) {
    totalCriteria++;
    if (profile.annualIncome && criteria.annualIncome.includes(profile.annualIncome)) {
      matchedCriteria++;
      reasons.push(`Income range eligible`);
    }
  }

  // Check state
  if (criteria.states && !criteria.states.includes('all')) {
    totalCriteria++;
    if (profile.state && criteria.states.includes(profile.state)) {
      matchedCriteria++;
      reasons.push(`State-specific scheme available`);
    }
  }

  // Calculate confidence
  const matchPercentage = totalCriteria > 0 ? matchedCriteria / totalCriteria : 0;
  let confidence: 'high' | 'medium' | 'low';

  if (matchPercentage >= 0.8) {
    confidence = 'high';
  } else if (matchPercentage >= 0.5) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Determine eligibility
  const isEligible = matchedCriteria > 0 && matchPercentage >= 0.3;

  return {
    isEligible,
    reason: reasons.join(', ') || 'Based on your profile',
    confidence
  };
}
