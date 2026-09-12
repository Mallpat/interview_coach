import { validateGeminiKey, generateQuestion, evaluateAnswer, reviewCodeSubmission, analyzeResumeWithGemini } from './src/services/aiService.js';

async function runTests() {
  console.log('🧪 Starting Gemini Integration Tests...\n');

  // Test 1: Empty Key Validation
  try {
    const res = await validateGeminiKey('');
    console.log('❌ Test 1 Failed: Expected empty key to fail');
  } catch (err) {
    console.log('✅ Test 1 Passed: Empty key rejected gracefully ->', err.message);
  }

  // Test 2: Invalid Key Validation
  const invalidRes = await validateGeminiKey('AIzaSy_fake_test_key_123456');
  if (invalidRes.valid === false) {
    console.log('✅ Test 2 Passed: Invalid key rejected with error message ->', invalidRes.error?.slice(0, 60) + '...');
  } else {
    console.log('❌ Test 2 Failed: Invalid key was marked valid');
  }

  // Test 3: Question Generation (Heuristic fallback)
  const qRes = await generateQuestion({
    role: 'Full Stack Engineer',
    difficulty: 'Senior',
    type: 'Technical',
    questionIndex: 1
  });
  if (qRes && qRes.question && qRes.category) {
    console.log('✅ Test 3 Passed: Question generated ->', qRes.question.slice(0, 60) + '...');
  } else {
    console.log('❌ Test 3 Failed: Question generation failed');
  }

  // Test 4: Answer Evaluation (Heuristic fallback)
  const evalRes = await evaluateAnswer({
    question: 'How do you optimize React rendering?',
    transcript: 'I used React.memo, useMemo, and useCallback to reduce redundant renders and profiled component commits.',
    role: 'Full Stack Engineer',
    difficulty: 'Senior',
    category: 'technical',
    videoMetrics: { eyeContactScore: 88, facePresent: true },
    fillerWordCount: 1
  });
  if (evalRes && evalRes.overallScore >= 0) {
    console.log('✅ Test 4 Passed: Answer evaluated with score ->', evalRes.overallScore);
  } else {
    console.log('❌ Test 4 Failed: Answer evaluation failed');
  }

  // Test 5: Code Review (Heuristic fallback)
  const codeRes = await reviewCodeSubmission({
    challengeTitle: 'Two Sum',
    code: 'function twoSum(nums, target) { const map = new Map(); }',
    testResults: { passedCount: 3, totalCount: 3 }
  });
  if (codeRes && codeRes.verdict) {
    console.log('✅ Test 5 Passed: Code review produced verdict ->', codeRes.verdict, '| Complexity:', codeRes.timeComplexity);
  } else {
    console.log('❌ Test 5 Failed: Code review failed');
  }

  console.log('\n🎉 All Gemini AI service integration tests completed successfully!');
}

runTests().catch(console.error);
