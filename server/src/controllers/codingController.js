import { db } from '../services/db.js';
import { runCodeSandbox } from '../services/codeRunnerService.js';
import { reviewCodeSubmission } from '../services/aiService.js';

export const listChallenges = (req, res) => {
  const challenges = db.getAllChallenges();
  const safeList = challenges.map(c => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    difficulty: c.difficulty,
    category: c.category,
    testCasesCount: c.testData.length
  }));
  res.json(safeList);
};

export const getChallenge = (req, res) => {
  const { id } = req.params;
  const challenge = db.findChallengeById(id);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  res.json({
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    difficulty: challenge.difficulty,
    category: challenge.category,
    prompt: challenge.prompt,
    starterCode: challenge.starterCode,
    sampleTests: challenge.testData.slice(0, 2)
  });
};

export const submitSolution = async (req, res) => {
  try {
    const { challengeId, code, language = 'javascript' } = req.body;

    if (!challengeId || !code) {
      return res.status(400).json({ error: 'ChallengeId and code are required' });
    }

    const challenge = db.findChallengeById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Run sandboxed tests
    const runResult = await runCodeSandbox(code, challenge.testData, 3500);

    // AI complexity review
    const aiReview = await reviewCodeSubmission({
      challengeTitle: challenge.title,
      code,
      testResults: runResult
    });

    // Save submission
    const submission = db.createSubmission({
      id: `sub-${Date.now()}`,
      userId: req.user.id,
      challengeId: challenge.id,
      code,
      language,
      status: runResult.status,
      score: runResult.score,
      passedCount: runResult.passedCount,
      totalCount: runResult.totalCount,
      runtimeMs: runResult.runtimeMs,
      aiReview: JSON.stringify(aiReview),
      submittedAt: new Date().toISOString()
    });

    if (runResult.status === 'passed') {
      db.recordAnalyticsSnapshot(req.user.id, 'coding_score', 100);
    }

    res.json({
      submissionId: submission.id,
      ...runResult,
      aiReview
    });

  } catch (err) {
    console.error('Error submitting code:', err);
    res.status(500).json({ error: 'Failed to evaluate code submission' });
  }
};
