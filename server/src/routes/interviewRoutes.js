import express from 'express';
import { createSession, getSession, submitAnswer, getHistory } from '../controllers/interviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createSession);
router.get('/history', getHistory);
router.get('/:id', getSession);
router.post('/:id/answer', submitAnswer);

export default router;
