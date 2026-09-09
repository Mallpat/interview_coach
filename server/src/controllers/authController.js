import bcrypt from 'bcryptjs';
import { db } from '../services/db.js';
import { generateToken } from '../middleware/auth.js';
import { syncUserToFirestore } from '../services/firebase.js';

export const register = async (req, res) => {
  const { email, password, name, targetRole, experience, techStack } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = db.createUser({
    id: `user-${Date.now()}`,
    email,
    passwordHash: hashedPassword,
    name,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    emailVerified: false,
    verificationCode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const profile = db.upsertProfile(user.id, {
    targetRole: targetRole || 'Full Stack Engineer',
    experience: experience || 'Mid-Level (2-4 yrs)',
    techStack: techStack || 'React, Node.js, TypeScript',
    targetCompany: 'Top Tech'
  });

  // Sync with Firebase Firestore
  await syncUserToFirestore(user, profile);

  const token = generateToken(user.id);
  const { passwordHash, ...userSafe } = user;

  res.status(201).json({
    token,
    user: userSafe,
    profile,
    verificationCode // Included for seamless testing in demo
  });
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Allow either exact code or demo universal bypass '123456'
  if (user.verificationCode !== code && code !== '123456') {
    return res.status(400).json({ error: 'Invalid verification code. Try 123456 or check your code.' });
  }

  user.emailVerified = true;
  user.verificationCode = null;
  user.updatedAt = new Date().toISOString();

  const profile = db.findProfileByUserId(user.id);
  await syncUserToFirestore(user, profile);

  const { passwordHash, ...userSafe } = user;
  res.json({
    success: true,
    message: 'Email verified successfully!',
    user: userSafe
  });
};

export const resendCode = (req, res) => {
  const { email } = req.body;
  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = newCode;
  user.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Verification code resent to ${email}`,
    verificationCode: newCode
  });
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.findUserByEmail(email);
  if (!user) {
    // Return friendly message even if not found to avoid user enumeration
    return res.json({ success: true, message: 'If an account exists, a password reset link has been sent.' });
  }

  res.json({
    success: true,
    message: `Password reset instructions sent to ${email}`
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const profile = db.findProfileByUserId(user.id);
  const token = generateToken(user.id);

  // Sync login status with Firebase
  await syncUserToFirestore(user, profile);

  const { passwordHash, ...userSafe } = user;

  res.json({
    token,
    user: userSafe,
    profile
  });
};

export const getMe = (req, res) => {
  const profile = db.findProfileByUserId(req.user.id);
  const { passwordHash, ...userSafe } = req.user;
  res.json({
    user: userSafe,
    profile
  });
};

export const updateProfile = async (req, res) => {
  const profile = db.upsertProfile(req.user.id, req.body);
  await syncUserToFirestore(req.user, profile);
  res.json(profile);
};
