// End-to-end integration test for Resume Analysis, Tailored Questions, and Coding Challenges
import { 
  extractSkillsFromText, 
  detectBranchFromText, 
  extractProjectsAndMetrics, 
  generateTailoredQuestions, 
  getTailoredCodingChallenge,
  analyzeResumeForInterviews
} from './src/services/resumeAnalysisService.js';

import { ALL_CODING_CHALLENGES, getChallengeById } from './src/data/codingChallenges.js';

console.log('========================================================');
console.log('🧪 RUNNING AI INTERVIEW COACH END-TO-END VERIFICATION');
console.log('========================================================\n');

// 1. Test Resumes across distinct Engineering Branches
const testResumes = [
  {
    branchName: 'AI & ML',
    fileName: 'ananya_ml_engineer_resume.pdf',
    role: 'Machine Learning Engineer',
    text: `ANANYA SHARMA
Machine Learning Engineer | Python, PyTorch, Hugging Face, Scikit-learn, LangChain, RAG
SUMMARY:
Engineered large language model pipelines and deep neural networks. Built an end-to-end Retrieval-Augmented Generation (RAG) system with Pinecone vector database and cosine similarity re-ranking.
PROJECTS:
- Medical Imaging Classification: Trained ResNet-50 CNN on 120,000 CT scans, achieving 94.2% diagnostic accuracy.
- Enterprise LLM Knowledge Base: Implemented semantic document search with vector embeddings, reducing search latency by 45% and eliminating hallucinations.
- Real-time Fraud Detection Engine: Scaled streaming inference to 3,500 predictions/second with sub-25ms response time.`
  },
  {
    branchName: 'Mechanical Engineering',
    fileName: 'rahul_mechanical_design.pdf',
    role: 'Mechanical Design Engineer',
    text: `RAHUL VERMA
Mechanical Design Engineer | SolidWorks, AutoCAD, ANSYS FEA, GD&T, DFMA
SUMMARY:
Mechanical design specialist with 4+ years modeling high-precision components and performing structural finite element analysis.
PROJECTS:
- Lightweight Aluminum Chassis: Modeled 3D CAD parametric assemblies in SolidWorks and verified yield strength with ANSYS FEA, reducing part mass by 18% while sustaining 40kN torsional load.
- Thermal Heat Exchanger Optimization: Conducted CFD simulations to optimize fin geometry, improving heat dissipation by 28%.`
  },
  {
    branchName: 'Electrical / Embedded Systems',
    fileName: 'vikram_embedded_systems.pdf',
    role: 'Embedded Systems Engineer',
    text: `VIKRAM IYER
Embedded Systems Engineer | Embedded C, C++, ARM Cortex-M4, STM32, FreeRTOS, SPI, I2C, UART
SUMMARY:
Firmware developer with deep expertise in bare-metal microcontroller drivers, RTOS multitasking, and hardware register manipulation.
PROJECTS:
- Industrial IoT Telemetry Node: Developed STM32 firmware using FreeRTOS and SPI sensor interfaces, reducing idle power draw by 42%.
- Motor Controller CAN Bus Driver: Wrote low-level bitwise register drivers for brushless DC motors with zero transmission drop under 1 Mbps bus load.`
  }
];

let allTestsPassed = true;

// TEST SUITE 1: Resume Parsing, Skill Extraction & Question Tailoring
console.log('--- TEST SUITE 1: Resume Analysis & Question Tailoring ---');
for (const res of testResumes) {
  const analysis = analyzeResumeForInterviews(res.text, res.fileName, res.role);
  console.log(`\n📄 Resume: ${res.fileName} (Target: ${res.role})`);
  console.log(`   - Detected Branch: ${analysis.branch.name} (${analysis.branch.shortName})`);
  console.log(`   - Skills Extracted (${analysis.skills.length}): ${analysis.skills.slice(0, 6).join(', ')}`);
  console.log(`   - Projects Detected: ${analysis.projects.length}`);
  console.log(`   - Metrics Detected: ${analysis.metrics.length}`);
  console.log(`   - Tailored Coding Challenge: "${analysis.codingRecommendation.title}" (${analysis.codingRecommendation.category})`);
  console.log(`   - Tailored Questions (${analysis.tailoredQuestions.length}):`);
  analysis.tailoredQuestions.forEach((q, idx) => {
    console.log(`     Q${idx + 1} [${q.category}]: "${q.question.slice(0, 95)}..."`);
  });

  if (!analysis.skills.length || !analysis.tailoredQuestions.length || !analysis.codingRecommendation) {
    console.error(`❌ FAILED for ${res.fileName}`);
    allTestsPassed = false;
  } else {
    console.log(`   ✅ PASS`);
  }
}

// TEST SUITE 2: Coding Challenges Execution & Test Runner
console.log('\n--- TEST SUITE 2: Coding Round Test Execution ---');
const deepEqual = (a, b) => {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.005;
  }
  return JSON.stringify(a) === JSON.stringify(b);
};

for (const chal of ALL_CODING_CHALLENGES) {
  console.log(`\n💻 Challenge: [${chal.branch}] "${chal.title}" (${chal.difficulty})`);
  const fnMatch = chal.starterCode.match(/function\s+([a-zA-Z0-9_]+)/);
  if (!fnMatch) {
    console.error(`   ❌ Starter code does not declare a function`);
    allTestsPassed = false;
    continue;
  }
  const fnName = fnMatch[1];
  const evalContext = new Function(`${chal.starterCode}; return ${fnName};`);
  const targetFn = evalContext();

  let chalPassed = true;
  chal.testData.forEach((tc, idx) => {
    const inputCopy = JSON.parse(JSON.stringify(tc.input));
    const actual = targetFn(...inputCopy);
    const passed = deepEqual(actual, tc.expected);
    if (!passed) {
      console.error(`   ❌ Test case ${idx + 1} failed: expected ${JSON.stringify(tc.expected)}, got ${JSON.stringify(actual)}`);
      chalPassed = false;
      allTestsPassed = false;
    }
  });

  if (chalPassed) {
    console.log(`   ✅ Passed all ${chal.testData.length}/${chal.testData.length} test cases!`);
  }
}

console.log('\n========================================================');
if (allTestsPassed) {
  console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (100% READY)');
} else {
  console.error('❌ SOME TESTS FAILED. PLEASE REVIEW LOGS.');
}
console.log('========================================================');
