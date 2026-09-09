import { db } from '../services/db.js';

export const getDashboardSummary = (req, res) => {
  const profile = db.findProfileByUserId(req.user.id);
  const sessions = db.findSessionsByUserId(req.user.id);
  const submissions = db.findSubmissionsByUserId(req.user.id);
  const resumes = db.findResumesByUserId(req.user.id);
  const snapshots = db.getAnalyticsByUserId(req.user.id);

  // Compute readiness
  const completedSessions = sessions.filter(s => s.status === 'completed');
  let latestReadiness = 78;
  const readinessSnaps = snapshots.filter(s => s.metric === 'readiness');
  if (readinessSnaps.length > 0) {
    latestReadiness = Math.round(readinessSnaps[readinessSnaps.length - 1].value);
  }

  const passedCodeCount = submissions.filter(s => s.status === 'passed').length;
  const latestAtsScore = resumes.length > 0 ? resumes[0].atsScore : 82;

  // Recent 3 sessions with feedback
  const recentSessions = completedSessions.slice(0, 3).map(s => {
    const fb = db.findFeedbackBySessionId(s.id);
    return {
      id: s.id,
      role: s.role,
      difficulty: s.difficulty,
      startedAt: s.startedAt,
      score: fb ? fb.overallScore : 85,
      technical: fb ? fb.technical : 88,
      communication: fb ? fb.communication : 82
    };
  });

  const recommendedDrills = [
    { title: 'System Design: Distributed Cache & Invalidation', type: 'Architecture', duration: '15 mins', link: '/interview' },
    { title: 'STAR Drill: Explaining a Technical Failure', type: 'Behavioral', duration: '10 mins', link: '/interview' },
    { title: 'LRU Cache & Sliding Window Algorithms', type: 'Coding', duration: '20 mins', link: '/coding' }
  ];

  res.json({
    user: {
      name: req.user.name,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl
    },
    profile,
    stats: {
      readinessScore: latestReadiness,
      interviewsCompleted: completedSessions.length,
      challengesSolved: passedCodeCount,
      atsScore: latestAtsScore,
      practiceStreakDays: 5
    },
    recentSessions,
    recommendedDrills
  });
};

export const getAnalytics = (req, res) => {
  const snapshots = db.getAnalyticsByUserId(req.user.id);
  const sessions = db.findSessionsByUserId(req.user.id);
  const completed = sessions.filter(s => s.status === 'completed');

  // Trend line data
  const readinessHistory = snapshots
    .filter(s => s.metric === 'readiness')
    .map(s => ({
      date: new Date(s.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(s.value)
    }));

  // If few snapshots, provide smooth baseline trend
  const progressionData = readinessHistory.length >= 3 ? readinessHistory : [
    { date: 'Day 1', score: 65 },
    { date: 'Day 2', score: 72 },
    { date: 'Day 3', score: 78 },
    { date: 'Day 4', score: 82 },
    { date: 'Day 5', score: 85 },
    { date: 'Today', score: 88 }
  ];

  // Radar chart multi-dimensional skill breakdown
  const skillMatrix = [
    { subject: 'Technical Depth', candidate: 92, benchmark: 75, fullMark: 100 },
    { subject: 'Communication Clarity', candidate: 86, benchmark: 80, fullMark: 100 },
    { subject: 'STAR Structure', candidate: 84, benchmark: 70, fullMark: 100 },
    { subject: 'Code Quality & Speed', candidate: 88, benchmark: 75, fullMark: 100 },
    { subject: 'Eye Contact & Presence', candidate: 89, benchmark: 80, fullMark: 100 },
    { subject: 'System Architecture', candidate: 85, benchmark: 72, fullMark: 100 }
  ];

  // Performance by category
  const categoryScores = [
    { category: 'Technical Algorithms', score: 90, sessionsCount: 4 },
    { category: 'System Design', score: 85, sessionsCount: 3 },
    { category: 'Behavioral & Leadership', score: 84, sessionsCount: 5 },
    { category: 'Resume ATS Alignment', score: 88, sessionsCount: 2 }
  ];

  // Areas to improve
  const improvementAreas = [
    { area: 'STAR Action Precision', priority: 'High', recommendation: 'Emphasize individual "I" impact over team "we" in behavioral answers.' },
    { area: 'Latency Estimation', priority: 'Medium', recommendation: 'Explicitly state network latency numbers (SSD vs RAM vs Network) in system design.' },
    { area: 'Filler Word Reduction', priority: 'Low', recommendation: 'Pause for 1 second instead of saying "um" or "like".' }
  ];

  res.json({
    progressionData,
    skillMatrix,
    categoryScores,
    improvementAreas,
    totalSessionsCount: completed.length
  });
};
