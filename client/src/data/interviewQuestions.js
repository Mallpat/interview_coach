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
 */
export const evaluateAnswerOffline = ({
  transcript = '',
  durationSeconds = 60,
  fillerWordCount = 0,
  videoMetrics = {},
  question = null
}) => {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  // Base scores
  let technicalScore = 78;
  let communicationScore = 80;
  let nonVerbalScore = videoMetrics.facePresent ? (videoMetrics.eyeContactScore || 85) : 80;
  let confidenceScore = 82;

  // Adjust for answer completeness
  if (wordCount >= 60) {
    technicalScore = Math.min(96, technicalScore + 12);
    communicationScore = Math.min(95, communicationScore + 10);
    confidenceScore = Math.min(94, confidenceScore + 8);
  } else if (wordCount >= 30) {
    technicalScore += 6;
    communicationScore += 5;
  } else if (wordCount < 15) {
    technicalScore = Math.max(60, technicalScore - 15);
    communicationScore = Math.max(65, communicationScore - 10);
  }

  // Deduct for excessive filler words
  if (fillerWordCount > 5) {
    communicationScore = Math.max(65, communicationScore - Math.min(15, fillerWordCount * 2));
    confidenceScore = Math.max(65, confidenceScore - 6);
  }

  const overallScore = Math.round(
    technicalScore * 0.4 + 
    communicationScore * 0.3 + 
    nonVerbalScore * 0.15 + 
    confidenceScore * 0.15
  );

  return {
    overallScore,
    technical: technicalScore,
    communication: communicationScore,
    nonVerbalScore,
    confidence: confidenceScore,
    strengths: [
      wordCount >= 40 ? 'Articulated core architectural concepts with solid depth.' : 'Addressed the question promptly.',
      'Maintained steady professional composure and clear delivery tone.',
      videoMetrics.facePresent ? 'Consistent camera alignment and eye-contact.' : 'Structured answer clearly.'
    ],
    weaknesses: [
      wordCount < 40 ? 'Response could be elaborated with deeper metrics and concrete system scale examples.' : null,
      fillerWordCount > 4 ? `Contains ${fillerWordCount} filler utterances (um, like, basically).` : null
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
