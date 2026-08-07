import { EligibilityProfile, EligibilityQuestion, AgeCategory, Occupation } from '../types/eligibility';

export function getAgeCategory(age: number): AgeCategory {
  if (age >= 0 && age <= 2) return 'infant';
  if (age >= 3 && age <= 18) return 'school_student';
  if (age >= 19 && age <= 60) return 'adult';
  return 'senior_citizen';
}

export function getNextQuestion(profile: EligibilityProfile): EligibilityQuestion | null {
  const questions = getAllQuestions();
  
  for (const question of questions) {
    if (question.skipCondition && question.skipCondition(profile)) {
      continue;
    }
    
    // Check if this question has already been answered
    if (!isQuestionAnswered(question, profile)) {
      return question;
    }
  }
  
  return null; // All questions answered
}

function isQuestionAnswered(question: EligibilityQuestion, profile: EligibilityProfile): boolean {
  switch (question.id) {
    case 'age':
      return profile.age !== undefined;
    case 'gender':
      return profile.gender !== undefined;
    case 'occupation':
      return profile.occupation !== undefined;
    case 'education_type':
      return profile.educationType !== undefined;
    case 'institution_type':
      return profile.institutionType !== undefined;
    case 'current_class':
      return profile.currentClass !== undefined;
    case 'land_ownership':
      return profile.landOwnership !== undefined;
    case 'farm_size':
      return profile.farmSize !== undefined;
    case 'irrigation_status':
      return profile.irrigationStatus !== undefined;
    case 'marital_status':
      return profile.maritalStatus !== undefined;
    case 'women_status':
      return profile.womenStatus !== undefined;
    case 'pension_status':
      return profile.pensionStatus !== undefined;
    case 'disability_status':
      return profile.disabilityStatus !== undefined;
    case 'living_status':
      return profile.livingStatus !== undefined;
    case 'employment_type':
      return profile.employmentType !== undefined;
    case 'monthly_income':
      return profile.monthlyIncome !== undefined;
    case 'annual_income':
      return profile.annualIncome !== undefined;
    case 'state':
      return profile.state !== undefined;
    case 'district':
      return profile.district !== undefined;
    case 'taluka':
      return profile.taluka !== undefined;
    case 'village':
      return profile.village !== undefined;
    case 'caste_category':
      return profile.casteCategory !== undefined;
    case 'minority_status':
      return profile.minorityStatus !== undefined;
    case 'bpl_apl_status':
      return profile.bplAplStatus !== undefined;
    case 'ration_card_type':
      return profile.rationCardType !== undefined;
    default:
      return false;
  }
}

