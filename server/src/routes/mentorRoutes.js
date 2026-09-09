import express from 'express';
import { getConversation, sendMessage, validateKey } from '../controllers/mentorController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/conversation', getConversation);
router.post('/messages', sendMessage);
router.post('/validate-key', validateKey);

export default router;
