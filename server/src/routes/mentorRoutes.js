import express from 'express';
import { getConversation, sendMessage, validateKey } from '../controllers/mentorController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Allow API key validation to be called without prior authentication
router.post('/validate-key', validateKey);

router.use(authenticate);

router.get('/conversation', getConversation);
router.post('/messages', sendMessage);

export default router;

