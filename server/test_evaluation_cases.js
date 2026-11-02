import { evaluateAnswer } from './src/services/aiService.js';
import { analyzeFillersAndSpeech } from './src/utils/fillerDetector.js';

const runTests = async () => {
  console.log('=====================================================');
  console.log('🎯 RUNNING 9-CASE AI INTERVIEW EVALUATION TEST SUITE');
  console.log('=====================================================\n');

  let passedTests = 0;
  let totalTests = 9;

  const testQuestion = 'How do you design a high-throughput caching layer for a distributed web application, and how do you handle cache invalidation?';

  // 1. Technically Correct Answer
  console.log('--- TEST 1: Technically Correct Answer ---');
  const res1 = await evaluateAnswer({
    question: testQuestion,
    transcript: 'To design a high-throughput distributed caching layer, I would deploy a Redis cluster behind a consistent hashing ring. We implement cache-aside pattern where reads hit Redis first with sub-millisecond P99 latency. For cache invalidation, we use write-through with event-driven message queues like Kafka to broadcast cache eviction events to all replica nodes, preventing stale reads. To avoid the thundering herd problem during key expiration, we use probabilistic early expiration and distributed mutex locks via Redlock.',
    role: 'Staff Backend Engineer',
    difficulty: 'Senior',
    durationSeconds: 45
  });
  console.log(`Scores: Final=${res1.finalScore}, Raw=${res1.rawScore}, Penalty=${res1.fillerPenalty}`);
  console.log(`Rubric: Tech=${res1.rubric.technicalAccuracy.score}/30, Comm=${res1.rubric.communicationClarity.score}/25, Prob=${res1.rubric.problemSolving.score}/25, Del=${res1.rubric.deliveryConfidence.score}/20`);
  console.log(`Addressed: ${res1.feedback.addressedQuestion}`);
  if (res1.finalScore >= 80 && res1.rubric.technicalAccuracy.score >= 22 && res1.fillerPenalty === 0) {
    console.log('✅ TEST 1 PASSED: High technical score and zero filler penalty verified.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 1 FAILED');
  }

  // 2. Technically Incorrect Answer
  console.log('--- TEST 2: Technically Incorrect Answer ---');
  const res2 = await evaluateAnswer({
    question: testQuestion,
    transcript: 'To handle caching, you should never use indexes because they slow down memory, and we should always store passwords in plain text inside Redis. Redis is basically an operating system so we just run eval scripts without memory limits and let it write directly to disk on every single byte.',
    role: 'Staff Backend Engineer',
    difficulty: 'Senior',
    durationSeconds: 30
  });
  console.log(`Scores: Final=${res2.finalScore}, Raw=${res2.rawScore}, Tech=${res2.rubric.technicalAccuracy.score}/30`);
  console.log(`What was incorrect: ${res2.feedback.whatWasIncorrect}`);
  if (res2.rubric.technicalAccuracy.score <= 12 && res2.feedback.whatWasIncorrect) {
    console.log('✅ TEST 2 PASSED: Low technical accuracy and concrete fallacy detection verified.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 2 FAILED');
  }

  // 3. Incomplete Answer
  console.log('--- TEST 3: Incomplete Answer ---');
  const res3 = await evaluateAnswer({
    question: testQuestion,
    transcript: 'Well, for caching, I would probably use Redis to make it faster, but I have not really dealt with invalidation or high throughput before.',
    role: 'Backend Engineer',
    difficulty: 'Mid-Level',
    durationSeconds: 15
  });
  console.log(`Scores: Final=${res3.finalScore}, Raw=${res3.rawScore}, Tech=${res3.rubric.technicalAccuracy.score}/30`);
  console.log(`Missing points count: ${res3.feedback.missingPoints.length}`);
  if (res3.rubric.technicalAccuracy.score <= 18 && res3.feedback.missingPoints.length > 0) {
    console.log('✅ TEST 3 PASSED: Incomplete answer correctly identified with missing key points.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 3 FAILED');
  }

  // 4. Irrelevant Answer
  console.log('--- TEST 4: Irrelevant Answer ---');
  const res4 = await evaluateAnswer({
    question: testQuestion,
    transcript: 'My favorite recipe is making homemade pizza from scratch. First you need yeast, warm water, and flour. Then let the dough rise for two hours before spreading marinara sauce and fresh mozzarella.',
    role: 'Backend Engineer',
    difficulty: 'Senior',
    durationSeconds: 35
  });
  console.log(`Scores: Final=${res4.finalScore}, Raw=${res4.rawScore}, Tech=${res4.rubric.technicalAccuracy.score}/30, Addressed=${res4.feedback.addressedQuestion}`);
  if (res4.rubric.technicalAccuracy.score === 0 && res4.feedback.addressedQuestion === 'No') {
    console.log('✅ TEST 4 PASSED: Irrelevant answer scored 0 technical and addressedQuestion=No.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 4 FAILED');
  }

  // 5. Repeated Filler Words
  console.log('--- TEST 5: Repeated Filler Words ---');
  const res5 = await evaluateAnswer({
    question: testQuestion,
    transcript: 'Um, so basically, you know, we would, like, use Redis, um, because, like, uh, it is really fast, you know? And, like, basically invalidation is, um, sort of hard.',
    role: 'Backend Engineer',
    difficulty: 'Junior',
    durationSeconds: 25
  });
  console.log(`Fillers detected: ${res5.fillerAnalysis.totalFillerCount}, Penalty: -${res5.fillerPenalty} pts`);
  console.log(`Breakdown:`, res5.fillerAnalysis.fillerBreakdown);
  if (res5.fillerAnalysis.totalFillerCount >= 7 && res5.fillerPenalty > 5) {
    console.log('✅ TEST 5 PASSED: Multi-word and single-word fillers accurately counted with penalty.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 5 FAILED');
  }

  // 6. Very Short Answer
  console.log('--- TEST 6: Very Short Answer ---');
  const res6 = await evaluateAnswer({
    question: testQuestion,
    transcript: 'Use Redis cache.',
    role: 'Backend Engineer',
    difficulty: 'Senior',
    durationSeconds: 5
  });
  console.log(`Scores: Final=${res6.finalScore}, Raw=${res6.rawScore}, Tech=${res6.rubric.technicalAccuracy.score}/30`);
  if (res6.finalScore <= 35 && res6.rubric.technicalAccuracy.score <= 6) {
    console.log('✅ TEST 6 PASSED: Very short answer strictly limited in points.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 6 FAILED');
  }

  // 7. Long, Verbose but Irrelevant Answer
  console.log('--- TEST 7: Long, Verbose but Irrelevant Answer ---');
  const res7 = await evaluateAnswer({
    question: testQuestion,
    transcript: 'Yesterday morning I woke up and walked down the street to the coffee shop because I really wanted a cappuccino and a blueberry muffin. The barista told me that the espresso machine was broken because the water line had low pressure. So instead I had an iced tea and sat outside watching the cars drive down the avenue. The weather was unusually warm for November and many people were jogging with their dogs in the park across the street.',
    role: 'Staff Backend Engineer',
    difficulty: 'Senior',
    durationSeconds: 65
  });
  console.log(`Total words: ${res7.speechAnalytics.totalWords}, Tech=${res7.rubric.technicalAccuracy.score}/30, Comm=${res7.rubric.communicationClarity.score}/25, Final=${res7.finalScore}`);
  if (res7.rubric.technicalAccuracy.score === 0 && res7.finalScore <= 35) {
    console.log('✅ TEST 7 PASSED: Long wordy answer received 0 technical points and low overall score.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 7 FAILED');
  }

  // 8. Zero Filler Words
  console.log('--- TEST 8: Zero Filler Words ---');
  const res8 = await evaluateAnswer({
    question: testQuestion,
    transcript: 'We implement an in-memory distributed cache cluster with write-through replication. We configure Redis sentinel for automated failover and partition cache keys across shards using MurmurHash3.',
    role: 'Backend Engineer',
    difficulty: 'Senior',
    durationSeconds: 20
  });
  console.log(`Fillers: ${res8.fillerAnalysis.totalFillerCount}, Penalty: -${res8.fillerPenalty} pts, Raw=${res8.rawScore}, Final=${res8.finalScore}`);
  if (res8.fillerAnalysis.totalFillerCount === 0 && res8.fillerPenalty === 0 && res8.finalScore === res8.rawScore) {
    console.log('✅ TEST 8 PASSED: Zero fillers yields 0 penalty and Final Score equals Raw Score.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 8 FAILED');
  }

  // 9. Many Filler Words (Testing 15-Point Ceiling)
  console.log('--- TEST 9: Many Filler Words (15-Point Penalty Ceiling) ---');
  const res9 = await evaluateAnswer({
    question: testQuestion,
    transcript: 'Um, uh, basically, like, you know, um, uh, er, ah, like, you know, sort of, kind of, basically, actually, um, uh, like, we would use a cache, you know, like, basically, um, uh.',
    role: 'Backend Engineer',
    difficulty: 'Junior',
    durationSeconds: 40
  });
  console.log(`Total Fillers: ${res9.fillerAnalysis.totalFillerCount}`);
  console.log(`Raw Calculation (count * 1.5): ${res9.fillerAnalysis.totalFillerCount * 1.5}`);
  console.log(`Applied Filler Penalty: ${res9.fillerPenalty}`);
  if (res9.fillerAnalysis.totalFillerCount >= 15 && res9.fillerPenalty === 15) {
    console.log('✅ TEST 9 PASSED: Filler penalty is strictly capped at max 15 points.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 9 FAILED');
  }

  console.log('=====================================================');
  console.log(`🏁 TEST SUITE COMPLETED: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('=====================================================');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
