import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import codingRoutes from './routes/codingRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { registerInterviewSockets } from './sockets/interviewSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Interview Coach Backend API',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? 'Gemini 3.6 Flash' : 'Smart Heuristic Engine'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/analytics', analyticsRoutes);

// Register WebSockets
registerInterviewSockets(io);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 AI Interview Coach Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server active for real-time interview coaching`);
  console.log(`🧠 AI Engine: ${process.env.GEMINI_API_KEY ? 'Connected to Gemini API' : 'Resilient Heuristic Fallback'}`);
  console.log(`=======================================================`);
});
