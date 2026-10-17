// Comprehensive Resume Analysis and Dynamic Interview/Coding Tailoring Service
import { ENGINEERING_BRANCHES, ALL_ROLES, getDefaultSkillsForRole } from '../data/engineeringRoles.js';

// Tech skill keywords mapped to engineering branches
const BRANCH_SKILL_PATTERNS = {
  ai_ml: [
    'python', 'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'pandas', 'numpy', 
    'machine learning', 'deep learning', 'nlp', 'computer vision', 'opencv', 'rag',
    'langchain', 'llamaindex', 'hugging face', 'llm', 'vector database', 'transformers',
    'bert', 'yolo', 'neural network', 'cnn', 'embedding', 'prompt engineering'
  ],
  mechanical: [
    'solidworks', 'autocad', 'catia', 'ansys', 'fea', 'cfd', 'gd&t', 'dfma',
    'thermodynamics', 'fluid mechanics', 'heat transfer', 'hvac', 'cad', 'cam',
    'cnc', 'machining', 'injection molding', 'vehicle dynamics', 'powertrain',
    'stress analysis', 'hypermesh', 'matlab', 'simulink', 'mechanical design'
  ],
  electrical: [
    'embedded c', 'c++', 'arm cortex', 'stm32', 'esp32', 'freertos', 'rtos',
    'i2c', 'spi', 'uart', 'oscilloscope', 'pcb', 'altium', 'kicad', 'vlsi',
    'verilog', 'vhdl', 'fpga', 'microcontroller', 'power electronics', 'bms',
    'iot', 'ble', 'zigbee', 'mqtt', 'circuit simulation', 'spice'
  ],
  civil: [
    'staad.pro', 'etabs', 'autocad', 'rcc', 'structural steel', 'seismic',
    'concrete', 'soil mechanics', 'foundation', 'primavera', 'civil 3d',
    'quantity surveying', 'construction management', 'gis', 'structural design'
  ],
  robotics: [
    'ros', 'ros 2', 'kinematics', 'dynamics', 'moveit', 'slam', 'lidar',
    'motion planning', 'sensor fusion', 'plc', 'scada', 'siemens', 'pid',
    'servo', 'actuator', 'autonomous'
  ],
  it: [
    'active directory', 'windows server', 'linux administration', 'vmware',
    'hyper-v', 'ccna', 'cisco', 'tcp/ip', 'firewall', 'vpn', 'wireshark',
    'dns', 'dhcp', 'dba', 'sql server', 'powershell', 'itil', 'servicenow'
  ],
  cs: [
    'javascript', 'typescript', 'react', 'next.js', 'vue', 'node.js', 'express',
    'postgresql', 'mysql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws',
    'graphql', 'rest api', 'microservices', 'ci/cd', 'system design', 'git'
  ]
};

/**
 * Extract technical skills from resume text across all engineering branches
 */
