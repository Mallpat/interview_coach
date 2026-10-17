// Curated question bank for AI Interview Coach across Engineering Branches

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
  "AI & ML Engineer": [
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
  ],
  "Mechanical Design Engineer": [
    {
      category: "technical",
      question: "How do you determine GD&T (Geometric Dimensioning and Tolerancing) datum references and tolerance stacks in high-precision assemblies?",
      sampleIdealAnswer: "Establish datums based on functional mating interfaces (primary, secondary, tertiary). Perform worst-case and RSS (Root Sum Squares) statistical tolerance stack-up analysis to guarantee clearance and avoid binding."
    },
    {
      category: "technical",
      question: "Explain how you set up a Finite Element Analysis (FEA) mesh and boundary conditions to avoid artificial stress singularities.",
      sampleIdealAnswer: "Apply realistic constraint fixtures (avoid zero-displacement point constraints), refine mesh at fillets and stress raisers using mapped quad/hex elements, and run mesh convergence studies until peak stress stabilizes within 5%."
    },
    {
      category: "architecture",
      question: "Walk me through how you design a mechanical product for high-volume injection molding, considering draft angles, parting lines, and sink marks.",
      sampleIdealAnswer: "Maintain uniform nominal wall thickness (2-3mm), add 1-2 degree draft angles for mold release, place ribs at 50-60% of adjacent wall thickness to eliminate sink marks, and locate parting lines on non-aesthetic boundary edges."
    },
    {
      category: "behavioral",
      question: "Tell me about a physical prototype that failed during stress or thermal testing. How did you diagnose the failure mechanism?",
      sampleIdealAnswer: "Situation: Aluminum bracket fractured at 70% rated load during cyclic fatigue testing. Action: Conducted fractography, identified sharp notch radius acting as stress concentration, added 3mm fillet radius and altered grain orientation. Result: Prototype exceeded 1.5x design life requirement."
    }
  ],
  "Embedded Systems & Firmware Engineer": [
    {
      category: "technical",
      question: "How do you manage task priority inversion and race conditions between interrupts (ISRs) and FreeRTOS tasks?",
      sampleIdealAnswer: "Use priority inheritance mutexes for shared resources rather than plain binary semaphores. Keep ISRs minimal: defer heavy processing to tasks using queues or task notifications from ISR (`xQueueSendFromISR`)."
    },
    {
      category: "technical",
      question: "Explain the electrical and protocol differences between I2C, SPI, and UART, and how you choose between them for sensor integration.",
      sampleIdealAnswer: "I2C uses 2 open-drain lines with pull-ups for multi-device bus addressing (up to 3.4MHz). SPI uses 4 push-pull lines for full-duplex high speed (>20MHz). UART is asynchronous point-to-point without a shared clock."
    },
    {
      category: "architecture",
      question: "How would you design a failsafe Over-The-Air (OTA) firmware update architecture for an IoT microcontroller with limited flash memory?",
      sampleIdealAnswer: "Use dual-bank flash partitioning (Active Slot A, Staging Slot B, and a golden bootloader). Stream cryptographically signed images into Slot B, verify SHA-256 hash, mark boot flag, and automatically rollback if the watchdog triggers upon initial boot."
    },
    {
      category: "behavioral",
      question: "Describe a hard-to-reproduce hardware-software bug you tracked down using an oscilloscope or logic analyzer.",
      sampleIdealAnswer: "Situation: Microcontroller randomly reset under motor start load. Action: Attached oscilloscope to 3.3V rail and reset pin, discovered 800mV transient voltage dip due to insufficient decoupling capacitance near motor drivers. Result: Added 10uF ceramic capacitor, eliminating all resets."
    }
  ],
  "Cloud & DevOps Engineer": [
    {
      category: "technical",
      question: "Explain Kubernetes pod lifecycle, readiness vs liveness probes, and what happens when an OOMKilled error occurs.",
      sampleIdealAnswer: "Liveness probes trigger container restart on deadlock; readiness probes control whether traffic routes to the pod. OOMKilled occurs when container memory exceeds its cgroup hard limit; kernel sends SIGKILL (exit code 137)."
    },
    {
      category: "technical",
      question: "How do you manage zero-downtime database schema migrations in a Kubernetes GitOps deployment pipeline?",
      sampleIdealAnswer: "Follow expand-and-contract pattern: Add new nullable columns first, deploy backend supporting both schemas, backfill data, switch writes to new column, then deprecate old column in subsequent deployment."
    },
    {
      category: "architecture",
      question: "Design a multi-region disaster recovery architecture with an RTO < 15 minutes and RPO < 1 minute.",
      sampleIdealAnswer: "Active-passive or active-active cloud regions with Aurora Global Database (sub-second cross-region replication), S3 Cross-Region Replication, Route53 latency-based DNS routing with health checks, and Terraform infrastructure replication."
    },
    {
      category: "behavioral",
      question: "Describe your root-cause analysis process after a high-severity production outage.",
      sampleIdealAnswer: "Follow blameless post-mortem framework: Construct minute-by-minute timeline, identify underlying technical and procedural triggers via 5 Whys, and track actionable preventative tasks in JIRA with assigned owners."
    }
  ],
  "Structural Design Engineer": [
    {
      category: "technical",
      question: "How do you model and distribute lateral seismic forces across shear walls and moment-resisting frames in ETABS?",
      sampleIdealAnswer: "Assign rigid or semi-rigid diaphragms to floor slabs, define response spectrum or equivalent lateral force (ELF) per building codes, verify center of mass and rigidity eccentricity, and check torsional irregularity ratios."
    },
    {
      category: "technical",
      question: "Explain the limit state method of design for reinforced concrete beams under combined bending and shear.",
      sampleIdealAnswer: "Verify ultimate limit state (ULS) for moment capacity using stress block parameters, size vertical stirrups for shear resistance exceeding concrete shear strength, and verify serviceability limit state (SLS) for crack width and deflection."
    },
    {
      category: "behavioral",
      question: "Tell me about a time you encountered unexpected subsurface soil conditions during site foundation excavation.",
      sampleIdealAnswer: "Excavation revealed soft cohesive clay layer not captured in preliminary boreholes. Re-evaluated bearing capacity with geotechnical engineer, redesigned shallow isolated footings into combined raft foundation with micro-piles, preventing differential settlement."
    }
  ],
  "Robotics & Autonomous Systems Engineer": [
    {
      category: "technical",
      question: "Explain the difference between forward and inverse kinematics, and how you resolve singularities in robotic manipulator control.",
      sampleIdealAnswer: "Forward kinematics computes end-effector pose from joint angles (analytical). Inverse kinematics computes joint angles for a target pose (often non-linear/multiple solutions). At kinematic singularities where the Jacobian loses rank, use damped least-squares (Levenberg-Marquardt) to prevent infinite joint velocity commands."
    },
    {
      category: "technical",
      question: "How does an Extended Kalman Filter (EKF) fuse wheel odometry, IMU angular velocity, and LiDAR scan matching for mobile robot state estimation?",
      sampleIdealAnswer: "Prediction step propagates robot pose using kinematic wheel odometry and IMU integration with process noise covariance. Update step compares predicted sensor observations against high-frequency LiDAR scan matching, weighting corrections by the Kalman gain based on measurement noise."
    },
    {
      category: "behavioral",
      question: "Describe how you tuned a mobile robot motion planning stack to safely navigate around unpredictable human pedestrians.",
      sampleIdealAnswer: "Implemented costmap inflation layers with dynamic social navigation zones in ROS 2 Nav2, integrated 2D LiDAR clustering for velocity prediction, and switched from DWA to TEB local planner for smooth obstacle avoidance."
    }
  ]
};
