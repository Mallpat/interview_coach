import express from 'express';
import multer from 'multer';
import { analyzeResume, matchJob, getUserResumes } from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

router.use(authenticate);

router.post('/analyze', upload.single('resumeFile'), analyzeResume);
router.post('/match', matchJob);
router.get('/', getUserResumes);

export default router;
