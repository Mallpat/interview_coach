const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('coach_token');
  const userApiKey = localStorage.getItem('gemini_api_key');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userApiKey) {
    headers['x-gemini-api-key'] = userApiKey;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
};

export const api = {
  // Auth & Profile
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  verifyEmail: async (email, code) => {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    return handleResponse(res);
  },

  resendVerificationCode: async (email) => {
    const res = await fetch(`${API_BASE}/auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  // Dashboard & Analytics
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Mock Interviews
  createInterviewSession: async (sessionConfig) => {
    const res = await fetch(`${API_BASE}/interviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sessionConfig)
    });
    return handleResponse(res);
  },

  getInterviewSession: async (id) => {
    const res = await fetch(`${API_BASE}/interviews/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  submitAnswer: async (sessionId, payload) => {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}/answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  getInterviewHistory: async () => {
    const res = await fetch(`${API_BASE}/interviews/history`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Coding Arena
  getChallenges: async () => {
    const res = await fetch(`${API_BASE}/coding/challenges`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getChallenge: async (id) => {
    const res = await fetch(`${API_BASE}/coding/challenges/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  submitCode: async (payload) => {
    const res = await fetch(`${API_BASE}/coding/submissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Resume ATS & JD Matcher
  analyzeResumeText: async (resumeText, targetRole) => {
    const res = await fetch(`${API_BASE}/resumes/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ resumeText, targetRole })
    });
    return handleResponse(res);
  },

  uploadResumeFile: async (formData) => {
    const res = await fetch(`${API_BASE}/resumes/analyze`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  matchJobDescription: async (payload) => {
    const res = await fetch(`${API_BASE}/resumes/match`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  getUserResumes: async () => {
    const res = await fetch(`${API_BASE}/resumes`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // AI Career Mentor & Custom Gemini API Key
  getMentorConversation: async () => {
    const res = await fetch(`${API_BASE}/mentor/conversation`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  sendMentorMessage: async (content, personality) => {
    const res = await fetch(`${API_BASE}/mentor/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, personality })
    });
    return handleResponse(res);
  },

  validateGeminiKey: async (apiKey) => {
    const res = await fetch(`${API_BASE}/mentor/validate-key`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ apiKey })
    });
    return handleResponse(res);
  }
};
