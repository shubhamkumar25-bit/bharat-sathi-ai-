import { EligibilityProfile, EligibilityQuestion, MaritalStatus, CasteCategory, MinorityStatus, DisabilityStatus, AreaType, Occupation, IncomeRange } from '../types/eligibility';

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir',
  'Chandigarh', 'Puducherry', 'Lakshadweep', 'Andaman & Nicobar'
];

export function getOnboardingQuestions(): EligibilityQuestion[] {
  return [
    // Phase 1: Basic Profile (Always asked)
    {
      id: 'name',
      step: 1,
      totalSteps: 7,
      question: "What's your name?",
      type: 'input',
      placeholder: 'Enter your name',
      skipCondition: (profile) => false
    },
    {
      id: 'age',
      step: 1,
      totalSteps: 7,
      question: "What's your age?",
      type: 'input',
      placeholder: 'Enter your age',
      skipCondition: (profile) => false
    },
    {
      id: 'gender',
      step: 1,
      totalSteps: 7,
      question: "What's your gender?",
      type: 'choice',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],
      skipCondition: (profile) => false
    },
    {
      id: 'maritalStatus',
      step: 1,
      totalSteps: 7,
      question: "What's your marital status?",
      type: 'choice',
      options: [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'widowed', label: 'Widowed' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],
      skipCondition: (profile) => false
    },

    // Phase 2: Location (Always asked)
    {
      id: 'state',
      step: 2,
      totalSteps: 7,
      question: "Which state do you live in?",
      type: 'select',
      options: states.map(state => ({ value: state, label: state })),
      skipCondition: (profile) => false
    },
    {
      id: 'district',
      step: 2,
      totalSteps: 7,
      question: "Which district do you live in?",
      type: 'input',
      placeholder: 'Enter your district',
      skipCondition: (profile) => !profile.state
    },
    {
      id: 'areaType',
      step: 2,
      totalSteps: 7,
      question: "What's your area of residence?",
      type: 'choice',
      options: [
        { value: 'urban', label: 'Urban' },
        { value: 'rural', label: 'Rural' }
      ],
      skipCondition: (profile) => !profile.state
    },

    // Phase 3: Social/Economic (Always asked)
    {
      id: 'casteCategory',
      step: 3,
      totalSteps: 7,
      question: "Do you belong to an eligible caste/social category?",
      type: 'choice',
      options: [
        { value: 'general', label: 'General' },
        { value: 'obc', label: 'OBC' },
        { value: 'sc', label: 'SC' },
        { value: 'st', label: 'ST' },
        { value: 'other', label: 'Other' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],
      skipCondition: (profile) => false
    },
    {
      id: 'minorityStatus',
      step: 3,
      totalSteps: 7,
      question: "Do you belong to a minority community?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],
      skipCondition: (profile) => false
    },
    {
      id: 'disabilityStatus',
      step: 3,
      totalSteps: 7,
      question: "Do you have a disability?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],
      skipCondition: (profile) => false
    },

    // Phase 4: Occupation/Branching Point (Always asked)
    {
      id: 'occupation',
      step: 4,
      totalSteps: 7,
      question: "What's your current employment status?",
      type: 'choice',
      options: [
        { value: 'student', label: 'Student' },
        { value: 'salaried_employee', label: 'Employed' },
        { value: 'self_employed', label: 'Self-employed / Entrepreneur' },
        { value: 'unemployed', label: 'Unemployed' },
        { value: 'farmer', label: 'Farmer' },
        { value: 'homemaker', label: 'Homemaker' },
        { value: 'other', label: 'Other' }
      ],
      skipCondition: (profile) => false
    },

    // Phase 5: Occupation-Specific Questions (Dynamic)
    // Student-specific questions
    {
      id: 'educationLevel',
      step: 5,
      totalSteps: 7,
      question: "What's your current education level?",
      type: 'choice',
      options: [
        { value: 'school', label: 'School (10th/12th)' },
        { value: 'undergraduate', label: 'Undergraduate' },
        { value: 'postgraduate', label: 'Postgraduate' },
        { value: 'diploma', label: 'Diploma/Certificate' },
        { value: 'professional', label: 'Professional Course' }
      ],
      skipCondition: (profile) => profile.occupation !== 'student'
    },
    {
      id: 'courseStream',
      step: 5,
      totalSteps: 7,
      question: "What's your course or stream?",
      type: 'choice',
      options: [
        { value: 'science', label: 'Science' },
        { value: 'commerce', label: 'Commerce' },
        { value: 'arts', label: 'Arts/Humanities' },
        { value: 'engineering', label: 'Engineering' },
        { value: 'medical', label: 'Medical' },
        { value: 'law', label: 'Law' },
        { value: 'management', label: 'Management' },
        { value: 'other', label: 'Other' }
      ],
      skipCondition: (profile) => profile.occupation !== 'student'
    },
    {
      id: 'institutionType',
      step: 5,
      totalSteps: 7,
      question: "What type of institution do you study in?",
      type: 'choice',
      options: [
        { value: 'government', label: 'Government' },
        { value: 'private', label: 'Private' },
        { value: 'aided', label: 'Government-aided' }
      ],
      skipCondition: (profile) => profile.occupation !== 'student'
    },

    // Farmer-specific questions
    {
      id: 'landOwnership',
      step: 5,
      totalSteps: 7,
      question: "Do you own agricultural land?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes, I own land' },
        { value: 'no', label: 'No, I work on rented/leased land' },
        { value: 'sharecropper', label: 'Sharecropper' }
      ],
      skipCondition: (profile) => profile.occupation !== 'farmer'
    },
    {
      id: 'landSize',
      step: 5,
      totalSteps: 7,
      question: "What's the size of your land holding?",
      type: 'choice',
      options: [
        { value: 'small', label: 'Small (below 2 hectares)' },
        { value: 'medium', label: 'Medium (2-10 hectares)' },
        { value: 'large', label: 'Large (above 10 hectares)' },
        { value: 'marginal', label: 'Marginal (below 1 hectare)' }
      ],
      skipCondition: (profile) => profile.occupation !== 'farmer' || profile.landOwnership === 'no'
    },
    {
      id: 'farmingType',
      step: 5,
      totalSteps: 7,
      question: "What type of farming do you do?",
      type: 'choice',
      options: [
        { value: 'crop', label: 'Crop cultivation' },
        { value: 'dairy', label: 'Dairy/Livestock' },
        { value: 'mixed', label: 'Mixed farming' },
        { value: 'horticulture', label: 'Horticulture' },
        { value: 'fishery', label: 'Fishery' }
      ],
      skipCondition: (profile) => profile.occupation !== 'farmer'
    },

    // Employee-specific questions
    {
      id: 'employmentType',
      step: 5,
      totalSteps: 7,
      question: "What's your employment type?",
      type: 'choice',
      options: [
        { value: 'permanent', label: 'Permanent' },
        { value: 'contract', label: 'Contract/Temporary' },
        { value: 'daily_wage', label: 'Daily wage' }
      ],
      skipCondition: (profile) => profile.occupation !== 'salaried_employee'
    },
    {
      id: 'employmentSector',
      step: 5,
      totalSteps: 7,
      question: "Which sector do you work in?",
      type: 'choice',
      options: [
        { value: 'government', label: 'Government' },
        { value: 'private', label: 'Private' },
        { value: 'public_sector', label: 'Public Sector Undertaking' }
      ],
      skipCondition: (profile) => profile.occupation !== 'salaried_employee'
    },

    // Entrepreneur-specific questions
    {
      id: 'businessType',
      step: 5,
      totalSteps: 7,
      question: "What type of business do you run?",
      type: 'choice',
      options: [
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'services', label: 'Services' },
        { value: 'trading', label: 'Trading/Retail' },
        { value: 'agri_business', label: 'Agri-business' },
        { value: 'technology', label: 'Technology/IT' },
        { value: 'other', label: 'Other' }
      ],
      skipCondition: (profile) => profile.occupation !== 'self_employed'
    },
    {
      id: 'businessStage',
      step: 5,
      totalSteps: 7,
      question: "What stage is your business in?",
      type: 'choice',
      options: [
        { value: 'startup', label: 'Startup (0-3 years)' },
        { value: 'established', label: 'Established (3+ years)' },
        { value: 'planning', label: 'Planning stage' }
      ],
      skipCondition: (profile) => profile.occupation !== 'self_employed'
    },
    {
      id: 'msmeStatus',
      step: 5,
      totalSteps: 7,
      question: "Is your business registered as MSME?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'planning', label: 'Planning to register' }
      ],
      skipCondition: (profile) => profile.occupation !== 'self_employed'
    },

    // Unemployed-specific questions
    {
      id: 'unemployedEducation',
      step: 5,
      totalSteps: 7,
      question: "What's your highest education qualification?",
      type: 'choice',
      options: [
        { value: 'below_10th', label: 'Below 10th' },
        { value: '10th', label: '10th pass' },
        { value: '12th', label: '12th pass' },
        { value: 'graduate', label: 'Graduate' },
        { value: 'postgraduate', label: 'Postgraduate' },
        { value: 'diploma', label: 'Diploma/ITI' }
      ],
      skipCondition: (profile) => profile.occupation !== 'unemployed'
    },
    {
      id: 'skills',
      step: 5,
      totalSteps: 7,
      question: "Do you have any specific skills or training?",
      type: 'choice',
      options: [
        { value: 'technical', label: 'Technical skills' },
        { value: 'vocational', label: 'Vocational training' },
        { value: 'none', label: 'No specific training' },
        { value: 'other', label: 'Other' }
      ],
      skipCondition: (profile) => profile.occupation !== 'unemployed'
    },
    {
      id: 'employmentPreference',
      step: 5,
      totalSteps: 7,
      question: "What type of employment are you looking for?",
      type: 'choice',
      options: [
        { value: 'government', label: 'Government job' },
        { value: 'private', label: 'Private sector' },
        { value: 'self_employment', label: 'Self-employment/Business' },
        { value: 'skilled', label: 'Skilled work' },
        { value: 'any', label: 'Any suitable opportunity' }
      ],
      skipCondition: (profile) => profile.occupation !== 'unemployed'
    },

    // Phase 6: Income (Always asked)
    {
      id: 'annualIncome',
      step: 6,
      totalSteps: 7,
      question: "What's your family's annual income?",
      type: 'choice',
      options: [
        { value: 'below_1_lakh', label: 'Below ₹1 lakh' },
        { value: '1_2_5_lakh', label: '₹1–2.5 lakh' },
        { value: '2_5_5_lakh', label: '₹2.5–5 lakh' },
        { value: '5_8_lakh', label: '₹5–8 lakh' },
        { value: 'above_8_lakh', label: 'Above ₹8 lakh' },
        { value: 'prefer_not_to_say', label: "Don't know / Prefer not to say" }
      ],
      skipCondition: (profile) => false
    },

    // Phase 7: Additional Context (Conditional)
    // Widower-specific questions
    {
      id: 'hasDependents',
      step: 7,
      totalSteps: 7,
      question: "Do you have dependents to support?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      skipCondition: (profile) => !(profile.gender === 'male' && profile.maritalStatus === 'widowed')
    },

    // Seeking preferences
    {
      id: 'seekingScholarship',
      step: 7,
      totalSteps: 7,
      question: "Are you seeking scholarship schemes?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      skipCondition: (profile) => profile.occupation !== 'student'
    },
    {
      id: 'seekingEmployment',
      step: 7,
      totalSteps: 7,
      question: "Are you looking for employment or skill development schemes?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      skipCondition: (profile) => profile.occupation === 'salaried_employee' || profile.occupation === 'self_employed'
    },
    {
      id: 'seekingHousing',
      step: 7,
      totalSteps: 7,
      question: "Are you looking for housing schemes?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      skipCondition: (profile) => false
    },
    {
      id: 'seekingHealthcare',
      step: 7,
      totalSteps: 7,
      question: "Are you looking for healthcare schemes?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      skipCondition: (profile) => false
    },
    {
      id: 'seekingFinancialAssistance',
      step: 7,
      totalSteps: 7,
      question: "Are you looking for financial assistance schemes?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      skipCondition: (profile) => false
    },
    {
      id: 'seekingPension',
      step: 7,
      totalSteps: 7,
      question: "Are you looking for pension schemes?",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      skipCondition: (profile) => !profile.age || profile.age < 50
    }
  ];
}

