import pdf from 'pdf-parse/lib/pdf-parse.js';

// Standard action verbs valued by technical ATS systems
const ACTION_VERBS = [
  'architected', 'spearheaded', 'orchestrated', 'designed', 'developed', 'deployed',
  'optimized', 'engineered', 'refactored', 'accelerated', 'automated', 'scaled',
  'implemented', 'delivered', 'integrated', 'mentored', 'built', 'reduced', 'increased',
  'enhanced', 'pioneered', 'streamlined', 'modernized', 'led', 'established'
];

// Common tech keywords categorized
const TECH_KEYWORDS = [
  'javascript', 'typescript', 'react', 'next.js', 'node.js', 'express', 'python',
  'fastapi', 'django', 'postgresql', 'mysql', 'mongodb', 'redis', 'docker', 'kubernetes',
  'aws', 'gcp', 'azure', 'ci/cd', 'github actions', 'rest api', 'graphql', 'grpc',
  'microservices', 'kafka', 'rabbitmq', 'vitest', 'jest', 'playwright', 'tailwind css',
  'webpack', 'vite', 'system design', 'agile', 'scrum', 'git', 'linux'
];

export const parsePdfBuffer = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text || '';
  } catch (err) {
    console.error('PDF parsing error:', err);
    throw new Error('Failed to extract text from PDF.');
  }
};

export const analyzeResumeContent = (text, targetRole = 'Software Engineer') => {
  const normalizedText = text.toLowerCase();
  
  // 1. Section Detection
  const sections = {
    contact: /(email|phone|linkedin|github|portfolio|contact)/i.test(text),
    summary: /(summary|about me|profile|overview|objective)/i.test(text),
    experience: /(experience|work history|employment|career history)/i.test(text),
    skills: /(skills|technologies|technical stack|competencies)/i.test(text),
    education: /(education|academic|degree|university|college)/i.test(text),
    projects: /(projects|open source|personal projects|portfolio projects)/i.test(text)
  };

  // 2. Action Verbs Count
  const foundActionVerbs = ACTION_VERBS.filter(verb => 
    new RegExp(`\\b${verb}\\b`, 'i').test(text)
  );

  // 3. Technical Skills Found
  const foundSkills = TECH_KEYWORDS.filter(tech => 
    normalizedText.includes(tech)
  );

  // 4. Quantifiable Impact Metrics Detection (e.g. 40%, $2M, 500k users, 2x, 10ms)
  const metricMatches = text.match(/(\d+%\s|\$\d+|\d+x|\d+k|\d+ms|\d+\s*(users|requests|engineers|teams|seconds|percent))/gi) || [];

  // 5. Score Calculation (0 - 100)
  let sectionScore = Object.values(sections).filter(Boolean).length * 8.33; // ~50 max
  let verbScore = Math.min(foundActionVerbs.length * 2, 20); // 20 max
  let metricScore = Math.min(metricMatches.length * 3, 20); // 20 max
  let skillScore = Math.min(foundSkills.length * 1.5, 10); // 10 max

  const totalAtsScore = Math.round(Math.min(sectionScore + verbScore + metricScore + skillScore, 100));

  // 6. Strengths & Recommendations
  const strengths = [];
  const improvements = [];
  const missingSections = [];

  Object.entries(sections).forEach(([sec, present]) => {
    if (!present) missingSections.push(sec.charAt(0).toUpperCase() + sec.slice(1));
  });

  if (foundActionVerbs.length >= 6) {
    strengths.push(`Strong active leadership vocabulary (${foundActionVerbs.length} strong action verbs identified).`);
  } else {
    improvements.push('Incorporate more high-impact action verbs (e.g. "Architected", "Spearheaded", "Optimized") instead of passive phrasing like "Responsible for".');
  }

  if (metricMatches.length >= 4) {
    strengths.push(`Excellent quantifiable impact metrics (${metricMatches.length} metrics found demonstrating business value).`);
  } else {
    improvements.push('Add measurable quantifiable metrics (e.g., "reduced P99 latency by 35%", "scaled to 1.2M daily active users").');
  }

  if (missingSections.length > 0) {
    improvements.push(`Critical ATS sections missing or not clearly labeled: ${missingSections.join(', ')}.`);
  } else {
    strengths.push('All core ATS resume sections (Experience, Skills, Education, Projects) are clearly structured.');
  }

  return {
    atsScore: totalAtsScore,
    sectionBreakdown: {
      sectionsDetected: sections,
      missingSections,
      actionVerbsCount: foundActionVerbs.length,
      actionVerbsSample: foundActionVerbs.slice(0, 8),
      skillsFoundCount: foundSkills.length,
      skillsList: foundSkills,
      metricCount: metricMatches.length,
      metricSamples: metricMatches.slice(0, 5)
    },
    strengths,
    improvements,
    targetRole
  };
};

export const matchResumeWithJD = (resumeText, jdText, jobTitle = 'Target Role') => {
  const normResume = resumeText.toLowerCase();
  const normJd = jdText.toLowerCase();

  // Find requirements in JD
  const jdKeywords = TECH_KEYWORDS.filter(tech => normJd.includes(tech));
  
  // Find matches and missing
  const matched = jdKeywords.filter(k => normResume.includes(k));
  const missing = jdKeywords.filter(k => !normResume.includes(k));

  const matchRatio = jdKeywords.length > 0 ? (matched.length / jdKeywords.length) : 0.75;
  const matchScore = Math.round(matchRatio * 100);

  // Generate tailored insights
  const recommendations = [];
  if (missing.length > 0) {
    recommendations.push(`Explicitly address missing keywords required by the job post: ${missing.slice(0, 5).join(', ')}.`);
  }
  recommendations.push(`Tailor your executive summary to mirror the company's language for ${jobTitle}.`);
  recommendations.push(`Prepare talking points highlighting your relevant experience with ${matched.slice(0, 4).join(', ')}.`);

  return {
    jobTitle,
    matchScore,
    matchedSkills: matched,
    missingSkills: missing,
    totalRequirementsChecked: jdKeywords.length,
    recommendations
  };
};
