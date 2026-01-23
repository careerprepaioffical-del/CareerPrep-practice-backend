const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const codeExecutionService = require('../services/codeExecutionService');
const aiService = require('../services/aiService');
const Interview = require('../models/Interview');

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// @route   POST /api/realtime/execute-code
// @desc    Execute code in real-time
// @access  Private
router.post('/execute-code',
  authenticateToken,
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(['javascript', 'python', 'java', 'cpp']).withMessage('Invalid language'),
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('testCases').optional().isArray().withMessage('Test cases must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code, language, sessionId, testCases = [] } = req.body;
      const userId = req.user._id;

      // Verify session belongs to user
      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      // Execute code
      // - JS/Python: run against test cases (our wrapper prints JSON lines per test)
      // - Java/C++: compile/run the program only (ignore test cases)
      const normalizedLanguage = String(language || '').toLowerCase();
      const shouldUseTestCases = ['javascript', 'js', 'python', 'py'].includes(normalizedLanguage);
      const executionResult = await codeExecutionService.executeCode(
        language,
        code,
        shouldUseTestCases ? testCases : []
      );
      
      // Analyze code complexity
      const complexityAnalysis = codeExecutionService.analyzeComplexity(code, language);

      // Emit real-time update via Socket.IO
      const io = req.app.get('io');
      io.to(`interview-${sessionId}`).emit('code-execution-result', {
        sessionId,
        executionResult,
        complexityAnalysis,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: {
          executionResult,
          complexityAnalysis,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Code execution error:', error);
      res.status(500).json({
        success: false,
        message: 'Code execution failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/realtime/live-feedback
// @desc    Get real-time AI feedback on code
// @access  Private
router.post('/live-feedback',
  authenticateToken,
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').notEmpty().withMessage('Language is required'),
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('questionId').notEmpty().withMessage('Question ID is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code, language, sessionId, questionId } = req.body;
      const userId = req.user._id;

      // Verify session
      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      // Find the question
      const question = interview.questions.find(q => q.id === questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      // Get AI feedback
      const feedback = await aiService.evaluateCode({
        code,
        language,
        question,
        testCases: question.testCases || []
      });

      // Emit real-time feedback
      const io = req.app.get('io');
      io.to(`interview-${sessionId}`).emit('live-feedback', {
        sessionId,
        questionId,
        feedback,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: {
          feedback,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Live feedback error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate feedback',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/realtime/typing-indicator
// @desc    Handle typing indicators for collaborative features
// @access  Private
router.post('/typing-indicator',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('isTyping').isBoolean().withMessage('isTyping must be boolean')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId, isTyping } = req.body;
      const userId = req.user._id;
      const userName = req.user.name;

      // Emit typing indicator
      const io = req.app.get('io');
      io.to(`interview-${sessionId}`).emit('typing-indicator', {
        sessionId,
        userId,
        userName,
        isTyping,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Typing indicator sent'
      });

    } catch (error) {
      console.error('Typing indicator error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send typing indicator',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   GET /api/realtime/session-status/:sessionId
// @desc    Get real-time session status
// @access  Private
router.get('/session-status/:sessionId',
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user._id;

      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      // Calculate real-time statistics
      const currentTime = new Date();
      const startTime = interview.startTime;
      const duration = startTime ? Math.floor((currentTime - startTime) / 1000) : 0;
      
      const progress = {
        questionsAnswered: interview.responses.length,
        totalQuestions: interview.questions.length,
        timeElapsed: duration,
        currentQuestionIndex: interview.responses.length,
        completionPercentage: interview.questions.length > 0 
          ? Math.round((interview.responses.length / interview.questions.length) * 100) 
          : 0
      };

      res.json({
        success: true,
        data: {
          sessionId,
          status: interview.status,
          progress,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Session status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get session status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/realtime/save-progress
// @desc    Save interview progress in real-time
// @access  Private
router.post('/save-progress',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('code').optional().isString().withMessage('Code must be a string'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId, questionId, code, notes } = req.body;
      const userId = req.user._id;

      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      // Update or create progress entry
      const progressKey = `progress_${questionId}`;
      if (!interview.metadata) {
        interview.metadata = {};
      }
      
      interview.metadata[progressKey] = {
        code: code || '',
        notes: notes || '',
        lastSaved: new Date()
      };

      await interview.save();

      // Emit progress update
      const io = req.app.get('io');
      io.to(`interview-${sessionId}`).emit('progress-saved', {
        sessionId,
        questionId,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Progress saved successfully',
        data: {
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Save progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save progress',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
