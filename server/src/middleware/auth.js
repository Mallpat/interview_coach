import jwt from 'jsonwebtoken';
import { db } from '../services/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-interview-coach-super-secret-key-2026';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.findUserById(decoded.userId);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // Invalid token, fall back to demo user if available
    }
  }

  // Seamless demo user fallback for frictionless testing
  const demoUser = db.findUserByEmail('demo@interviewcoach.ai');
  if (demoUser) {
    req.user = demoUser;
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};
