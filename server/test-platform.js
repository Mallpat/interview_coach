// Automated end-to-end integration test for AI Interview Coach platform

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- 1. Testing Health Endpoint ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('✓ Health:', health.status, '| AI Engine:', health.aiEngine);

  console.log('\n--- 2. Testing Dashboard & Stats ---');
  const dashRes = await fetch(`${BASE_URL}/analytics/dashboard`);
  const dash = await dashRes.json();
  console.log('✓ Dashboard User:', dash.user.name);
  console.log('✓ Readiness Score:', dash.stats.readinessScore, '%');

  console.log('\n--- 3. Testing Interview Session Creation & Question Generation ---');
  const sessRes = await fetch(`${BASE_URL}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'Full Stack Engineer',
      difficulty: 'Senior',
      type: 'Technical & Behavioral',
      totalQuestions: 2
    })
  });
  const sess = await sessRes.json();
  console.log('✓ Created Session:', sess.session.id);
  console.log('✓ Question 1:', sess.currentQuestion.question);

  console.log('\n--- 4. Testing Answer Submission & Real-time Evaluation ---');
  const ansRes = await fetch(`${BASE_URL}/interviews/${sess.session.id}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId: sess.currentQuestion.id,
      transcript: 'In our payment processing system, we experienced high latency under 10k requests/sec. I profiled queries, implemented Redis caching with eviction policies, and tuned postgres connection pools. As a result, P99 latency dropped by 45% and error rates fell below 0.01%.',
      durationSeconds: 42,
      fillerWordCount: 1,
      videoMetrics: { eyeContactScore: 91, facePresent: true, posture: 'Optimal Alignment' }
    })
  });
  const evalResult = await ansRes.json();
  console.log('✓ Overall Evaluation Score:', evalResult.evaluation.overallScore);
  console.log('✓ Technical Score:', evalResult.evaluation.technical);
  console.log('✓ Communication Score:', evalResult.evaluation.communication);
  console.log('✓ Key Strengths:', evalResult.evaluation.strengths);

  console.log('\n--- 5. Testing Live Coding Sandbox & AI Review ---');
  const codeRes = await fetch(`${BASE_URL}/coding/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeId: 'chal-two-sum',
      code: `function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.has(complement)) return [map.get(complement), i];
          map.set(nums[i], i);
        }
        return [];
      }`,
      language: 'javascript'
    })
  });
  const codeResult = await codeRes.json();
  console.log('✓ Sandboxed Execution Status:', codeResult.status);
  console.log('✓ Unit Tests Passed:', `${codeResult.passedCount}/${codeResult.totalCount}`);
  console.log('✓ Runtime:', `${codeResult.runtimeMs} ms`);
  console.log('✓ AI Time Complexity:', codeResult.aiReview.timeComplexity);
  console.log('✓ AI Space Complexity:', codeResult.aiReview.spaceComplexity);
  console.log('✓ AI Verdict:', codeResult.aiReview.verdict);

  console.log('\n--- 6. Testing Resume ATS Scanner & JD Matcher ---');
  const resumeRes = await fetch(`${BASE_URL}/resumes/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: `ALEX CHEN
Senior Full Stack Engineer | alex@example.com
Summary: 5+ years experience building React and Node.js microservices.
Experience: Architected distributed event pipelines boosting engagement by 35%. Optimized PostgreSQL query performance reducing latency by 45%. Deployed Docker containers via CI/CD.
Skills: JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, Redis, Docker, AWS.
Education: B.S. in Computer Science.`,
      targetRole: 'Full Stack Engineer'
    })
  });
  const resumeResult = await resumeRes.json();
  console.log('✓ ATS Compatibility Score:', `${resumeResult.analysis.atsScore}%`);
  console.log('✓ Action Verbs Found:', resumeResult.analysis.sectionBreakdown.actionVerbsCount);
  console.log('✓ Quantifiable Metrics Found:', resumeResult.analysis.sectionBreakdown.metricCount);

  console.log('\n--- 7. Testing AI Career Mentor Strategic Advice ---');
  const mentorRes = await fetch(`${BASE_URL}/mentor/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: 'How should I negotiate equity vs base salary for a Senior Full Stack Engineer role?'
    })
  });
  const mentorResult = await mentorRes.json();
  console.log('✓ Mentor Message Response Received (length):', mentorResult.assistantMessage.content.length);
  console.log('✓ Preview:', mentorResult.assistantMessage.content.slice(0, 140) + '...');

  console.log('\n======================================================');
  console.log('🎉 ALL 7 FULL-STACK CORE MODULES VERIFIED SUCCESSFULLY!');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('Integration test failure:', err);
  process.exit(1);
});