export function getNextOnboardingQuestion(profile: EligibilityProfile, currentIndex: number): EligibilityQuestion | null {
  const questions = getOnboardingQuestions();
  
  for (let i = currentIndex; i < questions.length; i++) {
    const question = questions[i];
    
    if (question.skipCondition && question.skipCondition(profile)) {
      continue;
    }
    
    if (!isQuestionAnswered(question, profile)) {
      return question;
    }
  }
  
  return null;
}

function isQuestionAnswered(question: EligibilityQuestion, profile: EligibilityProfile): boolean {
  switch (question.id) {
    case 'name':
      return !!profile.name;
    case 'age':
      return !!profile.age;
    case 'gender':
      return !!profile.gender;
    case 'maritalStatus':
      return !!profile.maritalStatus;
    case 'state':
      return !!profile.state;
    case 'district':
      return !!profile.district;
    case 'areaType':
      return !!profile.areaType;
    case 'casteCategory':
      return !!profile.casteCategory;
    case 'minorityStatus':
      return !!profile.minorityStatus;
    case 'disabilityStatus':
      return !!profile.disabilityStatus;
    case 'occupation':
      return !!profile.occupation;
    // Student-specific
    case 'educationLevel':
      return !!profile.educationLevel;
    case 'courseStream':
      return !!profile.courseStream;
    case 'institutionType':
      return !!profile.institutionType;
    // Farmer-specific
    case 'landOwnership':
      return !!profile.landOwnership;
    case 'landSize':
      return !!profile.landSize;
    case 'farmingType':
      return !!profile.farmingType;
    // Employee-specific
    case 'employmentType':
      return !!profile.employmentType;
    case 'employmentSector':
      return !!profile.employmentSector;
    // Entrepreneur-specific
    case 'businessType':
      return !!profile.businessType;
    case 'businessStage':
      return !!profile.businessStage;
    case 'msmeStatus':
      return !!profile.msmeStatus;
    // Unemployed-specific
    case 'unemployedEducation':
      return !!profile.unemployedEducation;
    case 'skills':
      return !!profile.skills;
    case 'employmentPreference':
      return !!profile.employmentPreference;
    // Income
    case 'annualIncome':
      return !!profile.annualIncome;
    // Additional context
    case 'hasDependents':
      return profile.hasDependents !== undefined;
    case 'seekingScholarship':
      return profile.seekingScholarship !== undefined;
    case 'seekingEmployment':
      return profile.seekingEmployment !== undefined;
    case 'seekingHousing':
      return profile.seekingHousing !== undefined;
    case 'seekingHealthcare':
      return profile.seekingHealthcare !== undefined;
    case 'seekingFinancialAssistance':
      return profile.seekingFinancialAssistance !== undefined;
    case 'seekingPension':
      return profile.seekingPension !== undefined;
    default:
      return false;
  }
}

export function getOnboardingProgress(profile: EligibilityProfile): { current: number; total: number } {
  const questions = getOnboardingQuestions();
  let answered = 0;
  let total = 0;
  
  for (const question of questions) {
    if (question.skipCondition && question.skipCondition(profile)) {
      continue;
    }
    total++;
    if (isQuestionAnswered(question, profile)) {
      answered++;
    }
  }
  
  return { current: answered, total };
}
