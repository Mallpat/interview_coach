import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { CODING_CHALLENGES } from '../data/challenges.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../database.json');

// Initialize store
let store = {
  users: [],
  profiles: [],
  interview_sessions: [],
  interview_questions: [],
  answers: [],
  feedback: [],
  coding_challenges: [...CODING_CHALLENGES],
  coding_submissions: [],
  resumes: [],
  job_matches: [],
  mentor_conversations: [],
  mentor_messages: [],
  analytics_snapshots: []
};

// Seed default demo user and initial data
const initDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      store = JSON.parse(data);
      if (!store.coding_challenges || store.coding_challenges.length === 0) {
        store.coding_challenges = [...CODING_CHALLENGES];
      }
      return;
    }
  } catch (err) {
    console.error('Error reading DB_FILE, re-initializing...', err);
  }

  // Create demo candidate
  const demoUserId = 'user-demo-123';
  const hashedPassword = bcrypt.hashSync('demo1234', 10);
  
  store.users.push({
    id: demoUserId,
    email: 'demo@interviewcoach.ai',
    passwordHash: hashedPassword,
    name: 'Alex Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  store.profiles.push({
    id: 'profile-demo-123',
    userId: demoUserId,
    targetRole: 'Full Stack Engineer',
    experience: 'Senior (5+ yrs)',
    techStack: 'React, TypeScript, Node.js, Express, PostgreSQL, Redis',
    targetCompany: 'Top Tier Tech / Stripe / Google',
    bio: 'Passionate software engineer preparing for senior full-stack and systems engineering rounds.',
    updatedAt: new Date().toISOString()
  });

  // Seed sample completed interview session
  const sessionId = 'session-sample-1';
  store.interview_sessions.push({
    id: sessionId,
    userId: demoUserId,
    role: 'Full Stack Engineer',
    difficulty: 'Senior',
    type: 'Technical & Architecture',
    status: 'completed',
    startedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    endedAt: new Date(Date.now() - 3600000 * 24 * 3 + 1800000).toISOString()
  });

  store.feedback.push({
    id: 'feedback-sample-1',
    sessionId: sessionId,
    overallScore: 88,
    communication: 86,
    technical: 92,
    confidence: 85,
    nonVerbalScore: 89,
    strengths: JSON.stringify([
      'Strong grasp of distributed systems and caching mechanisms',
      'Articulate explanation of React reconciliation and rendering trade-offs',
      'Consistent eye-contact and confident posture throughout the round'
    ]),
    weaknesses: JSON.stringify([
      'Could provide deeper quantitative metrics when discussing previous project impact',
      'Slight hesitation when discussing edge-case database lock contention'
    ]),
    improvements: JSON.stringify([
      'Practice framing answers tightly using the STAR framework',
      'Mention latency benchmarks (P95/P99) proactively in system design'
    ]),
    starAnalysis: JSON.stringify({
      situation: 'Clearly defined background context and project constraints',
      task: 'Accurately stated engineering objectives and SLA targets',
      action: 'Highlighted individual contributions and technical leadership',
      result: 'Quantified outcomes (40% latency reduction, 99.99% uptime)'
    }),
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  });

  // Sample analytics history
  const dates = [6, 5, 4, 3, 2, 1, 0];
  const scores = [68, 72, 75, 80, 82, 85, 88];
  dates.forEach((d, i) => {
    store.analytics_snapshots.push({
      id: `snapshot-${i}`,
      userId: demoUserId,
      metric: 'readiness',
      value: scores[i],
      recordedAt: new Date(Date.now() - 3600000 * 24 * d).toISOString()
    });
  });

  persistDb();
};

const persistDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write to database.json:', err);
  }
};

initDb();