export const extractSkillsFromText = (text = '') => {
  const normalized = text.toLowerCase();
  const matched = new Set();

  // 1. Scan across predefined branch patterns
  Object.values(BRANCH_SKILL_PATTERNS).forEach(skillList => {
    skillList.forEach(skill => {
      const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${skill.replace('+', '\\+')}([^a-zA-Z0-9_#+]|$)`, 'i');
      if (regex.test(normalized)) {
        // Format with title case
        const formatted = skill
          .split(' ')
          .map(w => w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        matched.add(formatted);
      }
    });
  });

  // 2. Also check skills from engineeringRoles
  ALL_ROLES.forEach(r => {
    r.skills.forEach(s => {
      const lower = s.toLowerCase();
      if (normalized.includes(lower)) {
        matched.add(s);
      }
    });
  });

  return Array.from(matched);
};

/**
 * Detect the dominant engineering branch from resume text and skills
 */
export const detectBranchFromText = (text = '', skills = []) => {
  const normalized = text.toLowerCase();
  const scores = {
    ai_ml: 0,
    mechanical: 0,
    electrical: 0,
    civil: 0,
    robotics: 0,
    it: 0,
    cs: 0
  };

  Object.entries(BRANCH_SKILL_PATTERNS).forEach(([branch, patterns]) => {
    patterns.forEach(p => {
      if (normalized.includes(p)) scores[branch] += 2;
      if (skills.some(s => s.toLowerCase() === p)) scores[branch] += 3;
    });
  });

  // Explicit title triggers
  if (/mechanical|cad|solidworks|ansys|thermodynamics/i.test(normalized)) scores.mechanical += 6;
  if (/machine learning|deep learning|data scientist|artificial intelligence|llm|pytorch/i.test(normalized)) scores.ai_ml += 6;
  if (/embedded|firmware|microcontroller|vlsi|pcb|fpga/i.test(normalized)) scores.electrical += 6;
  if (/structural|civil|concrete|staad|construction/i.test(normalized)) scores.civil += 6;
  if (/robotics|robot|ros 2|automation|plc/i.test(normalized)) scores.robotics += 6;
  if (/system admin|network engineer|active directory|cisco|infrastructure/i.test(normalized)) scores.it += 6;
  if (/software engineer|frontend|backend|full stack|web developer|react|node/i.test(normalized)) scores.cs += 4;

  let bestBranch = 'cs';
  let maxScore = -1;
  Object.entries(scores).forEach(([branch, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestBranch = branch;
    }
  });

  const branchObj = ENGINEERING_BRANCHES.find(b => b.id === bestBranch) || ENGINEERING_BRANCHES[0];
  return {
    branchId: branchObj.id,
    name: branchObj.name,
    branchName: branchObj.name,
    shortName: branchObj.shortName,
    confidence: Math.min(Math.round((maxScore / 20) * 100), 98)
  };
};

/**
 * Extract projects and key impact metrics from resume text
 */
export const extractProjectsAndMetrics = (text = '') => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const projects = [];
  const metrics = [];

  // Extract metrics: e.g. "reduced latency by 40%", "scaled to 2M users", "improved accuracy to 94%"
  const metricRegex = /(\b(?:increased|reduced|improved|scaled|saved|cut|accelerated|achieved)\b[^,\.\n]*(?:\d+%\s*|\$\d+[kKmM]?|\d+x|\d+\s*(?:ms|seconds|users|requests|engineers|components|kg|bar|psi))[^,\.\n]*)/gi;
  let match;
  while ((match = metricRegex.exec(text)) !== null) {
    if (match[0].length < 120) {
      metrics.push(match[0].trim());
    }
  }

  // Look for project headings or bullet points
  let inProjectSection = false;
  lines.forEach((line) => {
    if (/^(projects|technical projects|key projects|academic projects)/i.test(line)) {
      inProjectSection = true;
      return;
    }
    if (/^(education|experience|work experience|skills|certifications)/i.test(line)) {
      inProjectSection = false;
    }

    if (inProjectSection) {
      if (/^[•\-\*]\s*(.+)/.test(line) || /^[A-Z][a-zA-Z0-9\s\-_]{3,40}(?:\s*\||\s*\(|\s*\–|\s*\:)/.test(line)) {
        const clean = line.replace(/^[•\-\*]\s*/, '').trim();
        if (clean.length > 15 && clean.length < 160) {
          projects.push(clean);
        }
      }
    }
  });

  // Fallback projects if no explicit section matched
  if (projects.length === 0) {
    const actionLines = lines.filter(l => 
      /^(designed|developed|implemented|built|architected|engineered|created|deployed)/i.test(l.replace(/^[•\-\*]\s*/, ''))
    );
    projects.push(...actionLines.slice(0, 4).map(l => l.replace(/^[•\-\*]\s*/, '').trim()));
  }

  return {
    projects: projects.slice(0, 4),
    metrics: Array.from(new Set(metrics)).slice(0, 5)
  };
};

/**
 * Generate personalized interview questions grounded directly in the candidate's resume
 */
export const generateTailoredQuestions = ({ resumeName, branch, role, skills, projects, metrics }) => {
  const questions = [];
  const p1 = projects[0] || 'your core technical project';
  const p2 = projects[1] || 'your recent engineering challenge';
  const s1 = skills[0] || 'system design';
  const s2 = skills[1] || 'problem solving';
  const s3 = skills[2] || 'architecture';
  const m1 = metrics[0] || null;

  // Question 1: Project Architecture & Technical Decisions
  questions.push({
    category: 'architecture',
    type: 'architecture',
    question: `Looking at your resume, you highlighted work on "${p1.slice(0, 80)}". Walk me through the system architecture, how you chose ${s1}, and the toughest trade-off you navigated.`,
    coachTip: `Cite specific architectural decisions, component contracts, and why alternatives were rejected. Use the STAR framework.`
  });

  // Question 2: Quantifiable Impact & Optimization (Metric-driven)
  if (m1) {
    questions.push({
      category: 'technical',
      type: 'technical',
      question: `In your resume, you noted that you "${m1.slice(0, 90)}". How did you baseline and benchmark this result, and what root bottlenecks did you address?`,
      coachTip: `Provide concrete quantitative data: initial latency/throughput/stress versus optimized state, tools used, and testing rigor.`
    });
  } else {
    questions.push({
      category: 'technical',
      type: 'technical',
      question: `Your resume lists deep experience with ${s1} and ${s2}. How do you diagnose unexpected performance degradation or race conditions when scaling these systems?`,
      coachTip: `Walk through your observability stack, profiling tools, and systematic triage steps.`
    });
  }

  // Question 3: Branch-Specific Deep Technical Probe
  if (branch.branchId === 'ai_ml') {
    questions.push({
      category: 'technical',
      type: 'technical',
      question: `Given your AI/ML stack (${skills.slice(0, 4).join(', ')}), how do you prevent data drift, handle outliers in training pipelines, and evaluate model hallucinations in production?`,
      coachTip: `Discuss validation sets, embedding evaluation metrics (cosine similarity / BLEU / ROUGE), and inference quantization.`
    });
  } else if (branch.branchId === 'mechanical') {
    questions.push({
      category: 'technical',
      type: 'technical',
      question: `Considering your mechanical design background (${skills.slice(0, 4).join(', ')}), how do you establish GD&T datum reference frames and conduct FEA mesh convergence checks to ensure safety factors?`,
      coachTip: `Highlight ASME Y14.5 standards, von Mises stress criteria, material yield limits, and manufacturing tolerances.`
    });
  } else if (branch.branchId === 'electrical') {
    questions.push({
      category: 'technical',
      type: 'technical',
      question: `Based on your embedded firmware experience (${skills.slice(0, 4).join(', ')}), how do you prevent task priority inversion in RTOS and debug transient hardware bugs with oscilloscopes?`,
      coachTip: `Explain priority inheritance mutexes, ISR minimal execution windows, decoupling capacitors, and signal integrity.`
    });
  } else if (branch.branchId === 'civil') {
    questions.push({
      category: 'technical',
      type: 'technical',
      question: `In your structural design work (${skills.slice(0, 4).join(', ')}), how do you model combined lateral seismic and wind loads in STAAD/ETABS according to building code limit states?`,
      coachTip: `Mention response spectrum analysis, shear wall rigidity centers, and serviceability deflection checks.`
    });
  } else {
    questions.push({
      category: 'technical',
      type: 'technical',
      question: `Your resume demonstrates expertise with ${s1}, ${s2}, and ${s3}. How do you ensure high availability, data consistency, and zero-downtime deployments under high concurrency?`,
      coachTip: `Describe distributed caching, database connection pooling, idempotent APIs, and canary rollouts.`
    });
  }

  // Question 4: Behavioral & Engineering Execution
  questions.push({
    category: 'behavioral',
    type: 'behavioral',
    question: `Tell me about a time on "${p2.slice(0, 70)}" when project requirements shifted or an unexpected roadblock appeared. How did you align the team and deliver?`,
    coachTip: `Focus on leadership, proactive communication, risk assessment, and pragmatic technical prioritization.`
  });

  return questions;
};

/**
 * Recommend tailored coding challenges matching the candidate's resume domain
 */
export const getTailoredCodingChallenge = (branchId, skills = []) => {
  const normSkills = skills.map(s => s.toLowerCase());

  if (branchId === 'ai_ml' || normSkills.some(s => s.includes('python') || s.includes('torch') || s.includes('learn') || s.includes('pandas'))) {
    return {
      challengeId: 'chal-vector-cosine-similarity',
      title: 'Vector Cosine Similarity & Dot Product',
      category: 'Linear Algebra & Machine Learning',
      reason: 'Matched to your resume background in AI/ML, Python data structures, and vector embeddings.',
      relatedChallengeIds: ['chal-vector-cosine-similarity', 'chal-mse-loss', 'chal-two-sum']
    };
  }

  if (branchId === 'mechanical' || normSkills.some(s => s.includes('solidworks') || s.includes('cad') || s.includes('fea') || s.includes('matlab'))) {
    return {
      challengeId: 'chal-cad-polygon-area',
      title: '2D CAD Polygon Area (Shoelace Algorithm)',
      category: 'Computational Geometry & CAD',
      reason: 'Matched to your mechanical engineering resume profile for CAD geometric calculations and cross-sectional area analysis.',
      relatedChallengeIds: ['chal-cad-polygon-area', 'chal-beam-bending-moment', 'chal-two-sum']
    };
  }

  if (branchId === 'electrical' || normSkills.some(s => s.includes('embedded') || s.includes('arm') || s.includes('c++') || s.includes('rtos') || s.includes('pcb'))) {
    return {
      challengeId: 'chal-bitwise-register',
      title: 'Microcontroller Register Bit Manipulation',
      category: 'Embedded Systems & Bitwise Operations',
      reason: 'Matched to your embedded systems and firmware resume profile for low-level peripheral configuration.',
      relatedChallengeIds: ['chal-bitwise-register', 'chal-valid-parentheses', 'chal-two-sum']
    };
  }

  if (branchId === 'civil' || normSkills.some(s => s.includes('staad') || s.includes('structural') || s.includes('concrete'))) {
    return {
      challengeId: 'chal-beam-bending-moment',
      title: 'Simply Supported Beam Peak Bending Moment',
      category: 'Structural Mechanics & Beam Analysis',
      reason: 'Matched to your structural and civil engineering resume background for load and moment calculations.',
      relatedChallengeIds: ['chal-beam-bending-moment', 'chal-cad-polygon-area', 'chal-two-sum']
    };
  }

  if (normSkills.some(s => s.includes('react') || s.includes('front') || s.includes('css') || s.includes('next'))) {
    return {
      challengeId: 'chal-flatten-array',
      title: 'Flatten Multi-Dimensional Nested Array',
      category: 'JavaScript & Recursion',
      reason: 'Matched to your frontend web and state management background in recursion and deeply nested structures.',
      relatedChallengeIds: ['chal-flatten-array', 'chal-longest-substring', 'chal-valid-parentheses']
    };
  }

  if (branchId === 'it' || normSkills.some(s => s.includes('docker') || s.includes('kubernetes') || s.includes('linux') || s.includes('network'))) {
    return {
      challengeId: 'chal-log-latency-p99',
      title: 'Server Latency Percentile (P99) Analyzer',
      category: 'Cloud Telemetry & Log Analysis',
      reason: 'Matched to your DevOps & IT infrastructure profile for monitoring SLAs and high percentiles.',
      relatedChallengeIds: ['chal-log-latency-p99', 'chal-merge-intervals', 'chal-two-sum']
    };
  }

  // Default Backend / CS
  return {
    challengeId: 'chal-merge-intervals',
    title: 'Merge Overlapping Intervals',
    category: 'Algorithms & Data Structures',
    reason: 'Matched to your backend and full stack engineering background for algorithmic data processing.',
    relatedChallengeIds: ['chal-merge-intervals', 'chal-two-sum', 'chal-longest-substring']
  };
};

/**
 * Main analysis function: parses resume text and produces a comprehensive tailored interview package
 */
export const analyzeResumeForInterviews = (resumeText = '', fileName = 'Resume.pdf', selectedRole = null) => {
  const skills = extractSkillsFromText(resumeText);
  const branch = detectBranchFromText(resumeText, skills);
  const { projects, metrics } = extractProjectsAndMetrics(resumeText);

  // Derive target role if not provided
  let role = selectedRole;
  if (!role || role === 'Full Stack Engineer') {
    const branchObj = ENGINEERING_BRANCHES.find(b => b.id === branch.branchId);
    if (branchObj && branchObj.roles.length > 0) {
      role = branchObj.roles[0].name;
    } else {
      role = 'Full Stack Engineer';
    }
  }

  const tailoredQuestions = generateTailoredQuestions({
    resumeName: fileName,
    branch,
    role,
    skills,
    projects,
    metrics
  });

  const codingRecommendation = getTailoredCodingChallenge(branch.branchId, skills);

  const analysis = {
    fileName,
    resumeName: fileName,
    analyzedAt: new Date().toISOString(),
    branch,
    role,
    skills: skills.length > 0 ? skills.slice(0, 12) : getDefaultSkillsForRole(role),
    projects,
    metrics,
    tailoredQuestions,
    codingRecommendation,
    summary: `Analyzed resume for ${role} (${branch.shortName}). Detected ${skills.length} skills, ${projects.length} key projects, and ${metrics.length} business impact metrics.`
  };

  return analysis;
};

/**
 * Persist analyzed resume to localStorage and notify all components
 */
export const saveResumeAnalysis = (analysis) => {
  try {
    localStorage.setItem('candidate_resume', analysis.fileName || 'Resume.pdf');
    localStorage.setItem('candidate_resume_analysis', JSON.stringify(analysis));
    if (analysis.skills?.length > 0) {
      localStorage.setItem('candidate_skills', JSON.stringify(analysis.skills));
    }
    if (analysis.role) {
      localStorage.setItem('candidate_role', analysis.role);
    }
    window.dispatchEvent(new CustomEvent('resume_analysis_updated', { detail: analysis }));
  } catch (err) {
    console.warn('Failed to save resume analysis to localStorage:', err);
  }
};

/**
 * Get currently active resume analysis from localStorage
 */
export const getActiveResumeAnalysis = () => {
  try {
    const raw = localStorage.getItem('candidate_resume_analysis');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
};