function getAllQuestions(): EligibilityQuestion[] {
  return [
    {
      id: 'age',
      step: 1,
      totalSteps: 8,
      question: "What's your age?",
      type: 'input',
      placeholder: 'Enter your age (e.g., 25)',
    },
    {
      id: 'gender',
      step: 2,
      totalSteps: 8,
      question: "What's your gender?",
      type: 'choice',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'occupation',
      step: 3,
      totalSteps: 8,
      question: "What's your current occupation?",
      type: 'choice',
      options: [
        { value: 'student', label: 'Student' },
        { value: 'farmer', label: 'Farmer' },
        { value: 'homemaker', label: 'Homemaker' },
        { value: 'salaried_employee', label: 'Salaried Employee' },
        { value: 'self_employed', label: 'Self-employed' },
        { value: 'entrepreneur', label: 'Entrepreneur' },
        { value: 'labourer', label: 'Labourer' },
        { value: 'unemployed', label: 'Unemployed' },
        { value: 'pensioner', label: 'Pensioner' },
        { value: 'retired', label: 'Retired' },
        { value: 'other', label: 'Other' },
      ],
    },
    // Student-specific questions
    {
      id: 'education_type',
      step: 4,
      totalSteps: 8,
      question: "What type of education are you pursuing?",
      type: 'choice',
      options: [
        { value: 'school', label: 'School' },
        { value: 'college', label: 'College' },
        { value: 'university', label: 'University' },
        { value: 'vocational', label: 'Vocational Training' },
      ],
      skipCondition: (profile) => profile.occupation !== 'student',
    },
    {
      id: 'institution_type',
      step: 4,
      totalSteps: 8,
      question: "Is your institution government or private?",
      type: 'choice',
      options: [
        { value: 'government', label: 'Government' },
        { value: 'private', label: 'Private' },
      ],
      skipCondition: (profile) => profile.occupation !== 'student',
    },
    {
      id: 'current_class',
      step: 4,
      totalSteps: 8,
      question: "What's your current class or year?",
      type: 'input',
      placeholder: 'e.g., 10th, 2nd Year B.Tech',
      skipCondition: (profile) => profile.occupation !== 'student',
    },
    // Farmer-specific questions
    {
      id: 'land_ownership',
      step: 4,
      totalSteps: 8,
      question: "Do you own agricultural land?",
      type: 'choice',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      skipCondition: (profile) => profile.occupation !== 'farmer',
    },
    {
      id: 'farm_size',
      step: 4,
      totalSteps: 8,
      question: "What's your farm size?",
      type: 'choice',
      options: [
        { value: 'small', label: 'Small (< 2 hectares)' },
        { value: 'medium', label: 'Medium (2-10 hectares)' },
        { value: 'large', label: 'Large (> 10 hectares)' },
      ],
      skipCondition: (profile) => profile.occupation !== 'farmer' || profile.landOwnership === false,
    },
    {
      id: 'irrigation_status',
      step: 4,
      totalSteps: 8,
      question: "Do you have irrigation facilities?",
      type: 'choice',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      skipCondition: (profile) => profile.occupation !== 'farmer',
    },
    // Women-specific questions
    {
      id: 'marital_status',
      step: 4,
      totalSteps: 8,
      question: "What's your marital status?",
      type: 'choice',
      options: [
        { value: 'unmarried', label: 'Unmarried' },
        { value: 'married', label: 'Married' },
        { value: 'widow', label: 'Widow' },
        { value: 'divorced', label: 'Divorced' },
      ],
      skipCondition: (profile) => profile.gender !== 'female',
    },
    {
      id: 'women_status',
      step: 4,
      totalSteps: 8,
      question: "Do any of these apply to you?",
      type: 'choice',
      options: [
        { value: 'pregnant', label: 'Pregnant' },
        { value: 'lactating_mother', label: 'Lactating Mother' },
        { value: 'single_mother', label: 'Single Mother' },
        { value: 'shg_member', label: 'SHG Member' },
        { value: 'none', label: 'None of the above' },
      ],
      skipCondition: (profile) => profile.gender !== 'female',
    },
    // Senior citizen-specific questions
    {
      id: 'pension_status',
      step: 4,
      totalSteps: 8,
      question: "What's your pension status?",
      type: 'choice',
      options: [
        { value: 'receiving', label: 'Receiving Pension' },
        { value: 'not_receiving', label: 'Not Receiving' },
        { value: 'pending', label: 'Application Pending' },
      ],
      skipCondition: (profile) => profile.ageCategory !== 'senior_citizen',
    },
    {
      id: 'disability_status',
      step: 4,
      totalSteps: 8,
      question: "Do you have any disability?",
      type: 'choice',
      options: [
        { value: 'none', label: 'No Disability' },
        { value: 'partial', label: 'Partial Disability' },
        { value: 'full', label: 'Full Disability' },
      ],
      skipCondition: (profile) => profile.ageCategory !== 'senior_citizen',
    },
    {
      id: 'living_status',
      step: 4,
      totalSteps: 8,
      question: "What's your current living arrangement?",
      type: 'choice',
      options: [
        { value: 'alone', label: 'Living Alone' },
        { value: 'with_family', label: 'With Family' },
        { value: 'with_spouse', label: 'With Spouse Only' },
      ],
      skipCondition: (profile) => profile.ageCategory !== 'senior_citizen',
    },
    // Working professional-specific questions
    {
      id: 'employment_type',
      step: 4,
      totalSteps: 8,
      question: "What's your employment type?",
      type: 'choice',
      options: [
        { value: 'permanent', label: 'Permanent' },
        { value: 'contract', label: 'Contract' },
        { value: 'temporary', label: 'Temporary' },
        { value: 'freelance', label: 'Freelance' },
      ],
      skipCondition: (profile) => !['salaried_employee', 'self_employed', 'entrepreneur'].includes(profile.occupation || ''),
    },
    {
      id: 'monthly_income',
      step: 5,
      totalSteps: 8,
      question: "What's your monthly income range?",
      type: 'choice',
      options: [
        { value: 'below_1_lakh', label: 'Below ₹1 Lakh/year' },
        { value: '1_3_lakh', label: '₹1-3 Lakh/year' },
        { value: '3_5_lakh', label: '₹3-5 Lakh/year' },
        { value: '5_8_lakh', label: '₹5-8 Lakh/year' },
        { value: '8_12_lakh', label: '₹8-12 Lakh/year' },
        { value: '12_20_lakh', label: '₹12-20 Lakh/year' },
        { value: 'above_20_lakh', label: 'Above ₹20 Lakh/year' },
      ],
      skipCondition: (profile) => !['salaried_employee', 'self_employed', 'entrepreneur'].includes(profile.occupation || ''),
    },
    // Annual income for others
    {
      id: 'annual_income',
      step: 5,
      totalSteps: 8,
      question: "What's your annual household income range?",
      type: 'choice',
      options: [
        { value: 'below_1_lakh', label: 'Below ₹1 Lakh' },
        { value: '1_3_lakh', label: '₹1-3 Lakh' },
        { value: '3_5_lakh', label: '₹3-5 Lakh' },
        { value: '5_8_lakh', label: '₹5-8 Lakh' },
        { value: '8_12_lakh', label: '₹8-12 Lakh' },
        { value: '12_20_lakh', label: '₹12-20 Lakh' },
        { value: 'above_20_lakh', label: 'Above ₹20 Lakh' },
      ],
      skipCondition: (profile) => ['salaried_employee', 'self_employed', 'entrepreneur'].includes(profile.occupation || ''),
    },
    // Location questions
    {
      id: 'state',
      step: 6,
      totalSteps: 8,
      question: "Which state do you live in?",
      type: 'select',
      options: getStateOptions(),
    },
    {
      id: 'district',
      step: 6,
      totalSteps: 8,
      question: "What's your district?",
      type: 'input',
      placeholder: 'Enter your district name',
    },
    {
      id: 'taluka',
      step: 6,
      totalSteps: 8,
      question: "What's your taluka/block?",
      type: 'input',
      placeholder: 'Enter your taluka or block name',
    },
    {
      id: 'village',
      step: 6,
      totalSteps: 8,
      question: "What's your village or city?",
      type: 'input',
      placeholder: 'Enter your village or city name',
    },
    // Optional filters
    {
      id: 'caste_category',
      step: 7,
      totalSteps: 8,
      question: "What's your caste category? (Optional)",
      type: 'choice',
      options: [
        { value: 'general', label: 'General' },
        { value: 'obc', label: 'OBC' },
        { value: 'sc', label: 'SC' },
        { value: 'st', label: 'ST' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'minority_status',
      step: 7,
      totalSteps: 8,
      question: "Do you belong to a minority community? (Optional)",
      type: 'choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'bpl_apl_status',
      step: 7,
      totalSteps: 8,
      question: "What's your BPL/APL status? (Optional)",
      type: 'choice',
      options: [
        { value: 'bpl', label: 'BPL (Below Poverty Line)' },
        { value: 'apl', label: 'APL (Above Poverty Line)' },
      ],
    },
    {
      id: 'ration_card_type',
      step: 7,
      totalSteps: 8,
      question: "What type of ration card do you have? (Optional)",
      type: 'choice',
      options: [
        { value: 'priority', label: 'Priority' },
        { value: 'non_priority', label: 'Non-Priority' },
        { value: 'antyodaya', label: 'Antyodaya' },
        { value: 'none', label: "Don't have a ration card" },
      ],
    },
  ];
}

function getStateOptions(): Array<{ value: string; label: string }> {
  const states = [
    "All India",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
  ];
  
  return states.map(state => ({ value: state, label: state }));
}

export function calculateProgress(profile: EligibilityProfile): number {
  const totalQuestions = getAllQuestions().filter(q => !q.skipCondition || !q.skipCondition(profile)).length;
  const answeredQuestions = getAllQuestions().filter(q => 
    (!q.skipCondition || !q.skipCondition(profile)) && isQuestionAnswered(q, profile)
  ).length;
  
  return Math.round((answeredQuestions / totalQuestions) * 100) || 0;
}

export function getCurrentStep(profile: EligibilityProfile): number {
  const nextQuestion = getNextQuestion(profile);
  return nextQuestion ? nextQuestion.step : 8;
}
