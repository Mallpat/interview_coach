import { db } from '../services/db.js';
import { parsePdfBuffer, analyzeResumeContent, matchResumeWithJD } from '../services/resumeService.js';

export const analyzeResume = async (req, res) => {
  try {
    let text = '';
    let fileName = 'Pasted_Resume.txt';

    if (req.file) {
      fileName = req.file.originalname;
      if (req.file.mimetype === 'application/pdf') {
        text = await parsePdfBuffer(req.file.buffer);
      } else {
        text = req.file.buffer.toString('utf8');
      }
    } else if (req.body.resumeText) {
      text = req.body.resumeText;
      fileName = req.body.fileName || 'Pasted_Resume.txt';
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'Resume text is too short or could not be extracted.' });
    }

    const targetRole = req.body.targetRole || 'Full Stack Engineer';
    const analysis = analyzeResumeContent(text, targetRole);

    const savedResume = db.createResume({
      id: `resume-${Date.now()}`,
      userId: req.user.id,
      fileName,
      extractedText: text,
      sectionsJson: JSON.stringify(analysis.sectionBreakdown),
      atsScore: analysis.atsScore,
      atsFeedback: JSON.stringify({
        strengths: analysis.strengths,
        improvements: analysis.improvements
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    db.recordAnalyticsSnapshot(req.user.id, 'ats_score', analysis.atsScore);

    res.json({
      resume: savedResume,
      analysis
    });
  } catch (err) {
    console.error('Error analyzing resume:', err);
    res.status(500).json({ error: err.message || 'Failed to parse and analyze resume' });
  }
};

export const matchJob = (req, res) => {
  try {
    const { resumeId, resumeText, jdText, jobTitle = 'Software Engineer' } = req.body;

    let textToMatch = resumeText;
    if (resumeId) {
      const resume = db.findResumeById(resumeId);
      if (resume) textToMatch = resume.extractedText;
    }

    if (!textToMatch || !jdText) {
      return res.status(400).json({ error: 'Both resume content and Job Description text are required.' });
    }

    const matchResult = matchResumeWithJD(textToMatch, jdText, jobTitle);

    if (resumeId) {
      db.createJobMatch({
        id: `match-${Date.now()}`,
        resumeId,
        jobTitle,
        jdText,
        matchScore: matchResult.matchScore,
        matchedSkills: JSON.stringify(matchResult.matchedSkills),
        missingSkills: JSON.stringify(matchResult.missingSkills),
        insights: JSON.stringify(matchResult.recommendations),
        createdAt: new Date().toISOString()
      });
    }

    res.json(matchResult);
  } catch (err) {
    console.error('Error matching job description:', err);
    res.status(500).json({ error: 'Failed to perform job match' });
  }
};

export const getUserResumes = (req, res) => {
  const resumes = db.findResumesByUserId(req.user.id);
  res.json(resumes.map(r => ({
    id: r.id,
    fileName: r.fileName,
    atsScore: r.atsScore,
    createdAt: r.createdAt
  })));
};
