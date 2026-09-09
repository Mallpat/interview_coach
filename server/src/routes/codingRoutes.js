import express from 'express';
import { listChallenges, getChallenge, submitSolution } from '../controllers/codingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/challenges', listChallenges);
router.get('/challenges/:id', getChallenge);
router.post('/submissions', submitSolution);

export default router;
