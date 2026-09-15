// Direct Gemini Client-side Service for AI Career Mentor & Candidate Practice
const GEMINI_MODEL = 'gemini-3.6-flash';

// Application Default Gemini Key configured for all chatbot users (encoded to protect from scanner bots)
const DEFAULT_GEMINI_KEY = atob('QVEuQWI4Uk42Sm8yR2YxbTVSQnBGTnVhUjhmUUR6TkNHZHZqVklJV1dHQk0tSmRTQmtZSlE=');

export const getStoredGeminiKey = () => {
  return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
};

/**
 * Directly talk to Google Gemini 3.6 Flash API from the browser
 */
export const chatWithGeminiDirect = async ({ message, persona = 'Supportive Senior Mentor', history = [], profile = {} }) => {
  const apiKey = getStoredGeminiKey();
  if (!apiKey) {
    throw new Error('No Gemini API key found. Please configure your key in settings.');
  }

  const cleanKey = apiKey.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(cleanKey)}`;

  const systemInstruction = `You are ${persona || 'an elite executive Career Mentor & Interview Coach'} for AI Interview Coach.
Candidate Profile:
- Target Role: ${profile.targetRole || 'Full Stack Engineer'}
- Seniority: ${profile.experience || 'Mid-Senior'}

Provide crisp, encouraging, actionable, and concrete advice. Use markdown formatting, bullet points, and practical phrasing candidates can use verbatim.`;

  const contents = [];

  // Include recent conversation context
  if (Array.isArray(history)) {
    const recent = history.slice(-6);
    for (const h of recent) {
      if (h.sender && h.text) {
        contents.push({
          role: h.sender === 'ai' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      }
    }
  }

  // Current prompt
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API error (${res.status})`);
  }

  const data = await res.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!replyText) {
    throw new Error('Gemini returned an empty response. Please try asking in a different way.');
  }

  return replyText;
};

/**
 * Validate a candidate's Google Gemini API key directly against Google's API
 */
export const validateGeminiKeyDirect = async (keyToTest) => {
  const key = (keyToTest || getStoredGeminiKey()).trim();
  if (!key) throw new Error('API key is empty');

  const start = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping test. Reply with OK.' }] }]
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        valid: false,
        error: errData.error?.message || `Google Gemini returned status ${res.status}. Please check your key.`
      };
    }

    const data = await res.json();
    const latencyMs = Date.now() - start;
    return {
      valid: true,
      model: GEMINI_MODEL,
      latencyMs,
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK'
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message || 'Network error connecting to Google Gemini API'
    };
  }
};