export const db = {
  // Users
  findUserByEmail: (email) => store.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) => store.users.find(u => u.id === id),
  createUser: (user) => {
    store.users.push(user);
    persistDb();
    return user;
  },

  // Profiles
  findProfileByUserId: (userId) => store.profiles.find(p => p.userId === userId),
  upsertProfile: (userId, profileData) => {
    let profile = store.profiles.find(p => p.userId === userId);
    if (profile) {
      Object.assign(profile, profileData, { updatedAt: new Date().toISOString() });
    } else {
      profile = { id: `profile-${Date.now()}`, userId, ...profileData, updatedAt: new Date().toISOString() };
      store.profiles.push(profile);
    }
    persistDb();
    return profile;
  },

  // Interviews
  createSession: (session) => {
    store.interview_sessions.push(session);
    persistDb();
    return session;
  },
  findSessionById: (id) => store.interview_sessions.find(s => s.id === id),
  findSessionsByUserId: (userId) => store.interview_sessions.filter(s => s.userId === userId).sort((a,b) => new Date(b.startedAt) - new Date(a.startedAt)),
  updateSession: (id, updates) => {
    const session = store.interview_sessions.find(s => s.id === id);
    if (session) {
      Object.assign(session, updates);
      persistDb();
    }
    return session;
  },

  // Questions & Answers
  createQuestion: (question) => {
    store.interview_questions.push(question);
    persistDb();
    return question;
  },
  findQuestionsBySessionId: (sessionId) => store.interview_questions.filter(q => q.sessionId === sessionId).sort((a,b) => a.orderNo - b.orderNo),
  createAnswer: (answer) => {
    store.answers.push(answer);
    persistDb();
    return answer;
  },
  findAnswersBySessionId: (sessionId) => {
    const questions = store.interview_questions.filter(q => q.sessionId === sessionId);
    const qIds = questions.map(q => q.id);
    return store.answers.filter(a => qIds.includes(a.questionId));
  },

  // Feedback
  createFeedback: (feedback) => {
    store.feedback.push(feedback);
    persistDb();
    return feedback;
  },
  findFeedbackBySessionId: (sessionId) => store.feedback.find(f => f.sessionId === sessionId),

  // Coding Challenges
  getAllChallenges: () => store.coding_challenges,
  findChallengeById: (id) => store.coding_challenges.find(c => c.id === id || c.slug === id),
  createSubmission: (submission) => {
    store.coding_submissions.push(submission);
    persistDb();
    return submission;
  },
  findSubmissionsByUserId: (userId) => store.coding_submissions.filter(s => s.userId === userId).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt)),

  // Resumes & Matching
  createResume: (resume) => {
    store.resumes.push(resume);
    persistDb();
    return resume;
  },
  findResumesByUserId: (userId) => store.resumes.filter(r => r.userId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),
  findResumeById: (id) => store.resumes.find(r => r.id === id),
  createJobMatch: (jobMatch) => {
    store.job_matches.push(jobMatch);
    persistDb();
    return jobMatch;
  },
  findJobMatchesByResumeId: (resumeId) => store.job_matches.filter(j => j.resumeId === resumeId),

  // Mentor Chat
  getOrCreateMentorConversation: (userId) => {
    let conv = store.mentor_conversations.find(c => c.userId === userId);
    if (!conv) {
      conv = {
        id: `mentor-conv-${Date.now()}`,
        userId,
        title: 'Career & Interview Strategy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.mentor_conversations.push(conv);
      // Welcome message from AI
      store.mentor_messages.push({
        id: `msg-${Date.now()}`,
        conversationId: conv.id,
        role: 'assistant',
        content: "Hello! I am your AI Career Mentor. I'm here 24/7 to help you refine your STAR behavioral stories, practice tricky technical answers, review salary negotiations, or prepare for specific company tracks. How can I help you today?",
        createdAt: new Date().toISOString()
      });
      persistDb();
    }
    return conv;
  },
  getMentorMessages: (conversationId) => store.mentor_messages.filter(m => m.conversationId === conversationId).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)),
  createMentorMessage: (message) => {
    store.mentor_messages.push(message);
    persistDb();
    return message;
  },

  // Analytics Snapshots
  recordAnalyticsSnapshot: (userId, metric, value) => {
    const snap = {
      id: `snapshot-${Date.now()}`,
      userId,
      metric,
      value,
      recordedAt: new Date().toISOString()
    };
    store.analytics_snapshots.push(snap);
    persistDb();
    return snap;
  },
  getAnalyticsByUserId: (userId) => store.analytics_snapshots.filter(s => s.userId === userId)
};
