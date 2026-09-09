# 🎯 AI Interview Coach — Comprehensive Full-Stack Platform

An intelligent, end-to-end career preparation platform for technical, behavioral, and coding interviews. Built with **React 19**, **Node.js + Express**, **Prisma ORM (PostgreSQL & SQLite Dual-Mode)**, **Web Speech API**, **WebRTC Computer Vision Metrics**, **Monaco Editor Sandbox**, **Resume ATS Analyzer**, **JD Matcher**, and **Google Gemini AI Orchestration**.

---

## 🌟 Core Features

- **Live AI Mock Interview Room**:
  - Role-specific question generation (Full Stack, Frontend, Backend, AI/ML, DevOps, System Design).
  - Speech-to-Text dictation with live filler word detection ("um", "like", "basically").
  - AI coach voice reading questions aloud via browser `SpeechSynthesis`.
  - Computer vision non-verbal cues: Face presence, Gaze stability (eye-contact score), and Posture alignment.
  - Comprehensive post-interview scorecard with **STAR method** (Situation, Task, Action, Result) breakdown, strengths, and actionable improvements.
- **Live Coding Arena**:
  - Integrated **Monaco Code Editor** with syntax highlighting and automatic layout.
  - LeetCode-style technical challenges (Two Sum, Valid Parentheses, Longest Substring, Merge Intervals, Debounce).
  - Sandboxed execution runner with automated test cases, memory/time limits, and console output.
  - AI Code Complexity Review: Analyzes Time Complexity $O(n)$, Space Complexity $O(1)$, edge cases, and optimization tips.
- **Resume ATS Analyzer & Job Description Matcher**:
  - Scans resume text or PDF for ATS compatibility (0-100%).
  - Detects key sections (Summary, Experience, Skills, Education, Projects).
  - Detects high-impact action verbs and quantifiable business metrics.
  - Compares resume against any target Job Description (e.g. Stripe, Google) with matched skills, missing keywords, and custom interview talking points.
- **24/7 AI Career Mentor**:
  - Contextual conversational advisor retaining your target role, experience, and weak areas.
  - Quick-drill prompts for salary negotiation, difficult behavioral questions, and system design roadmaps.
- **Longitudinal Analytics & Performance Engine**:
  - Recharts radar chart mapping multi-dimensional competency distribution.
  - Historical score progression area chart tracking readiness over time.
  - Categorical competency breakdown and priority improvement checklist.

---

## 🛠️ Architecture & Tech Stack

```
ai-interview-coach/
├── client/                     # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/         # Glassmorphism cards, score dials, HUD overlays
│   │   ├── layouts/            # Sidebar, Header, Breadcrumbs
│   │   ├── pages/              # Dashboard, Interview, Coding, Resume, Mentor, Analytics, Profile
│   │   ├── hooks/              # useSpeechRecognition, useSpeechSynthesis, useCameraVision
│   │   ├── services/           # REST API client
│   │   └── context/            # AuthContext and state management
├── server/                     # Node.js + Express API & WebSocket Server
│   ├── prisma/
│   │   └── schema.prisma       # Complete relational database models
│   ├── src/
│   │   ├── controllers/        # Auth, Interview, Coding, Resume, Mentor, Analytics
│   │   ├── services/           # AIService (Gemini), CodeRunner, ResumeParser, DB
│   │   ├── routes/             # REST endpoints (/api/*)
│   │   ├── sockets/            # Socket.IO live interview coaching events
│   │   └── data/               # Built-in questions and coding challenges
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### 1. Start the Backend API & Socket Server
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Start the Frontend (Vite)
```bash
cd client
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

### 3. Configure Gemini AI (Optional)
Create a `.env` file in `server/` with:
```env
PORT=5000
JWT_SECRET=ai-interview-coach-super-secret-key-2026
GEMINI_API_KEY=your_google_gemini_api_key
```
*Note: If no Gemini API key is provided, the platform seamlessly uses its built-in intelligent heuristic engine, so every feature works out-of-the-box.*

---

## 🔒 Security & Sandboxing

- **Candidate Code Execution**: Code submissions are executed inside a dedicated, isolated `vm` context with strict timeouts (3500ms), disallowing access to `process`, `fs`, `network`, or sensitive globals.
- **API Hardening**: CORS origin control, sanitized inputs, and hashed passwords with `bcryptjs`.
- **Privacy First**: Audio and video analysis run client-side in the browser; only aggregated telemetry is sent to the server.
