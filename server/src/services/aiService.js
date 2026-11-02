import { GoogleGenAI } from '@google/genai';
import { QUESTION_BANK } from '../data/questions.js';
import { analyzeFillersAndSpeech } from '../utils/fillerDetector.js';

const GEMINI_PRIMARY_MODEL = 'gemini-3.6-flash';

const getGeminiClient = (customApiKey) => {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

/**
 * Validate a user-provided Gemini API key
 */
export const validateGeminiKey = async (apiKey) => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is empty');
  }
  const cleanKey = apiKey.trim();
  const start = Date.now();
  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const response = await ai.models.generateContent({
      model: GEMINI_PRIMARY_MODEL,
      contents: 'Ping test. Reply with OK.'
    });
    const latencyMs = Date.now() - start;
    const reply = response.text?.trim() || response.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || 'OK';
    return { 
      valid: true, 
      model: GEMINI_PRIMARY_MODEL,
      latencyMs,
      response: reply
    };
  } catch (err) {
    return { valid: false, error: err.message };
  }
};


/**
 * Generate a dynamic interview question tailored to role, seniority and context
 */
export const generateQuestion = async ({ role, difficulty, type, questionIndex = 1, previousContext = [], apiKey }) => {
  const gemini = getGeminiClient(apiKey);

  if (gemini) {
    try {
      const prompt = `You are an elite Tech Interview Coach conducting a ${difficulty} interview for a ${role} position.
Round Type: ${type}
Current Question Number: ${questionIndex}

Previous questions/answers summary:
${previousContext.map(c => `Q: ${c.question}\nA: ${c.answer}`).join('\n\n')}

Generate the next realistic, challenging interview question. If previous answers showed gaps, probe deeper.
Return your response in valid JSON format:
{
  "question": "The question string",
  "category": "technical | behavioral | architecture | coding",
  "coachTip": "A brief hint or what the interviewer is looking for"
}`;

      const response = await gemini.models.generateContent({
        model: GEMINI_PRIMARY_MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text);
      if (parsed.question) return parsed;
    } catch (err) {
      console.warn('Gemini question generation fallback:', err.message);
    }
  }

  // Resilient fallback using domain question banks across engineering branches
  let bankKey = Object.keys(QUESTION_BANK).find(k => k.toLowerCase() === (role || '').toLowerCase());
  if (!bankKey && role) {
    const rLower = role.toLowerCase();
    if (rLower.includes('mech') || rLower.includes('automotive') || rLower.includes('fea')) bankKey = 'Mechanical Design Engineer';
    else if (rLower.includes('ai') || rLower.includes('machine learning') || rLower.includes('data sci') || rLower.includes('llm')) bankKey = 'AI & ML Engineer';
    else if (rLower.includes('embed') || rLower.includes('vlsi') || rLower.includes('pcb') || rLower.includes('hardware') || rLower.includes('electric')) bankKey = 'Embedded Systems & Firmware Engineer';
    else if (rLower.includes('civil') || rLower.includes('structur') || rLower.includes('construct')) bankKey = 'Structural Design Engineer';
    else if (rLower.includes('robot') || rLower.includes('automa') || rLower.includes('plc')) bankKey = 'Robotics & Autonomous Systems Engineer';
    else if (rLower.includes('cloud') || rLower.includes('devops')) bankKey = 'Cloud & DevOps Engineer';
    else if (rLower.includes('back')) bankKey = 'Backend Engineer';
    else if (rLower.includes('front')) bankKey = 'Frontend Engineer';
  }
  const bank = QUESTION_BANK[bankKey] || QUESTION_BANK["Full Stack Engineer"];
  const selected = bank[(questionIndex - 1) % bank.length];

  return {
    question: selected.question,
    category: selected.category,
    coachTip: "Focus on clear communication, structured reasoning (STAR method), and quantitative metrics."
  };
};

/**
 * Deterministic Arithmetic & Structured Score Normalizer
 * Raw Score = Technical (0-30) + Communication (0-25) + Problem-Solving (0-25) + Delivery (0-20)
 * Filler Penalty = min(15, Filler Count * 1.5)
 * Final Score = max(0, Raw Score - Filler Penalty)
 */
export const sanitizeAndCalculateScores = (geminiResult, analysis) => {
  const { totalFillerCount, fillerPenalty, fillerBreakdown, occurrences, speechAnalytics } = analysis;

  const rawTech = Math.max(0, Math.min(30, Math.round(Number(geminiResult?.rubric?.technicalAccuracy?.score) || 0)));
  const rawComm = Math.max(0, Math.min(25, Math.round(Number(geminiResult?.rubric?.communicationClarity?.score) || 0)));
  const rawProblem = Math.max(0, Math.min(25, Math.round(Number(geminiResult?.rubric?.problemSolving?.score) || 0)));
  const rawDelivery = Math.max(0, Math.min(20, Math.round(Number(geminiResult?.rubric?.deliveryConfidence?.score) || 0)));

  // DETERMINISTIC JAVASCRIPT ARITHMETIC
  const rawScore = rawTech + rawComm + rawProblem + rawDelivery;
  const finalScore = Math.max(0, Math.round(rawScore - fillerPenalty));

  const strengths = [
    ...(geminiResult?.rubric?.technicalAccuracy?.strengths || []),
    ...(geminiResult?.rubric?.communicationClarity?.strengths || []),
    ...(geminiResult?.rubric?.problemSolving?.strengths || [])
  ].filter(Boolean).slice(0, 4);

  const weaknesses = [
    ...(geminiResult?.rubric?.technicalAccuracy?.weaknesses || []),
    ...(geminiResult?.rubric?.communicationClarity?.weaknesses || []),
    ...(geminiResult?.rubric?.problemSolving?.weaknesses || []),
    totalFillerCount > 3 ? `Detected ${totalFillerCount} filler words (${Object.keys(fillerBreakdown).join(', ')}). Work on pauses instead of fillers.` : null
  ].filter(Boolean).slice(0, 4);

  const improvements = [
    ...(geminiResult?.feedback?.improvementAdvice || []),
    geminiResult?.rubric?.technicalAccuracy?.improvement,
    geminiResult?.rubric?.communicationClarity?.improvement
  ].filter(Boolean).slice(0, 4);

  return {
    // Deterministic Calculated Scores
    overallScore: finalScore,
    finalScore,
    rawScore,
    fillerPenalty,

    // 4 Project Rubric Categories
    rubric: {
      technicalAccuracy: {
        score: rawTech,
        maxScore: 30,
        explanation: geminiResult?.rubric?.technicalAccuracy?.explanation || 'Evaluation of technical concepts, correctness, and domain depth.',
        strengths: geminiResult?.rubric?.technicalAccuracy?.strengths || [],
        weaknesses: geminiResult?.rubric?.technicalAccuracy?.weaknesses || [],
        improvement: geminiResult?.rubric?.technicalAccuracy?.improvement || ''
      },
      communicationClarity: {
        score: rawComm,
        maxScore: 25,
        explanation: geminiResult?.rubric?.communicationClarity?.explanation || 'Evaluation of structure, conciseness, and articulation flow.',
        strengths: geminiResult?.rubric?.communicationClarity?.strengths || [],
        weaknesses: geminiResult?.rubric?.communicationClarity?.weaknesses || [],
        improvement: geminiResult?.rubric?.communicationClarity?.improvement || ''
      },
      problemSolving: {
        score: rawProblem,
        maxScore: 25,
        explanation: geminiResult?.rubric?.problemSolving?.explanation || 'Evaluation of analytical reasoning, edge-case coverage, and trade-offs.',
        strengths: geminiResult?.rubric?.problemSolving?.strengths || [],
        weaknesses: geminiResult?.rubric?.problemSolving?.weaknesses || [],
        improvement: geminiResult?.rubric?.problemSolving?.improvement || ''
      },
      deliveryConfidence: {
        score: rawDelivery,
        maxScore: 20,
        label: 'Estimated (Speech Pacing & Articulation)',
        isEstimated: true,
        disclaimer: 'Delivery confidence is estimated from textual transcript fluency and pace telemetry, not direct voice acoustic analysis.',
        explanation: geminiResult?.rubric?.deliveryConfidence?.explanation || 'Pacing and composure metrics.',
        strengths: geminiResult?.rubric?.deliveryConfidence?.strengths || [],
        weaknesses: geminiResult?.rubric?.deliveryConfidence?.weaknesses || [],
        improvement: geminiResult?.rubric?.deliveryConfidence?.improvement || ''
      }
    },

    // Normalized scores (0-100 scale) for backwards compatibility
    technical: Math.round((rawTech / 30) * 100),
    communication: Math.round((rawComm / 25) * 100),
    problemSolving: Math.round((rawProblem / 25) * 100),
    confidence: Math.round((rawDelivery / 20) * 100),
    nonVerbalScore: 85,

    // Specific Granular Feedback
    feedback: {
      whatAnsweredCorrectly: geminiResult?.feedback?.whatAnsweredCorrectly || 'Addressed the general interview prompt.',
      whatWasIncorrect: geminiResult?.feedback?.whatWasIncorrect || 'No major technical fallacies identified.',
      missingPoints: geminiResult?.feedback?.missingPoints || [],
      addressedQuestion: geminiResult?.feedback?.addressedQuestion || 'Yes',
      addressedQuestionExplanation: geminiResult?.feedback?.addressedQuestionExplanation || '',
      improvementAdvice: geminiResult?.feedback?.improvementAdvice || [],
      idealExampleAnswer: geminiResult?.feedback?.idealExampleAnswer || ''
    },

    // Filler & Speech Analytics
    fillerAnalysis: {
      totalFillerCount,
      fillerPenalty,
      fillerBreakdown,
      occurrences
    },
    speechAnalytics,

    strengths,
    weaknesses,
    improvements,
    starAnalysis: geminiResult?.starAnalysis || {
      situation: 'Contextual background set.',
      task: 'Task and objectives established.',
      action: 'Specific technical choices highlighted.',
      result: 'Quantifiable metrics and business outcomes could be reinforced.'
    },
    idealAnswerSummary: geminiResult?.feedback?.idealExampleAnswer || 'A top-tier answer directly addresses the core engineering constraints, justifies trade-offs, and validates performance.'
  };
};

/**
 * Calibrated Heuristic Engine for Offline / Fallback Rubric Evaluation
 */
export const evaluateWithCalibratedHeuristic = ({
  question = '',
  transcript = '',
  role = 'Software Engineer',
  difficulty = 'Senior',
  category = 'technical',
  videoMetrics = {},
  analysis
}) => {
  const { totalFillerCount, fillerPenalty, fillerBreakdown, occurrences, speechAnalytics } = analysis;
  const wordCount = speechAnalytics.totalWords;
  const cleanTranscript = transcript.toLowerCase();
  const cleanQuestion = question.toLowerCase();

  // Extract question content keywords (ignoring generic stop words)
  const stopWords = new Set(['what', 'how', 'why', 'when', 'which', 'where', 'would', 'could', 'should', 'your', 'about', 'with', 'from', 'have', 'been', 'were', 'does', 'tell', 'explain', 'describe']);
  const questionWords = cleanQuestion.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
  const matchedQuestionKeywords = questionWords.filter(w => cleanTranscript.includes(w));
  const relevanceRatio = questionWords.length > 0 ? (matchedQuestionKeywords.length / questionWords.length) : 1;

  // Detection of explicit irrelevance / non-sequitur (e.g., cooking recipes or random filler when asked about engineering)
  const isOffTopic = (relevanceRatio === 0 && wordCount > 8 && !/(system|code|function|data|database|user|service|api|server|latency|cache|test|component|state|scale)/.test(cleanTranscript));
  const isVeryShort = wordCount < 10;
  const isTechnicallyIncorrect = /(never use indexes|always use eval|store passwords in plain text|css is a database|react is an operating system|http is a database|drop database production)/i.test(cleanTranscript);

  let rawTech = 0;
  let rawComm = 0;
  let rawProblem = 0;
  let rawDelivery = 0;

  let whatCorrect = '';
  let whatIncorrect = '';
  let missingPoints = [];
  let addressedQuestion = 'Yes';
  let addressedExplanation = '';

  if (isOffTopic) {
    // 4. Irrelevant Answer or 7. Long Irrelevant Answer
    rawTech = 0;
    rawComm = wordCount > 50 ? 8 : 6;
    rawProblem = 2;
    rawDelivery = 10;
    addressedQuestion = 'No';
    addressedExplanation = 'The response does not address the interview question asked.';
    whatCorrect = 'The candidate spoke in complete sentences, but on an unrelated topic.';
    whatIncorrect = 'The response was off-topic and did not demonstrate understanding of the requested topic.';
    missingPoints = ['Direct answer to the interview question', 'Technical architectural patterns', 'Role-relevant domain concepts'];
  } else if (isVeryShort) {
    // 6. Very Short Answer
    rawTech = wordCount > 4 ? 6 : 2;
    rawComm = 5;
    rawProblem = 4;
    rawDelivery = 6;
    addressedQuestion = 'Partially';
    addressedExplanation = 'Answer is too brief to evaluate full engineering competency.';
    whatCorrect = wordCount > 0 ? 'Brief mention of topic.' : 'None.';
    whatIncorrect = 'Answer lacks depth, context, and explanation of underlying mechanics.';
    missingPoints = ['Detailed system architecture', 'Trade-off analysis', 'Concrete implementation details'];
  } else if (isTechnicallyIncorrect) {
    // 2. Technically Incorrect Answer
    rawTech = 5;
    rawComm = 16;
    rawProblem = 8;
    rawDelivery = 14;
    addressedQuestion = 'Partially';
    addressedExplanation = 'Addressed the topic, but contains critical technical misconceptions.';
    whatCorrect = 'Attempted to explain a solution structure and workflow.';
    whatIncorrect = 'Contains factually inaccurate statements or anti-patterns violating standard engineering principles.';
    missingPoints = ['Accurate industry best practices', 'Security/performance safeguards', 'Proper technical terminology'];
  } else {
    // General technical evaluation based on content depth
    const hasArchTerms = /(concurrency|async|cache|redis|index|database|schema|trade-off|latency|p99|throughput|load balancer|queue|microservice|isolation|transaction)/i.test(cleanTranscript);
    const hasStarWords = /(because|impact|reduced|increased|result|solution|implemented|prevented|monitored)/i.test(cleanTranscript);

    // Technical Accuracy (0-30)
    rawTech = 18;
    if (wordCount >= 45 && hasArchTerms) rawTech += 8;
    else if (wordCount >= 25) rawTech += 4;
    if (relevanceRatio < 0.25) rawTech = Math.max(8, rawTech - 8);

    // Communication Clarity (0-25)
    rawComm = 17;
    if (wordCount >= 30 && wordCount <= 120) rawComm += 5;
    if (totalFillerCount > 6) rawComm = Math.max(8, rawComm - 4);

    // Problem-Solving & Logic (0-25)
    rawProblem = 16;
    if (hasStarWords) rawProblem += 6;
    if (hasArchTerms) rawProblem += 2;

    // Delivery & Vocal Confidence (0-20, estimated)
    rawDelivery = 14;
    if (speechAnalytics.wordsPerMinute >= 120 && speechAnalytics.wordsPerMinute <= 160) rawDelivery += 4;
    else if (speechAnalytics.wordsPerMinute >= 100 && speechAnalytics.wordsPerMinute <= 180) rawDelivery += 2;
    if (videoMetrics?.eyeContactScore > 80) rawDelivery += 2;

    whatCorrect = 'Explained the main technical approach and demonstrated conceptual familiarity with the stack.';
    whatIncorrect = 'No severe fallacies found; could deepen the mathematical analysis of trade-offs.';
    missingPoints = ['Specific latency SLAs and metrics', 'Edge-case failure modes and recovery procedures'];
  }

  const simulatedGeminiResult = {
    rubric: {
      technicalAccuracy: {
        score: rawTech,
        maxScore: 30,
        explanation: `Technical response evaluation based on domain depth and accuracy (${rawTech}/30).`,
        strengths: rawTech >= 20 ? ['Good conceptual grounding in system design.'] : ['Attempted to address key topics.'],
        weaknesses: rawTech < 20 ? ['Lacks depth on concrete architectural mechanisms and edge cases.'] : [],
        improvement: 'Proactively discuss trade-offs and underlying runtime mechanics.'
      },
      communicationClarity: {
        score: rawComm,
        maxScore: 25,
        explanation: `Clarity and conciseness evaluation (${rawComm}/25).`,
        strengths: rawComm >= 18 ? ['Clear structure and smooth progression of points.'] : ['Understandable general phrasing.'],
        weaknesses: totalFillerCount > 4 ? [`Contains ${totalFillerCount} filler word hesitations.`] : [],
        improvement: 'Use deliberate pauses instead of verbal fillers.'
      },
      problemSolving: {
        score: rawProblem,
        maxScore: 25,
        explanation: `Analytical breakdown and logical justification (${rawProblem}/25).`,
        strengths: rawProblem >= 18 ? ['Structured logical reasoning.'] : ['Attempted problem breakdown.'],
        weaknesses: rawProblem < 18 ? ['Did not fully explore edge cases or failover strategies.'] : [],
        improvement: 'Apply the STAR method to clearly tie engineering choices to measurable outcomes.'
      },
      deliveryConfidence: {
        score: rawDelivery,
        maxScore: 20,
        label: 'Estimated (Speech Pacing & Articulation)',
        isEstimated: true,
        explanation: `Estimated delivery confidence from speaking pace (${speechAnalytics.wordsPerMinute} WPM) and composure.`,
        strengths: ['Maintained consistent delivery pacing.'],
        weaknesses: speechAnalytics.paceStatus !== 'Optimal' ? [speechAnalytics.paceEvaluation] : [],
        improvement: 'Aim for a steady 120–160 WPM cadence.'
      }
    },
    feedback: {
      whatAnsweredCorrectly: whatCorrect,
      whatWasIncorrect: whatIncorrect,
      missingPoints,
      addressedQuestion,
      addressedQuestionExplanation: addressedExplanation,
      improvementAdvice: [
        'Frame your response using the STAR method: Situation, Task, Action, and Quantified Result.',
        'Explicitly state alternative solutions and why they were rejected.'
      ],
      idealExampleAnswer: `An exemplary senior-level response would clearly state the architectural trade-offs, cite specific mechanisms (such as asynchronous queuing or index selectivity), and validate the decision with concrete latency or throughput metrics.`
    },
    starAnalysis: {
      situation: 'Contextual framework established.',
      task: 'Identified the core engineering requirement.',
      action: 'Outlined technical approach and architectural choices.',
      result: 'Quantified impact and reliability considerations.'
    }
  };

  return sanitizeAndCalculateScores(simulatedGeminiResult, analysis);
};

/**
 * Evaluate candidate transcript and metrics with structured scoring
 */
export const evaluateAnswer = async ({
  question,
  transcript,
  role = 'Full Stack Engineer',
  difficulty = 'Senior',
  type = 'Technical & Behavioral',
  category = 'technical',
  videoMetrics = {},
  durationSeconds = 0,
  fillerWordCount = 0,
  apiKey
}) => {
  // 1. Analyze Fillers and Speech Metrics using boundary and context engine
  const analysis = analyzeFillersAndSpeech(transcript, durationSeconds);

  const gemini = getGeminiClient(apiKey);

  if (gemini && transcript && transcript.trim().length > 10) {
    try {
      const prompt = `You are a calibrated Principal Staff Technical Interview Evaluator.
Evaluate this candidate's spoken interview answer rigorously using the official 4-category project rubric.

INTERVIEW CONTEXT:
- Target Role: ${role}
- Seniority Level: ${difficulty}
- Round Type: ${type}
- Question Category: ${category}
- Question: "${question}"
- Candidate Spoken Transcript: "${transcript}"
- Spoken Metrics: ${analysis.speechAnalytics.totalWords} words spoken, ${analysis.speechAnalytics.wordsPerMinute} WPM, ${analysis.totalFillerCount} filler words detected.
- Video & Composure Metrics: Eye contact ${videoMetrics.eyeContactScore || 85}%, Face Stability: ${videoMetrics.facePresent ? 'Good' : 'Intermittent'}.

EVALUATION RUBRIC SPECIFICATION (Total 100 Raw Points):
1. Technical Accuracy (Max: 30 points):
   - 26–30: Deep architectural correctness, exact domain terminology, cites actual constraints, trade-offs, and accurate engineering mechanisms.
   - 18–25: Core technical concept is correct, but misses minor nuance, edge cases, or practical scale implications.
   - 10–17: Partially correct; contains notable inaccuracies, misconceptions, or hand-wavy generalities.
   - 0–9: Factually wrong, fundamentally flawed, or completely irrelevant.
   CRITICAL RULE: Do NOT give high technical marks simply because the candidate uses technical buzzwords or repeats keywords from the question! An irrelevant or wrong answer MUST receive 0 to 5 points.

2. Communication Clarity (Max: 25 points):
   - 21–25: Crystal clear structure, concise phrasing, logical progression, easy to follow.
   - 15–20: Clear main message, but includes slight rambling or repetitive elaboration.
   - 8–14: Hard to follow, disjointed thoughts, or heavily unstructured.
   - 0–7: Incoherent, off-topic, or barely intelligible.

3. Problem-Solving & Logic (Max: 25 points):
   - 21–25: Systematic breakdown, addresses requirements and edge cases, justifies trade-offs logically.
   - 15–20: Logical progression, but overlooks some boundary conditions or fails to explore alternative solutions.
   - 8–14: Jumps to conclusions without justification or logical structure.
   - 0–7: Illogical, self-contradictory, or non-sequitur reasoning.

4. Delivery & Vocal Confidence (Max: 20 points):
   - Estimated assessment based on textual fluency, sentence pacing (${analysis.speechAnalytics.wordsPerMinute} WPM, ideal is 120-160 WPM), filler rate, and camera composure.
   - Label: "Estimated (Speech Pacing & Articulation)".
   - Score range: 0 to 20 points.

FEEDBACK SPECIFICATION:
Provide specific, personalized feedback including:
- What the candidate answered correctly (cite exact points).
- What was technically incorrect or misleading.
- What important points or concepts were missing.
- Whether the answer actually addressed the question directly (Yes / Partially / No).
- Concrete actionable improvement advice.
- An exemplar 10/10 answer for this specific question and role.

Return ONLY a valid JSON object matching this exact schema:
{
  "rubric": {
    "technicalAccuracy": {
      "score": number, // 0 to 30
      "maxScore": 30,
      "explanation": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "improvement": "string"
    },
    "communicationClarity": {
      "score": number, // 0 to 25
      "maxScore": 25,
      "explanation": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "improvement": "string"
    },
    "problemSolving": {
      "score": number, // 0 to 25
      "maxScore": 25,
      "explanation": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "improvement": "string"
    },
    "deliveryConfidence": {
      "score": number, // 0 to 20
      "maxScore": 20,
      "label": "Estimated (Speech Pacing & Articulation)",
      "isEstimated": true,
      "explanation": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "improvement": "string"
    }
  },
  "feedback": {
    "whatAnsweredCorrectly": "string",
    "whatWasIncorrect": "string",
    "missingPoints": ["string"],
    "addressedQuestion": "Yes" | "Partially" | "No",
    "addressedQuestionExplanation": "string",
    "improvementAdvice": ["string"],
    "idealExampleAnswer": "string"
  },
  "starAnalysis": {
    "situation": "string",
    "task": "string",
    "action": "string",
    "result": "string"
  }
}`;

      const response = await gemini.models.generateContent({
        model: GEMINI_PRIMARY_MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text);
      if (parsed && parsed.rubric && parsed.feedback) {
        return sanitizeAndCalculateScores(parsed, analysis);
      }
    } catch (err) {
      console.warn('Gemini evaluation notice, falling back to calibrated heuristic:', err.message);
    }
  }

  // Calibrated fallback engine
  return evaluateWithCalibratedHeuristic({
    question,
    transcript,
    role,
    difficulty,
    category,
    videoMetrics,
    analysis
  });
};

/**
 * AI Career Mentor conversation agent
 */
export const getMentorResponse = async ({ messages, profile = {}, apiKey, personality }) => {
  const gemini = getGeminiClient(apiKey);

  if (gemini) {
    try {
      const personaDesc = personality || 'an elite executive Career Mentor & Interview Coach';
      const systemInstruction = `You are ${personaDesc}.
Candidate Profile:
- Target Role: ${profile.targetRole || 'Full Stack Engineer'}
- Seniority: ${profile.experience || 'Mid-Senior'}
- Tech Stack: ${profile.techStack || 'React, Node.js, Cloud'}

Provide crisp, encouraging, actionable, and concrete advice. Use markdown formatting, bullet points, and practical phrasing candidates can use verbatim.`;

      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await gemini.models.generateContent({
        model: GEMINI_PRIMARY_MODEL,
        contents,
        config: { systemInstruction }
      });

      return response.text;
    } catch (err) {
      console.warn('Gemini mentor fallback:', err.message);
    }
  }

  // Intelligent fallback responses
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';

  if (lastUserMsg.includes('salary') || lastUserMsg.includes('negotiat')) {
    return `### Strategic Salary Negotiation Playbook

1. **Never Give the First Number**: When asked for expectations, respond: *"I'm focused on finding the right cultural and technical fit first. Once we agree I'm the right engineer for the role, I'm confident we can find a mutually competitive package."*
2. **Anchor on Market Data**: Cite Levels.fyi or Carta data for your target role (${profile.targetRole || 'Software Engineer'}).
3. **Counter with Total Compensation (TC)**: Split between Base, Equity/RSUs, and Sign-on bonus. Always negotiate the sign-on bonus if base salary bands are strict.
4. **Leverage Competing Timelines**: Frame active interview loops politely to accelerate decisions.`;
  }

  if (lastUserMsg.includes('star') || lastUserMsg.includes('behavioral')) {
    return `### Mastering the STAR Framework for Behavioral Rounds

- **Situation (15%)**: Briefly set the context, team size, and stakes. *"At my previous company, our payment service handled 40,000 requests/minute during Black Friday."*
- **Task (15%)**: What was the specific obstacle or mission? *"We faced intermittent 504 timeouts due to connection pool exhaustion."*
- **Action (50%)**: Your personal engineering leadership. Use **"I"**, not "We". *"I profiled pg_stat_activity, implemented read-replica routing, and configured Redis connection pooling."*
- **Result (20%)**: Measurable business impact. *"P99 latency dropped by 65%, preventing an estimated $120k in dropped cart transactions."*`;
  }

  if (lastUserMsg.includes('weakness')) {
    return `### How to Answer "What is Your Greatest Weakness?"

The key is picking a **real habit you are actively optimizing with a systematic solution**:

> *"Early in my career, I had a tendency to over-engineer solutions for hypothetical scale before requirements solidified. I noticed this caused slight delays in delivery.
> 
> To solve this, I adopted a strict YAGNI (You Aren't Gonna Need It) and RFC documentation habit: I now write clear lightweight technical specs, establish minimum viable interfaces, and time-box refactoring only after production metrics warrant it. My manager recently commended my velocity improvement."*`;
  }

  return `### Career Coaching Advice for ${profile.targetRole || 'Software Engineering'}

Great question! Here are 3 key action steps to elevate your preparation right now:

1. **Deepen Core Fundamentals**: Review asynchronous concurrency models, database indexing strategies, and distributed caching invalidation patterns.
2. **Prepare 4 Signature Stories**: Ensure you have ready-to-go STAR stories for:
   - A complex technical achievement
   - A difficult production outage / bug triage
   - A disagreement with product or engineering peers
   - A project delivered under tight deadlines
3. **Practice Live Drills**: Head over to our **Mock Interview Room** and run a 10-minute round with voice and camera analysis to refine your delivery pace!

Would you like me to drill you on a specific technical concept or behavioral prompt?`;
};

/**
 * AI Code Complexity & Optimization Review
 */
export const reviewCodeSubmission = async ({ challengeTitle, code, testResults, apiKey }) => {
  const gemini = getGeminiClient(apiKey);

  if (gemini) {
    try {
      const prompt = `Review this candidate code submission for the challenge "${challengeTitle}".
Code:
\`\`\`javascript
${code}
\`\`\`
Test Results: ${testResults.passedCount}/${testResults.totalCount} passed.

Provide brief code review in JSON:
{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "verdict": "Optimal | Suboptimal | Needs Improvement",
  "review": "2-3 sentences on readability, edge cases and elegance",
  "optimizationTip": "Concrete tip to improve memory or speed"
}`;

      const response = await gemini.models.generateContent({
        model: GEMINI_PRIMARY_MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return JSON.parse(response.text);
    } catch (err) {
      console.warn('Gemini code review fallback:', err.message);
    }
  }

  // Heuristic code review
  const hasMapOrSet = /new (Map|Set)/.test(code);
  const hasNestedLoops = /for\s*\(.*for\s*\(/.test(code.replace(/\s+/g, ' '));

  return {
    timeComplexity: hasNestedLoops ? "O(n²)" : (hasMapOrSet ? "O(n)" : "O(n log n)"),
    spaceComplexity: hasMapOrSet ? "O(n)" : "O(1)",
    verdict: testResults.passedCount === testResults.totalCount ? "Optimal" : "Suboptimal",
    review: testResults.passedCount === testResults.totalCount
      ? "Clean implementation. Good variable naming and handles primary constraints smoothly."
      : "Some edge cases failed. Check empty inputs, negative values, and boundary conditions.",
    optimizationTip: hasNestedLoops
      ? "Avoid quadratic O(n²) loops by using a Hash Map for O(1) lookups."
      : "Ensure memory usage is minimized by avoiding redundant object allocations in loops."
  };
};

/**
 * AI-powered Deep Resume ATS & Role Alignment Analysis
 */
export const analyzeResumeWithGemini = async ({ resumeText, targetRole, apiKey }) => {
  const gemini = getGeminiClient(apiKey);
  if (!gemini || !resumeText || resumeText.length < 50) return null;

  try {
    const prompt = `You are an elite Technical Recruiter and ATS Specialist analyzing a candidate's resume for the role: "${targetRole || 'Full Stack Engineer'}".
Resume Text:
"""
${resumeText.slice(0, 4000)}
"""

Evaluate this resume thoroughly. Return your analysis in JSON format:
{
  "atsScore": number (0 to 100),
  "executiveSummary": "2-3 sentences summarizing candidate profile and fit",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["concrete action item 1", "concrete action item 2", "concrete action item 3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "recommendedActionVerbs": ["verb1", "verb2"],
  "bulletPointRewrites": [
    {
      "original": "example weak or passive bullet from resume",
      "optimized": "high-impact STAR version with metrics"
    }
  ]
}`;

    const response = await gemini.models.generateContent({
      model: GEMINI_PRIMARY_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.warn('Gemini resume analysis fallback:', err.message);
    return null;
  }
};

