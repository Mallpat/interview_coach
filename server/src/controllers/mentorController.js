import { db } from '../services/db.js';
import { getMentorResponse, validateGeminiKey } from '../services/aiService.js';

export const getConversation = (req, res) => {
  const conv = db.getOrCreateMentorConversation(req.user.id);
  const messages = db.getMentorMessages(conv.id);
  res.json({
    conversation: conv,
    messages
  });
};

export const sendMessage = async (req, res) => {
  try {
    const { content, personality } = req.body;
    const apiKey = req.headers['x-gemini-api-key'] || req.body.apiKey;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conv = db.getOrCreateMentorConversation(req.user.id);
    const profile = db.findProfileByUserId(req.user.id);

    // Save user message
    const userMsg = db.createMentorMessage({
      id: `msg-${Date.now()}-user`,
      conversationId: conv.id,
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    });

    const existingMessages = db.getMentorMessages(conv.id);

    // Generate AI response with custom API key & personality if provided
    const replyText = await getMentorResponse({
      messages: existingMessages,
      profile,
      apiKey,
      personality
    });

    // Save assistant message
    const assistantMsg = db.createMentorMessage({
      id: `msg-${Date.now()}-ai`,
      conversationId: conv.id,
      role: 'assistant',
      content: replyText,
      createdAt: new Date().toISOString()
    });

    res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg
    });

  } catch (err) {
    console.error('Error in mentor chat:', err);
    res.status(500).json({ error: 'Failed to process mentor message' });
  }
};

export const validateKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    const result = await validateGeminiKey(apiKey);
    res.json(result);
  } catch (err) {
    res.status(400).json({ valid: false, error: err.message });
  }
};
