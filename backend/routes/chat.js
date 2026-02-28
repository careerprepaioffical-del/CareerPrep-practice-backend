const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');
const aiService = require('../services/aiService');

const router = express.Router();

// POST /api/chat/send - Send a message to the chatbot and store the conversation
router.post('/send', authenticateToken, [
  body('message').notEmpty().withMessage('Message is required'),
  body('sessionId').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { message, sessionId } = req.body;
  const userId = req.user._id;

  // Store user message
  await ChatMessage.create({ userId, role: 'user', message, sessionId });

  // Get bot response from Gemini
  let botReply = 'Sorry, I could not process your request at the moment. Please try again or ask something else.';
  try {
    const aiResponse = await aiService.generateJson({
      system: 'You are a helpful interview and career chatbot. Answer user questions clearly and helpfully.',
      prompt: message,
      temperature: 0.7,
      maxTokens: 1024
    });
    botReply = aiResponse?.answer || aiResponse?.response || JSON.stringify(aiResponse);
  } catch (e) {
    botReply = 'I am having trouble connecting to the AI service right now. Please try again in a few moments.';
  }

  // Store bot reply
  await ChatMessage.create({ userId, role: 'bot', message: botReply, sessionId });

  res.json({ success: true, reply: botReply });
});

// GET /api/chat/history - Get chat history for a user (optionally by session)
router.get('/history', authenticateToken, async (req, res) => {
  const { sessionId } = req.query;
  const userId = req.user._id;
  const filter = { userId };
  if (sessionId) filter.sessionId = sessionId;
  const history = await ChatMessage.find(filter).sort({ timestamp: 1 });
  res.json({ success: true, history });
});

module.exports = router;
