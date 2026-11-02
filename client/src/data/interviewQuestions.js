// Client-side Question Bank & Offline Evaluation Engine for AI Interview Coach

export const INTERVIEW_QUESTION_BANK = {
  "Frontend Engineer": [
    {
      id: "fe-1",
      category: "technical",
      question: "Can you explain how React's Virtual DOM reconciliation algorithm works, and what triggers an unnecessary re-render?",
      coachTip: "Highlight the diffing algorithm's O(n) heuristic, key props, and how useMemo / React.memo prevent subtree reconciliation.",
      sampleIdealAnswer: "React uses a heuristic O(n) reconciliation algorithm comparing virtual DOM trees by component type and keys. Unnecessary renders happen when parent state changes pass new object/function references without memoization."
    },
    {
      id: "fe-2",
      category: "technical",
      question: "How do you optimize Core Web Vitals (LCP, INP, CLS) in a modern high-traffic web application?",
      coachTip: "Structure with concrete metrics: LCP image preloading, INP task yielding with scheduler.yield(), and CLS layout reservation.",
      sampleIdealAnswer: "For LCP: prioritize hero image preload and reduce server response time. For INP: break up long tasks using scheduler.yield() or requestIdleCallback. For CLS: reserve width/height dimensions for images and ads."
    },
    {
      id: "fe-3",
      category: "architecture",
      question: "Walk me through how you would architect a micro-frontend architecture or a shared design system across multiple teams.",
      coachTip: "Discuss Module Federation, npm versioning strategy, visual regression testing, and design tokens.",
      sampleIdealAnswer: "I would use Module Federation or npm package distribution with strict semantic versioning, automated visual regression testing, and token-based design systems."
    },
    {
      id: "fe-4",
      category: "behavioral",
      question: "Tell me about a time you had a technical disagreement with a backend engineer regarding API payload design. How did you resolve it?",
      coachTip: "Apply the STAR method: Situation, Task, Action, and quantify the Result in latency or developer velocity.",
      sampleIdealAnswer: "Using the STAR method: In our previous project, the backend proposed nested heavy payloads while frontend required low latency mobile responses. I benchmarked payloads, suggested GraphQL/BFF pattern, and aligned on a clean REST contract."
    }
  ],
  "Backend Engineer": [
    {
      id: "be-1",
      category: "technical",
      question: "How does the Node.js event loop handle I/O-bound operations versus CPU-intensive tasks, and how would you prevent thread starvation?",
      coachTip: "Explain libuv thread pool, event loop phases, and worker_threads for offloading CPU-heavy algorithms.",
      sampleIdealAnswer: "Node.js relies on libuv with an event loop and thread pool for async I/O. CPU-intensive operations block the event loop, so they should be offloaded to worker_threads or dedicated worker processes."
    },
    {
      id: "be-2",
      category: "technical",
      question: "Explain the trade-offs between ACID transactions in PostgreSQL and eventual consistency in distributed NoSQL databases.",
      coachTip: "Mention the CAP theorem, write locking vs horizontal partition tolerance, and read replicas.",
      sampleIdealAnswer: "Postgres guarantees strong consistency and isolation at the cost of horizontal scaling complexity and write contention. NoSQL prioritizes partition tolerance and high write throughput under the CAP theorem."
    },
    {
      id: "be-3",
      category: "architecture",
      question: "How would you design an idempotent payment processing API to prevent duplicate transactions during network timeouts?",
      coachTip: "Explain unique idempotency keys, distributed Redis locks, and atomic state transitions.",
      sampleIdealAnswer: "Client generates a unique idempotency key. The backend checks Redis/DB with atomic locks; if processed, returns cached response; if in-flight, returns 409 Conflict."
    },
    {
      id: "be-4",
      category: "behavioral",
      question: "Describe a critical production outage or database lock you investigated under pressure. What was your triage process?",
      coachTip: "Use STAR: Detail the monitoring alerts, pg_stat_activity query inspection, immediate rollback, and root-cause fix.",
      sampleIdealAnswer: "Situation: DB connection pool exhaustion. Task: Restore service in <10 mins. Action: Checked pg_stat_activity, identified unindexed table scans, killed deadlocks, deployed pool scaler. Result: P99 latency dropped by 80%."
    }
  ],
  "Full Stack Engineer": [
    {
      id: "fs-1",
      category: "technical",
      question: "How do you handle real-time bi-directional synchronization between React clients and an Express backend under high concurrency?",
      coachTip: "Mention WebSockets vs SSE, Redis Pub/Sub backplane, and connection reconnection fallbacks.",
      sampleIdealAnswer: "Use WebSockets/Socket.IO backed by Redis Pub/Sub adapter to allow horizontal scaling across multiple Node server instances."
    },
    {
      id: "fs-2",
      category: "technical",
      question: "What security measures do you implement across the full stack against XSS, CSRF, and SQL Injection attacks?",
      coachTip: "Touch on CSP headers, parameterized queries/ORMs, HttpOnly SameSite cookies, and input sanitization.",
      sampleIdealAnswer: "CSP headers, sanitized inputs, parameterized queries/Prisma ORM, HttpOnly SameSite cookies, and helmet middleware."
    },
    {
      id: "fs-3",
      category: "architecture",
      question: "Design an end-to-end file processing pipeline that accepts 100MB video uploads and converts them into various streaming resolutions.",
      coachTip: "Describe presigned S3 URLs, asynchronous background job queues (BullMQ/SQS), ffmpeg transcoders, and CDN distribution.",
      sampleIdealAnswer: "Presigned S3 upload URL -> S3 Event trigger -> BullMQ/SQS worker fleet running ffmpeg -> output HLS chunks -> CloudFront CDN."
    },
    {
      id: "fs-4",
      category: "behavioral",
      question: "Give an example of when you had to balance technical debt against a tight product deadline.",
      coachTip: "Use STAR: Show pragmatic compromise, clear interfaces, and scheduled refactoring iterations.",
      sampleIdealAnswer: "Delivered MVP with clear modular interfaces, logged technical debt tickets with estimated complexity, and negotiated a dedicated refactoring sprint right after launch."
    }
  ],
  "AI & Machine Learning Engineer": [
    {
      id: "ai-1",
      category: "technical",
      question: "Explain Retrieval-Augmented Generation (RAG) architecture: chunking strategies, vector embeddings, and re-ranking.",
      coachTip: "Cover semantic chunking, embedding distance metrics (cosine/dot product), and cross-encoder re-ranking.",
      sampleIdealAnswer: "Documents are split semantically, embedded using embedding models into vector DB (e.g. pgvector), retrieved via cosine similarity, then re-ranked with a cross-encoder before prompt augmentation."
    },
    {
      id: "ai-2",
      category: "technical",
      question: "How do you mitigate hallucinations and validate structured JSON outputs from Large Language Models?",
      coachTip: "Discuss response_schema constraints, temperature tuning, Zod validation, and few-shot calibration.",
      sampleIdealAnswer: "Use constrained decoding / response_schema in Gemini, strict Zod schema validation, few-shot examples, and retry logic."
    },
    {
      id: "ai-3",
      category: "behavioral",
      question: "Describe how you communicated a complex AI model limitation or failure rate to non-technical stakeholders.",
      coachTip: "Translate technical precision/recall metrics into tangible business risk and dollar cost.",
      sampleIdealAnswer: "Framed metrics in business impact (false positive cost vs false negative loss) using interactive confusion matrix visualizations."
    }
  ],
  "Mechanical Design Engineer": [
    {
      id: "mech-1",
      category: "technical",
      question: "How do you determine GD&T datum references and tolerance stacks in high-precision assemblies?",
      coachTip: "Explain functional mating datums (primary, secondary, tertiary) and RSS statistical tolerance stack-up analysis.",
      sampleIdealAnswer: "Establish datums based on functional mating interfaces (primary, secondary, tertiary). Perform worst-case and RSS (Root Sum Squares) statistical tolerance stack-up analysis to guarantee clearance."
    },
    {
      id: "mech-2",
      category: "technical",
      question: "Explain how you set up a Finite Element Analysis (FEA) mesh and boundary conditions to avoid artificial stress singularities.",
      coachTip: "Discuss mapped quad/hex elements, realistic constraint fixtures, and mesh convergence studies.",
      sampleIdealAnswer: "Apply realistic constraint fixtures (avoid zero-displacement point constraints), refine mesh at fillets and stress raisers using mapped quad/hex elements, and run mesh convergence studies."
    }
  ]
};

