import { GoogleGenAI } from '@google/genai';
import { QUESTION_BANK } from '../data/questions.js';

const getGeminiClient = (customApiKey) => {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Validate a user-provided Gemini API key
 */
export const validateGeminiKey = async (apiKey) => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is empty');
  }
  const start = Date.now();
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping test. Reply with OK.',
      config: { maxOutputTokens: 10 }
    });
    const latencyMs = Date.now() - start;
    return { 
      valid: true, 
      model: 'gemini-2.5-flash',
      latencyMs,
      response: response.text?.trim() || 'OK' 
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
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text);
      if (parsed.question) return parsed;
    } catch (err) {
      console.warn('Gemini question generation fallback:', err.message);
    }
  }

  // Resilient fallback using domain question banks
  const bank = QUESTION_BANK[role] || QUESTION_BANK["Full Stack Engineer"];
  const selected = bank[(questionIndex - 1) % bank.length];

  return {
    question: selected.question,
    category: selected.category,
    coachTip: "Focus on clear communication, structured reasoning (STAR method), and quantitative metrics."
  };
};

/**
 * Evaluate candidate transcript and metrics with structured scoring
 */
export const evaluateAnswer = async ({ question, transcript, role, difficulty, category, videoMetrics = {}, fillerWordCount = 0, apiKey }) => {
  const gemini = getGeminiClient(apiKey);

  if (gemini && transcript && transcript.trim().length > 15) {
    try {
      const prompt = `You are an expert Interview Evaluator. Evaluate this candidate response for a ${difficulty} ${role} role.
Question: "${question}"
Category: ${category}
Candidate Spoken Transcript: "${transcript}"
Non-verbal metrics: Eye contact ${videoMetrics.eyeContactScore || 85}%, Face stability ${videoMetrics.facePresent ? 'Good' : 'Intermittent'}.
Filler words detected: ${fillerWordCount}

Provide structured evaluation in JSON with realistic scores (0-100):
{
  "overallScore": number,
  "communication": number,
  "technical": number,
  "confidence": number,
  "nonVerbalScore": number,
  "strengths": ["string", "string"],
  "weaknesses": ["string"],
  "improvements": ["string", "string"],
  "starAnalysis": {
    "situation": "string assessment",
    "task": "string assessment",
    "action": "string assessment",
    "result": "string assessment"
  },
  "idealAnswerSummary": "string explanation of a 10/10 answer"
}`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const result = JSON.parse(response.text);
      return result;
    } catch (err) {
      console.warn('Gemini answer evaluation fallback:', err.message);
    }
  }

  // Heuristic rule-based evaluation engine
  const wordCount = transcript ? transcript.trim().split(/\s+/).length : 0;
  const hasStarWords = /(situation|task|action|result|because|impact|delivered|metric|percent|reduced|increased|led|team)/i.test(transcript);
  const technicalKeywords = /(architecture|react|node|database|cache|redis|postgres|concurrency|async|api|performance|p99|scale)/i.test(transcript);

  let commScore = Math.min(65 + Math.min(wordCount, 60) * 0.4 - Math.min(fillerWordCount * 2, 15), 95);
  let techScore = technicalKeywords ? 88 : 72;
  let confScore = videoMetrics.eyeContactScore ? Math.round(videoMetrics.eyeContactScore) : 84;
  let overall = Math.round((commScore * 0.35) + (techScore * 0.45) + (confScore * 0.2));

  return {
    overallScore: Math.max(overall, 65),
    communication: Math.round(commScore),
    technical: techScore,
    confidence: confScore,
    nonVerbalScore: videoMetrics.eyeContactScore || 85,
    strengths: [
      wordCount > 30 ? "Good depth of response and relevant technical articulation." : "Direct and concise response.",
      hasStarWords ? "Good structure and awareness of impact." : "Confident tone and steady delivery."
    ],
    weaknesses: [
      fillerWordCount > 3 ? `Noticed ${fillerWordCount} filler words ("um", "like"). Work on pauses instead of fillers.` : "Could substantiate points with more measurable business outcomes."
    ],
    improvements: [
      "Use the STAR method explicitly: Situation -> Task -> Action -> Quantifiable Result.",
      "Highlight trade-offs and alternative solutions to show architectural maturity."
    ],
    starAnalysis: {
      situation: "Contextual setting described.",
      task: "Core engineering task identified.",
      action: "Technical choices highlighted.",
      result: "Could strengthen the quantified outcome."
    },
    idealAnswerSummary: "A top-tier response directly answers the core question, outlines architectural trade-offs, and validates the solution with real-world metrics (e.g. latency, throughput, error rates)."
  };
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
        model: 'gemini-2.5-flash',
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
        model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.warn('Gemini resume analysis fallback:', err.message);
    return null;
  }
};

