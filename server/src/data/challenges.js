// Pre-populated coding challenges for the AI Interview Coach platform across Engineering Branches

export const CODING_CHALLENGES = [
  {
    id: "chal-vector-cosine-similarity",
    slug: "vector-cosine-similarity",
    title: "Vector Cosine Similarity & Dot Product",
    difficulty: "Medium",
    branch: "AI & ML",
    category: "Linear Algebra & Machine Learning",
    prompt: `### Problem Description
In Machine Learning and Large Language Models, **Cosine Similarity** measures the angular similarity between two non-zero vectors in an inner product space.
It is widely used in **Retrieval-Augmented Generation (RAG)**, semantic document search, and embedding re-ranking.

Formula:
\`\`\`
cosine_similarity(a, b) = (a · b) / (||a|| * ||b||)
\`\`\`
Where:
- \`a · b\` is the dot product: \`sum(a[i] * b[i])\`
- \`||a||\` is the Euclidean norm: \`sqrt(sum(a[i]^2))\`

Return the result rounded to **4 decimal places**. If either vector has zero magnitude (\`||v|| == 0\`) or if lengths mismatch, return \`0\`.

#### Example 1:
\`\`\`
Input: a = [1, 2, 3], b = [1, 2, 3]
Output: 1
Explanation: Identical directional vectors have cosine similarity of 1.0.
\`\`\`

#### Example 2:
\`\`\`
Input: a = [1, 0], b = [0, 1]
Output: 0
Explanation: Orthogonal vectors have cosine similarity of 0.
\`\`\`
`,
    starterCode: `function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Number(similarity.toFixed(4));
}`,
    testData: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 1 },
      { input: [[1, 0], [0, 1]], expected: 0 },
      { input: [[3, 4], [4, 3]], expected: 0.96 },
      { input: [[0, 0], [1, 2]], expected: 0 }
    ]
  },
  {
    id: "chal-mse-loss",
    slug: "mse-loss-calculation",
    title: "Mean Squared Error (MSE) Loss Calculator",
    difficulty: "Easy",
    branch: "AI & ML",
    category: "Model Evaluation & Loss Functions",
    prompt: `### Problem Description
Compute the **Mean Squared Error (MSE)** loss between an array of model continuous predictions \`y_pred\` and ground truth labels \`y_true\`.

Formula:
\`\`\`
MSE = (1 / n) * sum((y_pred[i] - y_true[i])^2)
\`\`\`

Return the result rounded to **4 decimal places**. Return \`0\` if arrays are empty.

#### Example 1:
\`\`\`
Input: y_pred = [2.5, 0.0, 2.0, 8.0], y_true = [3.0, -0.5, 2.0, 7.0]
Output: 0.375
\`\`\`
`,
    starterCode: `function calculateMSE(y_pred, y_true) {
  if (!y_pred || !y_true || y_pred.length === 0 || y_pred.length !== y_true.length) return 0;
  
  let sumSquaredError = 0;
  for (let i = 0; i < y_pred.length; i++) {
    const diff = y_pred[i] - y_true[i];
    sumSquaredError += diff * diff;
  }
  
  const mse = sumSquaredError / y_pred.length;
  return Number(mse.toFixed(4));
}`,
    testData: [
      { input: [[2.5, 0.0, 2.0, 8.0], [3.0, -0.5, 2.0, 7.0]], expected: 0.375 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0 },
      { input: [[10], [5]], expected: 25 }
    ]
  },
  {
    id: "chal-cad-polygon-area",
    slug: "cad-polygon-area",
    title: "2D CAD Polygon Area (Shoelace Formula)",
    difficulty: "Medium",
    branch: "Mechanical",
    category: "Computational Geometry & CAD",
    prompt: `### Problem Description
In CAD/CAM and mechanical design, determining the cross-sectional area of an extruded or machined part is essential for mass and stress calculations.

Using the **Shoelace Formula (Gauss's area formula)**, calculate the area of an ordered non-self-intersecting 2D polygon given an array of vertex coordinates \`vertices = [[x0, y0], [x1, y1], ... [xn-1, yn-1]]\`.

Formula:
\`\`\`
Area = 0.5 * |sum(x_i * y_{i+1} - x_{i+1} * y_i)| for i = 0 to n-1 (wrapping around to 0)
\`\`\`

Return the area as a positive number rounded to **2 decimal places**.

#### Example 1:
\`\`\`
Input: vertices = [[0, 0], [4, 0], [4, 3], [0, 3]] (A 4x3 rectangle)
Output: 12
\`\`\`
`,
    starterCode: `function calculatePolygonArea(vertices) {
  if (!vertices || vertices.length < 3) return 0;
  
  let sum1 = 0;
  let sum2 = 0;
  const n = vertices.length;
  
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    sum1 += vertices[i][0] * vertices[next][1];
    sum2 += vertices[next][0] * vertices[i][1];
  }
  
  const area = Math.abs(sum1 - sum2) / 2;
  return Number(area.toFixed(2));
}`,
    testData: [
      { input: [[[0, 0], [4, 0], [4, 3], [0, 3]]], expected: 12 },
      { input: [[[0, 0], [5, 0], [0, 5]]], expected: 12.5 },
      { input: [[[1, 1], [3, 1], [4, 3], [2, 5], [0, 3]]], expected: 10 }
    ]
  },
  {
    id: "chal-bitwise-register",
    slug: "bitwise-register-mask",
    title: "Microcontroller Register Bit Manipulation",
    difficulty: "Easy",
    branch: "Electrical",
    category: "Embedded Systems & Firmware",
    prompt: `### Problem Description
In embedded systems (ARM Cortex / STM32), hardware registers are modified by applying a bitwise mask to clear target bits, and then OR-ing the new bitfield value.

Write a function \`updateRegister(registerValue, bitMask, newValue)\`:
1. Clear the bits specified in \`bitMask\` from \`registerValue\`.
2. Shift or align \`newValue\` within \`bitMask\` (\`newValue & bitMask\`).
3. Return the updated 32-bit unsigned integer.

#### Example:
\`\`\`
Input: registerValue = 240, bitMask = 48, newValue = 16
Output: 208
\`\`\`
`,
    starterCode: `function updateRegister(registerValue, bitMask, newValue) {
  const cleared = registerValue & (~bitMask);
  const updated = cleared | (newValue & bitMask);
  return updated >>> 0;
}`,
    testData: [
      { input: [240, 48, 16], expected: 208 },
      { input: [255, 15, 0], expected: 240 },
      { input: [0, 255, 170], expected: 170 }
    ]
  },
  {
    id: "chal-beam-bending-moment",
    slug: "beam-peak-bending-moment",
    title: "Simply Supported Beam Peak Bending Moment",
    difficulty: "Easy",
    branch: "Civil",
    category: "Structural Mechanics & Beam Analysis",
    prompt: `### Problem Description
In structural engineering, determining the peak bending moment (\`M_max\`) for a simply supported beam under a concentrated point load \`P\` at distance \`a\` from the left support and \`b\` from the right support (total length \`L = a + b\`) is calculated as:

\`\`\`
M_max = (P * a * b) / L
\`\`\`

Return \`M_max\` rounded to **2 decimal places**. If \`a < 0\` or \`a > L\` or \`L <= 0\`, return \`0\`.
`,
    starterCode: `function calculatePeakBendingMoment(L, P, a) {
  if (L <= 0 || a < 0 || a > L || P <= 0) return 0;
  const b = L - a;
  const maxMoment = (P * a * b) / L;
  return Number(maxMoment.toFixed(2));
}`,
    testData: [
      { input: [10, 50, 5], expected: 125 },
      { input: [8, 40, 2], expected: 60 },
      { input: [6, 30, 0], expected: 0 }
    ]
  },
  {
    id: "chal-flatten-array",
    slug: "flatten-nested-array",
    title: "Flatten Multi-Dimensional Nested Array",
    difficulty: "Medium",
    category: "JavaScript & Recursion",
    prompt: `### Problem Description
Given a multi-dimensional array of arbitrary depth containing numbers and nested arrays, return a flattened 1-dimensional array preserving element order.
`,
    starterCode: `function flattenArray(arr) {
  if (!Array.isArray(arr)) return [];
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flattenArray(item));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
    testData: [
      { input: [[1, [2, [3, [4, 5]], 6]]], expected: [1, 2, 3, 4, 5, 6] },
      { input: [[[1, 2], [3, 4]]], expected: [1, 2, 3, 4] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] }
    ]
  },
  {
    id: "chal-merge-intervals",
    slug: "merge-intervals",
    title: "Merge Overlapping Intervals",
    difficulty: "Medium",
    category: "Arrays & Sorting",
    prompt: `### Problem Description
Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals and return an array of the non-overlapping intervals.
`,
    starterCode: `function merge(intervals) {
  if (!intervals || !intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];
    
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}`,
    testData: [
      { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] }
    ]
  },
  {
    id: "chal-two-sum",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hash Table",
    prompt: `### Problem Description
Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.
`,
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    testData: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] }
    ]
  },
  {
    id: "chal-log-latency-p99",
    slug: "log-latency-p99",
    title: "Server Latency Percentile (P99) Analyzer",
    difficulty: "Medium",
    branch: "IT",
    category: "DevOps & Telemetry Analysis",
    prompt: `### Problem Description
Write a function \`calculatePercentile(latencies, percentile)\` to compute nearest-rank percentile latency.
`,
    starterCode: `function calculatePercentile(latencies, percentile) {
  if (!latencies || latencies.length === 0) return 0;
  const sorted = [...latencies].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil((percentile / 100) * sorted.length) - 1);
  return sorted[index];
}`,
    testData: [
      { input: [[12, 15, 120, 14, 18, 200, 16, 17, 19, 21], 90], expected: 120 },
      { input: [[10, 20, 30, 40, 50], 50], expected: 30 }
    ]
  }
];