/**
 * Get questions by role with fuzzy fallback
 */
export const getQuestionsForRole = (role = 'Full Stack Engineer', count = 3) => {
  const norm = (role || '').toLowerCase();
  let selected = INTERVIEW_QUESTION_BANK["Full Stack Engineer"];

  if (norm.includes('front') || norm.includes('react') || norm.includes('web')) {
    selected = INTERVIEW_QUESTION_BANK["Frontend Engineer"];
  } else if (norm.includes('back') || norm.includes('node') || norm.includes('python')) {
    selected = INTERVIEW_QUESTION_BANK["Backend Engineer"];
  } else if (norm.includes('ai') || norm.includes('ml') || norm.includes('machine') || norm.includes('data')) {
    selected = INTERVIEW_QUESTION_BANK["AI & Machine Learning Engineer"];
  } else if (norm.includes('mech') || norm.includes('cad') || norm.includes('fea')) {
    selected = INTERVIEW_QUESTION_BANK["Mechanical Design Engineer"];
  }

  return selected.slice(0, count);
};

/**
 * Client-Side Heuristic & Evaluation Generator for Offline/Mobile Resilience
 * Calibrated against the official 4-category project rubric:
 * - Technical Accuracy: 30 pts
 * - Communication Clarity: 25 pts
 * - Problem Solving & Logic: 25 pts
 * - Delivery & Confidence: 20 pts (Estimated)
 * Filler Penalty = min(15, count * 1.5)
 * Final Score = max(0, Raw - Penalty)
 */
