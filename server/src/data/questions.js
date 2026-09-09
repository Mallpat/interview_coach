// Curated question bank for AI Interview Coach

export const QUESTION_BANK = {
  "Frontend Engineer": [
    {
      category: "technical",
      question: "Can you explain how React's Virtual DOM reconciliation algorithm works, and what triggers an unnecessary re-render?",
      sampleIdealAnswer: "React uses a heuristic O(n) reconciliation algorithm comparing virtual DOM trees by component type and keys. Unnecessary renders happen when parent state changes pass new object/function references without memoization."
    },
    {
      category: "technical",
      question: "How do you optimize Core Web Vitals (LCP, INP, CLS) in a modern high-traffic web application?",
      sampleIdealAnswer: "For LCP: prioritize hero image preload and reduce server response time. For INP: break up long tasks using scheduler.yield() or requestIdleCallback. For CLS: reserve width/height dimensions for images and ads."
    },
    {
      category: "architecture",
      question: "Walk me through how you would architect a micro-frontend architecture or a shared design system across multiple teams.",
      sampleIdealAnswer: "I would use Module Federation or npm package distribution with strict semantic versioning, automated visual regression testing, and token-based design systems."
    },
    {
      category: "behavioral",
      question: "Tell me about a time you had a technical disagreement with a backend engineer regarding API payload design. How did you resolve it?",
      sampleIdealAnswer: "Using the STAR method: In our previous project, the backend proposed nested heavy payloads while frontend required low latency mobile responses. I benchmarked payloads, suggested GraphQL/BFF pattern, and aligned on a clean REST contract."
    }
  ],
  "Backend Engineer": [
    {
      category: "technical",
      question: "How does the Node.js event loop handle I/O-bound operations versus CPU-intensive tasks, and how would you prevent thread starvation?",
      sampleIdealAnswer: "Node.js relies on libuv with an event loop and thread pool for async I/O. CPU-intensive operations block the event loop, so they should be offloaded to worker_threads or dedicated worker processes."
    },
    {
      category: "technical",
      question: "Explain the trade-offs between ACID transactions in PostgreSQL and eventual consistency in distributed NoSQL databases.",
      sampleIdealAnswer: "Postgres guarantees strong consistency and isolation at the cost of horizontal scaling complexity and write contention. NoSQL prioritizes partition tolerance and high write throughput under the CAP theorem."
    },
    {
      category: "architecture",
      question: "How would you design an idempotent payment processing API to prevent duplicate transactions during network timeouts?",
      sampleIdealAnswer: "Client generates a unique idempotency key. The backend checks Redis/DB with atomic locks; if processed, returns cached response; if in-flight, returns 409 Conflict."
    },
    {
      category: "behavioral",
      question: "Describe a critical production outage or database lock you investigated under pressure. What was your triage process?",
      sampleIdealAnswer: "Situation: DB connection pool exhaustion. Task: Restore service in <10 mins. Action: Checked pg_stat_activity, identified unindexed table scans, killed deadlocks, deployed pool scaler. Result: P99 latency dropped by 80%."
    }
  ],
  "Full Stack Engineer": [
    {
      category: "technical",
      question: "How do you handle real-time bi-directional synchronization between React clients and an Express backend under high concurrency?",
      sampleIdealAnswer: "Use WebSockets/Socket.IO backed by Redis Pub/Sub adapter to allow horizontal scaling across multiple Node server instances."
    },
    {
      category: "technical",
      question: "What security measures do you implement across the full stack against XSS, CSRF, and SQL Injection attacks?",
      sampleIdealAnswer: "CSP headers, sanitized inputs, parameterized queries/Prisma ORM, HttpOnly SameSite cookies, and helmet middleware."
    },
    {
      category: "architecture",
      question: "Design an end-to-end file processing pipeline that accepts 100MB video uploads and converts them into various streaming resolutions.",
      sampleIdealAnswer: "Presigned S3 upload URL -> S3 Event trigger -> BullMQ/SQS worker fleet running ffmpeg -> output HLS chunks -> CloudFront CDN."
    },
    {
      category: "behavioral",
      question: "Give an example of when you had to balance technical debt against a tight product deadline.",
      sampleIdealAnswer: "Delivered MVP with clear modular interfaces, logged technical debt tickets with estimated complexity, and negotiated a dedicated refactoring sprint right after launch."
    }
  ],
  "AI / ML Engineer": [
    {
      category: "technical",
      question: "Explain Retrieval-Augmented Generation (RAG) architecture: chunking strategies, vector embeddings, and re-ranking.",
      sampleIdealAnswer: "Documents are split semantically, embedded using embedding models into vector DB (e.g. pgvector), retrieved via cosine similarity, then re-ranked with a cross-encoder before prompt augmentation."
    },
    {
      category: "technical",
      question: "How do you mitigate hallucinations and validate structured JSON outputs from Large Language Models?",
      sampleIdealAnswer: "Use constrained decoding / response_schema in Gemini, strict Zod schema validation, few-shot examples, and retry logic."
    },
    {
      category: "behavioral",
      question: "Describe how you communicated a complex AI model limitation or failure rate to non-technical stakeholders.",
      sampleIdealAnswer: "Framed metrics in business impact (false positive cost vs false negative loss) using interactive confusion matrix visualizations."
    }
  ]
};
