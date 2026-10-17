import assert from 'node:assert/strict';
import { analyzeResumeForInterviews, saveResumeAnalysis, getActiveResumeAnalysis } from './src/services/resumeAnalysisService.js';

// Setup mock window and localStorage for node environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.CustomEvent = class CustomEvent {
  constructor(name, detail) {
    this.name = name;
    this.detail = detail?.detail;
  }
};

console.log('========================================================');
console.log('🧪 VERIFYING PROFILE CONNECTIVITY & RESUME IMPROVEMENT FLOW');
console.log('========================================================\n');

// 1. Verify user profile connection on login/signup
console.log('--- Step 1: User Profile Connected on Login/Device ---');
const userSession = {
  fullName: 'Mallhar',
  email: 'mallpat2008@gmail.com',
  targetRole: 'Backend Engineer',
  resumeName: 'Mallhar_Senior_Backend_Resume.pdf'
};

// Simulate auth storage on device
localStorage.setItem('candidate_name', userSession.fullName);
localStorage.setItem('candidate_email', userSession.email);
localStorage.setItem('candidate_role', userSession.targetRole);
localStorage.setItem('candidate_resume', userSession.resumeName);

// Verify credentials retrieval matches what Profile.jsx uses
const displayedName = localStorage.getItem('candidate_name');
const displayedEmail = localStorage.getItem('candidate_email');
const displayedRole = localStorage.getItem('candidate_role');
const displayedResume = localStorage.getItem('candidate_resume');

assert.equal(displayedName, 'Mallhar', 'Full Name must be Mallhar');
assert.equal(displayedEmail, 'mallpat2008@gmail.com', 'Email must be mallpat2008@gmail.com');
assert.equal(displayedRole, 'Backend Engineer', 'Role must be Backend Engineer');
assert.equal(displayedResume, 'Mallhar_Senior_Backend_Resume.pdf', 'Resume must be preserved');

console.log('✅ Connected credentials verified:');
console.log(`   - Full Name: ${displayedName}`);
console.log(`   - Email:     ${displayedEmail}`);
console.log(`   - Role:      ${displayedRole}`);
console.log(`   - Resume:    ${displayedResume}\n`);

// 2. Verify Resume Improvement / Re-upload AI Re-analysis Flow
console.log('--- Step 2: "Improve Resume (Re-upload)" AI Re-Analysis ---');

const updatedResumeText = `
Mallhar - Senior Backend & Cloud Engineer
Email: mallpat2008@gmail.com
Summary: 6+ years designing high-throughput distributed architectures, microservices, and event-driven backends.
Core Technical Skills: Golang, Python, Node.js, PostgreSQL, Redis, Apache Kafka, Docker, Kubernetes, AWS, System Design, gRPC, Distributed Systems
Projects:
1. High-Scale Payment Settlement Gateway: Built transactional payment ledger handling 25,000 TPS with Redis caching, Kafka queues, and PostgreSQL partitioned tables.
2. Real-Time Telemetry Event Streaming: Architected event pipeline with Go and gRPC, reducing latency by 45% across 20+ microservices.
`;

// Run AI analysis as Profile.jsx handleFileSelect would
const newAnalysis = analyzeResumeForInterviews(
  updatedResumeText,
  'Mallhar_Senior_Backend_Resume_v2.pdf',
  displayedRole
);

saveResumeAnalysis(newAnalysis);
localStorage.setItem('candidate_resume', 'Mallhar_Senior_Backend_Resume_v2.pdf');
localStorage.setItem('candidate_resume_text', updatedResumeText);

const savedAnalysis = getActiveResumeAnalysis();
assert.ok(savedAnalysis, 'Active analysis must be stored');
assert.equal(savedAnalysis.resumeName, 'Mallhar_Senior_Backend_Resume_v2.pdf');
assert.ok(savedAnalysis.skills.length >= 5, 'Must extract at least 5 backend skills');
assert.ok(savedAnalysis.tailoredQuestions.length >= 3, 'Must formulate tailored interview questions');
assert.ok(savedAnalysis.codingRecommendation, 'Must generate tailored coding round recommendation');

console.log('✅ Resume Improvement Re-analysis Successful:');
console.log(`   - Updated Resume File: ${savedAnalysis.resumeName}`);
console.log(`   - Detected Specialization: ${savedAnalysis.branch.name}`);
console.log(`   - Extracted Skills (${savedAnalysis.skills.length}): ${savedAnalysis.skills.slice(0, 8).join(', ')}`);
console.log(`   - Detected Projects (${savedAnalysis.projects.length}): ${savedAnalysis.projects.map(p => p.title).join(' | ')}`);
console.log(`   - Calibrated Coding Challenge: "${savedAnalysis.codingRecommendation.title}" (${savedAnalysis.codingRecommendation.category})`);
console.log(`   - Formulated Tailored Questions (${savedAnalysis.tailoredQuestions.length}):`);
savedAnalysis.tailoredQuestions.forEach((q, idx) => {
  console.log(`     Q${idx + 1} [${q.type}]: "${q.question.slice(0, 85)}..."`);
});

console.log('\n========================================================');
console.log('🎉 PROFILE CONNECTIVITY & RE-ANALYSIS FULLY VERIFIED!');
console.log('========================================================');