export const evaluateAnswerOffline = ({
  transcript = '',
  durationSeconds = 60,
  fillerWordCount = 0,
  videoMetrics = {},
  question = null
}) => {
  const cleanTranscript = (transcript || '').trim();
  const words = cleanTranscript.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Multi-word and single-word filler detection
  const fillerPatterns = [
    { phrase: 'you know', re: /\byou\s+know\b/gi },
    { phrase: 'i mean', re: /\bi\s+mean\b/gi },
    { phrase: 'sort of', re: /\bsort\s+of\b/gi },
    { phrase: 'kind of', re: /\bkind\s+of\b/gi },
    { phrase: 'um', re: /\bum+\b/gi },
    { phrase: 'uh', re: /\buh+\b/gi },
    { phrase: 'er', re: /\ber+\b/gi },
    { phrase: 'ah', re: /\bah+\b/gi },
    { phrase: 'basically', re: /\bbasically\b/gi },
    { phrase: 'actually', re: /(?:^|[,\.\?!]\s*)\bactually\b(?:\s*[,\.\?!])/gi }
  ];

  let detectedFillers = 0;
  const fillerBreakdown = {};

  fillerPatterns.forEach(({ phrase, re }) => {
    const matches = cleanTranscript.match(re);
    if (matches) {
      detectedFillers += matches.length;
      fillerBreakdown[phrase] = (fillerBreakdown[phrase] || 0) + matches.length;
    }
  });

  // Contextual check for filler "like"
  const likeMatches = cleanTranscript.match(/(?:^|[,\.\?!]\s*|\b(?:and|so|well)\s+)\blike\b/gi);
  if (likeMatches) {
    detectedFillers += likeMatches.length;
    fillerBreakdown['like'] = (fillerBreakdown['like'] || 0) + likeMatches.length;
  }

  const effectiveFillerCount = Math.max(fillerWordCount, detectedFillers);
  const fillerPenalty = Math.min(15, Number((effectiveFillerCount * 1.5).toFixed(1)));

  // Speech Analytics
  const minutes = Math.max(0.2, (durationSeconds || 60) / 60);
  const wordsPerMinute = Math.round(wordCount / minutes);
  const fillerPercentage = wordCount > 0 ? Number(((effectiveFillerCount / wordCount) * 100).toFixed(1)) : 0;

  let paceStatus = 'Optimal';
  if (wordsPerMinute < 100) paceStatus = 'Slow';
  else if (wordsPerMinute < 120) paceStatus = 'Deliberate';
  else if (wordsPerMinute > 180) paceStatus = 'Very Fast';
  else if (wordsPerMinute > 160) paceStatus = 'Brisk';

  const isOffTopic = wordCount > 10 && !/(system|code|react|node|api|server|database|cache|latency|scale|component|function|data|trade)/i.test(cleanTranscript);
  const isVeryShort = wordCount < 10;
  const hasStarWords = /(situation|task|action|result|impact|reduced|increased|led)/i.test(cleanTranscript);
  const hasArchTerms = /(architecture|concurrency|async|cache|redis|index|database|throughput|p99)/i.test(cleanTranscript);

  // 1. Technical Accuracy (0-30)
  let techScore = 18;
  if (isOffTopic) techScore = 0;
  else if (isVeryShort) techScore = wordCount > 4 ? 6 : 2;
  else {
    if (wordCount >= 45 && hasArchTerms) techScore = 27;
    else if (wordCount >= 25) techScore = 22;
  }

  // 2. Communication Clarity (0-25)
  let commScore = 17;
  if (isOffTopic) commScore = 7;
  else if (isVeryShort) commScore = 5;
  else {
    if (wordCount >= 30 && wordCount <= 120) commScore = 22;
    if (effectiveFillerCount > 5) commScore = Math.max(8, commScore - 4);
  }

  // 3. Problem Solving & Logic (0-25)
  let problemScore = 16;
  if (isOffTopic) problemScore = 2;
  else if (isVeryShort) problemScore = 4;
  else {
    if (hasStarWords) problemScore += 5;
    if (hasArchTerms) problemScore += 3;
    problemScore = Math.min(25, problemScore);
  }

  // 4. Delivery & Vocal Confidence (0-20, Estimated)
  let deliveryScore = 14;
  if (wordsPerMinute >= 120 && wordsPerMinute <= 160) deliveryScore += 4;
  else if (wordsPerMinute >= 100 && wordsPerMinute <= 180) deliveryScore += 2;
  if (videoMetrics?.eyeContactScore > 80) deliveryScore += 2;
  deliveryScore = Math.min(20, deliveryScore);

  // DETERMINISTIC ARITHMETIC
  const rawScore = techScore + commScore + problemScore + deliveryScore;
  const finalScore = Math.max(0, Math.round(rawScore - fillerPenalty));

  return {
    overallScore: finalScore,
    finalScore,
    rawScore,
    fillerPenalty,

    rubric: {
      technicalAccuracy: {
        score: techScore,
        maxScore: 30,
        explanation: `Technical concept coverage and accuracy (${techScore}/30).`,
        strengths: techScore >= 20 ? ['Good conceptual grounding in system design.'] : ['Attempted to address key topics.'],
        weaknesses: techScore < 20 ? ['Lacks depth on concrete architectural mechanisms and edge cases.'] : [],
        improvement: 'Proactively discuss trade-offs and underlying runtime mechanics.'
      },
      communicationClarity: {
        score: commScore,
        maxScore: 25,
        explanation: `Clarity and conciseness evaluation (${commScore}/25).`,
        strengths: commScore >= 18 ? ['Clear structure and smooth progression of points.'] : ['Understandable general phrasing.'],
        weaknesses: effectiveFillerCount > 4 ? [`Contains ${effectiveFillerCount} filler word hesitations.`] : [],
        improvement: 'Use deliberate pauses instead of verbal fillers.'
      },
      problemSolving: {
        score: problemScore,
        maxScore: 25,
        explanation: `Analytical breakdown and logical justification (${problemScore}/25).`,
        strengths: problemScore >= 18 ? ['Structured logical reasoning.'] : ['Attempted problem breakdown.'],
        weaknesses: problemScore < 18 ? ['Did not fully explore edge cases or failover strategies.'] : [],
        improvement: 'Apply the STAR method to clearly tie engineering choices to measurable outcomes.'
      },
      deliveryConfidence: {
        score: deliveryScore,
        maxScore: 20,
        label: 'Estimated (Speech Pacing & Articulation)',
        isEstimated: true,
        disclaimer: 'Delivery confidence is estimated from textual transcript fluency and pace telemetry, not direct voice acoustic analysis.',
        explanation: `Estimated delivery confidence from speaking pace (${wordsPerMinute} WPM) and composure.`,
        strengths: ['Maintained consistent delivery pacing.'],
        weaknesses: paceStatus !== 'Optimal' ? [`Speaking speed was ${paceStatus.toLowerCase()} (${wordsPerMinute} WPM).`] : [],
        improvement: 'Aim for a steady 120–160 WPM cadence.'
      }
    },

    // Legacy normalized fields
    technical: Math.round((techScore / 30) * 100),
    communication: Math.round((commScore / 25) * 100),
    problemSolving: Math.round((problemScore / 25) * 100),
    confidence: Math.round((deliveryScore / 20) * 100),
    nonVerbalScore: videoMetrics?.eyeContactScore || 85,

    // Feedback
    feedback: {
      whatAnsweredCorrectly: isOffTopic ? 'Spoke clearly, but off-topic.' : 'Addressed the general interview prompt.',
      whatWasIncorrect: isOffTopic ? 'Response did not solve or relate to the interview question.' : 'No severe misconceptions identified.',
      missingPoints: isOffTopic ? ['Direct answer to the technical question'] : ['Specific latency benchmarks and SLA numbers', 'Edge-case recovery procedures'],
      addressedQuestion: isOffTopic ? 'No' : (isVeryShort ? 'Partially' : 'Yes'),
      addressedQuestionExplanation: isOffTopic ? 'Response deviated completely from the engineering problem.' : '',
      improvementAdvice: [
        'Frame your response using the STAR method: Situation, Task, Action, and Quantified Result.',
        'Explicitly state alternative solutions and why they were rejected.'
      ],
      idealExampleAnswer: 'An exemplary response articulates system constraints, details the selected architecture, justifies trade-offs against alternatives, and validates performance with concrete SLA metrics.'
    },

    fillerAnalysis: {
      totalFillerCount: effectiveFillerCount,
      fillerPenalty,
      fillerBreakdown
    },
    speechAnalytics: {
      totalWords: wordCount,
      durationSeconds,
      wordsPerMinute,
      fillerPercentage,
      paceStatus
    },

    strengths: [
      wordCount >= 40 ? 'Articulated core architectural concepts with solid depth.' : 'Addressed the question promptly.',
      'Maintained steady professional composure and clear delivery tone.',
      videoMetrics.facePresent ? 'Consistent camera alignment and eye-contact.' : 'Structured answer clearly.'
    ],
    weaknesses: [
      wordCount < 40 ? 'Response could be elaborated with deeper metrics and concrete system scale examples.' : null,
      effectiveFillerCount > 4 ? `Contains ${effectiveFillerCount} filler utterances (${Object.keys(fillerBreakdown).join(', ')}).` : null
    ].filter(Boolean),
    improvements: [
      'Structure architectural trade-offs using specific P99 latency, SLA targets, and error rates.',
      'Explicitly state the business context and end impact using the STAR method.'
    ],
    starAnalysis: {
      situation: 'Context and engineering scope were introduced clearly.',
      task: 'Defined the core problem requirements and constraints well.',
      action: 'Solid breakdown of technologies, architectural components, and trade-offs.',
      result: 'Quantify end-user impact with specific performance percentiles and business metrics.'
    }
  };
};
