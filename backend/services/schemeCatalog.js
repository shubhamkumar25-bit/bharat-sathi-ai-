export const schemeCatalog = [
  {
    id: 'student-scholarships',
    title: 'Student Scholarship Programs',
    category: 'Education',
    audience: ['student', 'family'],
    states: ['all'],
    occupation: ['student'],
    summary: 'Scholarships and fee support for school, college, and skill training.',
    eligibility: 'Students from eligible income and academic categories.',
    documents: ['Aadhaar', 'Income Certificate', 'Marksheet', 'Bank Account'],
  },
  {
    id: 'kisan-support',
    title: 'Kisan Support Schemes',
    category: 'Agriculture',
    audience: ['farmer'],
    states: ['all'],
    occupation: ['farmer'],
    summary: 'Crop assistance, equipment subsidy, and direct support programs.',
    eligibility: 'Farmers and cultivators meeting program-specific criteria.',
    documents: ['Aadhaar', 'Land Records', 'Bank Account', 'Photo'],
  },
  {
    id: 'skill-india',
    title: 'Skill and Employment Programs',
    category: 'Employment',
    audience: ['worker', 'student', 'youth'],
    states: ['all'],
    occupation: ['student', 'worker'],
    summary: 'Short courses, job readiness, and placement support.',
    eligibility: 'Youth and job seekers looking for training support.',
    documents: ['ID Proof', 'Education Proof', 'Resume'],
  },
  {
    id: 'women-empowerment',
    title: 'Women Empowerment Schemes',
    category: 'Social Welfare',
    audience: ['woman', 'family'],
    states: ['all'],
    occupation: ['student', 'worker', 'entrepreneur'],
    summary: 'Support for women entrepreneurs, education, and welfare.',
    eligibility: 'Women and girl beneficiaries under scheme guidelines.',
    documents: ['Aadhaar', 'Income Certificate', 'Bank Account'],
  },
];

export function filterSchemes({ query = '', category = 'all', occupation = 'all', state = 'all' }) {
  const normalizedQuery = query.trim().toLowerCase();

  return schemeCatalog.filter((scheme) => {
    const queryMatch = !normalizedQuery || [scheme.title, scheme.summary, scheme.eligibility, scheme.category, ...(scheme.documents || [])]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);
    const categoryMatch = category === 'all' || scheme.category.toLowerCase() === category.toLowerCase();
    const occupationMatch = occupation === 'all' || scheme.occupation.includes(occupation);
    const stateMatch = state === 'all' || scheme.states.includes('all') || scheme.states.includes(state);

    return queryMatch && categoryMatch && occupationMatch && stateMatch;
  });
}