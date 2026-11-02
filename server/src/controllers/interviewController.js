import { db } from '../services/db.js';
import { generateQuestion, evaluateAnswer } from '../services/aiService.js';

export const createSession = async (req, res) => {
  try {
    const { role = 'Full Stack Engineer', difficulty = 'Senior', type = 'Technical & Behavioral', totalQuestions = 3 } = req.body;
    const apiKey = req.headers['x-gemini-api-key'] || req.body.apiKey;

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
      questionIndex: 1,
      apiKey
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
    const { questionId, transcript, durationSeconds = 30, videoMetrics = {}, audioMetrics = {} } = req.body;
    const apiKey = req.headers['x-gemini-api-key'] || req.body.apiKey;

    // 1. Validation
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Valid candidate answer transcript is required' });
    }

    const session = db.findSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const questions = db.findQuestionsBySessionId(id);
    const currentQ = questions.find(q => q.id === questionId) || questions[questions.length - 1];

    if (!currentQ) {
      return res.status(400).json({ error: 'Question not found for this interview session' });
    }

    // 2. Prevent duplicate submissions for the same question
    const existingAnswers = db.findAnswersBySessionId(id);
    const duplicate = existingAnswers.find(a => a.questionId === currentQ.id);
    if (duplicate) {
      try {
        const existingEval = JSON.parse(duplicate.evaluation);
        return res.json({
          completed: questions.length >= (session.totalQuestions || 3),
          evaluation: existingEval,
          message: 'Answer previously submitted for this question',
          session
        });
      } catch (e) {
        // Continue if parse error
      }
    }

    // 3. Evaluate answer with official 4-category rubric and boundary-aware filler analysis
    const evaluation = await evaluateAnswer({
      question: currentQ.question,
      transcript: transcript.trim(),
      role: session.role,
      difficulty: session.difficulty,
      type: session.type,
      category: currentQ.category,
      videoMetrics,
      durationSeconds: Number(durationSeconds) || 30,
      apiKey
    });

    // 4. Save Answer with complete metrics
    const answer = db.createAnswer({
      id: `ans-${Date.now()}`,
      questionId: currentQ.id,
      transcript: transcript.trim(),
      durationSeconds: Number(durationSeconds) || 30,
      fillerWordCount: evaluation.fillerAnalysis?.totalFillerCount || 0,
      audioMetrics: JSON.stringify(audioMetrics),
      videoMetrics: JSON.stringify(videoMetrics),
      evaluation: JSON.stringify(evaluation),
      createdAt: new Date().toISOString()
    });

    const isLastQuestion = questions.length >= (session.totalQuestions || 3);

    if (isLastQuestion) {
      // Complete Session & Aggregate Feedback across all questions
      const allAnswers = db.findAnswersBySessionId(id);
      const allEvaluations = allAnswers.map(a => {
        try { return JSON.parse(a.evaluation); } catch (e) { return null; }
      }).filter(Boolean);

      const count = allEvaluations.length || 1;

      // Deterministic averages
      const avgOverall = Math.round(allEvaluations.reduce((s, e) => s + (e.finalScore ?? e.overallScore ?? 75), 0) / count);
      const avgRaw = Math.round(allEvaluations.reduce((s, e) => s + (e.rawScore ?? 75), 0) / count);
      const avgFillerPenalty = Number((allEvaluations.reduce((s, e) => s + (e.fillerPenalty ?? 0), 0) / count).toFixed(1));

      // 4-category rubric averages
      const avgTechRubric = Number((allEvaluations.reduce((s, e) => s + (e.rubric?.technicalAccuracy?.score ?? (e.technical * 0.3) ?? 20), 0) / count).toFixed(1));
      const avgCommRubric = Number((allEvaluations.reduce((s, e) => s + (e.rubric?.communicationClarity?.score ?? (e.communication * 0.25) ?? 18), 0) / count).toFixed(1));
      const avgProblemRubric = Number((allEvaluations.reduce((s, e) => s + (e.rubric?.problemSolving?.score ?? (e.problemSolving * 0.25) ?? 18), 0) / count).toFixed(1));
      const avgDeliveryRubric = Number((allEvaluations.reduce((s, e) => s + (e.rubric?.deliveryConfidence?.score ?? (e.confidence * 0.2) ?? 14), 0) / count).toFixed(1));

      // Normalized 100-scale compatibility
      const avgComm = Math.round((avgCommRubric / 25) * 100);
      const avgTech = Math.round((avgTechRubric / 30) * 100);
      const avgConf = Math.round((avgDeliveryRubric / 20) * 100);
      const avgNonVerbal = Math.round(allEvaluations.reduce((s, e) => s + (e.nonVerbalScore || 85), 0) / count);

      // Aggregate Speech Analytics
      const totalWordsSpoken = allEvaluations.reduce((s, e) => s + (e.speechAnalytics?.totalWords || 0), 0);
      const totalDurationSecs = allEvaluations.reduce((s, e) => s + (e.speechAnalytics?.durationSeconds || 30), 0);
      const avgWpm = totalDurationSecs > 0 ? Math.round(totalWordsSpoken / (totalDurationSecs / 60)) : 130;
      const totalFillers = allEvaluations.reduce((s, e) => s + (e.fillerAnalysis?.totalFillerCount || 0), 0);

      const strengths = Array.from(new Set(allEvaluations.flatMap(e => e.strengths || []))).slice(0, 5);
      const weaknesses = Array.from(new Set(allEvaluations.flatMap(e => e.weaknesses || []))).slice(0, 4);
      const improvements = Array.from(new Set(allEvaluations.flatMap(e => e.improvements || []))).slice(0, 4);

      const consolidatedFeedback = {
        whatAnsweredCorrectly: allEvaluations.map(e => e.feedback?.whatAnsweredCorrectly).filter(Boolean).join(' ') || 'Demonstrated good overall engineering preparation.',
        whatWasIncorrect: allEvaluations.map(e => e.feedback?.whatWasIncorrect).filter(Boolean).join(' ') || 'No critical technical anti-patterns identified.',
        missingPoints: Array.from(new Set(allEvaluations.flatMap(e => e.feedback?.missingPoints || []))).slice(0, 4),
        addressedQuestion: allEvaluations.every(e => e.feedback?.addressedQuestion === 'Yes') ? 'Yes' : 'Partially',
        idealExampleAnswer: allEvaluations[allEvaluations.length - 1]?.feedback?.idealExampleAnswer || ''
      };

      const feedback = db.createFeedback({
        id: `feedback-${Date.now()}`,
        sessionId: id,
        overallScore: avgOverall,
        finalScore: avgOverall,
        rawScore: avgRaw,
        fillerPenalty: avgFillerPenalty,

        // 4 Rubric Categories
        rubric: JSON.stringify({
          technicalAccuracy: { score: avgTechRubric, maxScore: 30 },
          communicationClarity: { score: avgCommRubric, maxScore: 25 },
          problemSolving: { score: avgProblemRubric, maxScore: 25 },
          deliveryConfidence: { score: avgDeliveryRubric, maxScore: 20, isEstimated: true }
        }),

        // Speech & Filler Analytics
        speechAnalytics: JSON.stringify({
          wordsPerMinute: avgWpm,
          totalWords: totalWordsSpoken,
          durationSeconds: totalDurationSecs,
          totalFillerCount: totalFillers
        }),

        communication: avgComm,
        technical: avgTech,
        confidence: avgConf,
        nonVerbalScore: avgNonVerbal,
        strengths: JSON.stringify(strengths),
        weaknesses: JSON.stringify(weaknesses),
        improvements: JSON.stringify(improvements),
        detailedFeedback: JSON.stringify(consolidatedFeedback),
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
        previousContext: [{ question: currentQ.question, answer: transcript }],
        apiKey
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
    res.status(500).json({ error: 'Failed to evaluate answer: ' + err.message });
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
