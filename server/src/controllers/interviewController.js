import { db } from '../services/db.js';
import { generateQuestion, evaluateAnswer } from '../services/aiService.js';

export const createSession = async (req, res) => {
  try {
    const { role = 'Full Stack Engineer', difficulty = 'Senior', type = 'Technical & Behavioral', totalQuestions = 3 } = req.body;

    const session = db.createSession({
      id: `session-${Date.now()}`,
      userId: req.user.id,
      role,
      difficulty,
      type,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      endedAt: null,
      totalQuestions: Number(totalQuestions) || 3
    });

    // Generate Question 1
    const q1Data = await generateQuestion({
      role,
      difficulty,
      type,
      questionIndex: 1
    });

    const question1 = db.createQuestion({
      id: `q-${Date.now()}-1`,
      sessionId: session.id,
      question: q1Data.question,
      category: q1Data.category || 'technical',
      orderNo: 1,
      coachTip: q1Data.coachTip,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      session,
      currentQuestion: question1,
      totalQuestions: session.totalQuestions
    });
  } catch (err) {
    console.error('Error creating interview session:', err);
    res.status(500).json({ error: 'Failed to create interview session' });
  }
};

export const getSession = (req, res) => {
  const { id } = req.params;
  const session = db.findSessionById(id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const questions = db.findQuestionsBySessionId(id);
  const answers = db.findAnswersBySessionId(id);
  const feedback = db.findFeedbackBySessionId(id);

  res.json({
    session,
    questions,
    answers,
    feedback
  });
};

export const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, transcript, durationSeconds = 30, fillerWordCount = 0, videoMetrics = {}, audioMetrics = {} } = req.body;

    const session = db.findSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const questions = db.findQuestionsBySessionId(id);
    const currentQ = questions.find(q => q.id === questionId) || questions[questions.length - 1];

    // Evaluate answer with AI / heuristic engine
    const evaluation = await evaluateAnswer({
      question: currentQ.question,
      transcript,
      role: session.role,
      difficulty: session.difficulty,
      category: currentQ.category,
      videoMetrics,
      fillerWordCount
    });

    // Save Answer
    const answer = db.createAnswer({
      id: `ans-${Date.now()}`,
      questionId: currentQ.id,
      transcript,
      durationSeconds,
      fillerWordCount,
      audioMetrics: JSON.stringify(audioMetrics),
      videoMetrics: JSON.stringify(videoMetrics),
      evaluation: JSON.stringify(evaluation),
      createdAt: new Date().toISOString()
    });

    const isLastQuestion = questions.length >= (session.totalQuestions || 3);

    if (isLastQuestion) {
      // Complete Session & Aggregate Feedback
      const allAnswers = db.findAnswersBySessionId(id);
      const allEvaluations = allAnswers.map(a => {
        try { return JSON.parse(a.evaluation); } catch (e) { return null; }
      }).filter(Boolean);

      const avgOverall = Math.round(allEvaluations.reduce((s, e) => s + (e.overallScore || 75), 0) / (allEvaluations.length || 1));
      const avgComm = Math.round(allEvaluations.reduce((s, e) => s + (e.communication || 75), 0) / (allEvaluations.length || 1));
      const avgTech = Math.round(allEvaluations.reduce((s, e) => s + (e.technical || 75), 0) / (allEvaluations.length || 1));
      const avgConf = Math.round(allEvaluations.reduce((s, e) => s + (e.confidence || 80), 0) / (allEvaluations.length || 1));
      const avgNonVerbal = Math.round(allEvaluations.reduce((s, e) => s + (e.nonVerbalScore || 85), 0) / (allEvaluations.length || 1));

      const strengths = Array.from(new Set(allEvaluations.flatMap(e => e.strengths || []))).slice(0, 4);
      const weaknesses = Array.from(new Set(allEvaluations.flatMap(e => e.weaknesses || []))).slice(0, 3);
      const improvements = Array.from(new Set(allEvaluations.flatMap(e => e.improvements || []))).slice(0, 3);

      const feedback = db.createFeedback({
        id: `feedback-${Date.now()}`,
        sessionId: id,
        overallScore: avgOverall,
        communication: avgComm,
        technical: avgTech,
        confidence: avgConf,
        nonVerbalScore: avgNonVerbal,
        strengths: JSON.stringify(strengths),
        weaknesses: JSON.stringify(weaknesses),
        improvements: JSON.stringify(improvements),
        starAnalysis: JSON.stringify(evaluation.starAnalysis || {}),
        questionDetail: JSON.stringify(allEvaluations),
        createdAt: new Date().toISOString()
      });

      db.updateSession(id, { status: 'completed', endedAt: new Date().toISOString() });
      db.recordAnalyticsSnapshot(req.user.id, 'readiness', avgOverall);

      return res.json({
        completed: true,
        evaluation,
        feedback,
        session: db.findSessionById(id)
      });
    } else {
      // Generate Next Question
      const nextIndex = questions.length + 1;
      const nextQData = await generateQuestion({
        role: session.role,
        difficulty: session.difficulty,
        type: session.type,
        questionIndex: nextIndex,
        previousContext: [{ question: currentQ.question, answer: transcript }]
      });

      const nextQuestion = db.createQuestion({
        id: `q-${Date.now()}-${nextIndex}`,
        sessionId: session.id,
        question: nextQData.question,
        category: nextQData.category || 'technical',
        orderNo: nextIndex,
        coachTip: nextQData.coachTip,
        createdAt: new Date().toISOString()
      });

      return res.json({
        completed: false,
        evaluation,
        nextQuestion,
        currentOrder: nextIndex,
        totalQuestions: session.totalQuestions || 3
      });
    }
  } catch (err) {
    console.error('Error submitting answer:', err);
    res.status(500).json({ error: 'Failed to evaluate answer' });
  }
};

export const getHistory = (req, res) => {
  const sessions = db.findSessionsByUserId(req.user.id);
  const historyWithFeedback = sessions.map(s => {
    const feedback = db.findFeedbackBySessionId(s.id);
    return {
      ...s,
      feedback: feedback ? {
        ...feedback,
        strengths: JSON.parse(feedback.strengths || '[]'),
        weaknesses: JSON.parse(feedback.weaknesses || '[]'),
        improvements: JSON.parse(feedback.improvements || '[]')
      } : null
    };
  });

  res.json(historyWithFeedback);
};
