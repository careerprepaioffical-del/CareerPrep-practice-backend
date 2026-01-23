const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const Interview = require('../models/Interview');
const Progress = require('../models/Progress');
const User = require('../models/User');
const aiService = require('../services/aiService');
const CodingQuestion = require('../models/CodingQuestion');

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

// Validation for creating interview
const validateCreateInterview = [
  body('type').isIn(['coding']).withMessage('Invalid interview type'),
  body('configuration.duration').optional().isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
  body('configuration.difficulty').optional().isIn(['easy', 'medium', 'hard', 'mixed']).withMessage('Invalid difficulty level'),
  body('configuration.questionTypes').optional().isArray().withMessage('Question types must be an array'),
  body('configuration.numberOfQuestions').optional().isInt({ min: 1, max: 10 }).withMessage('Number of questions must be between 1 and 10')
];

const normalizeQuestionType = (rawType, fallbackType = 'behavioral') => {
  const fallback = String(fallbackType || 'behavioral').trim().toLowerCase();
  const baseFallback = ['coding', 'behavioral', 'technical', 'system-design'].includes(fallback)
    ? fallback
    : 'behavioral';

  const t0 = String(rawType || '').trim().toLowerCase();
  if (!t0) return baseFallback;

  const t = t0.replace(/[\s_]+/g, '-');
  if (t === 'system-design' || t === 'systemdesign' || t === 'system-designs' || t === 'system-design-interview') {
    return 'system-design';
  }
  if (t === 'behavioral' || t === 'behavioural') return 'behavioral';
  if (t === 'technical' || t === 'tech') return 'technical';
  if (t === 'coding' || t === 'code') return 'coding';

  return baseFallback;
};

// Normalize a question object into the Interview.questionSchema shape.
// This prevents Mongoose validation errors when AI output contains arrays/objects.
const normalizeInterviewQuestion = (raw, index = 0, options = {}) => {
  const q = raw && typeof raw === 'object' ? raw : {};
  const fallbackType = options?.fallbackType || 'behavioral';

  const toStr = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.map(toStr).filter(Boolean).join('\n');
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  const normalizedExamples = Array.isArray(q.examples)
    ? q.examples.map((ex) => ({
        input: toStr(ex?.input),
        output: toStr(ex?.output),
        explanation: toStr(ex?.explanation)
      }))
    : [];

  const normalizedTestCases = Array.isArray(q.testCases)
    ? q.testCases.map((tc) => ({
        input: toStr(tc?.input),
        expectedOutput: toStr(tc?.expectedOutput),
        isHidden: Boolean(tc?.isHidden)
      }))
    : [];

  const normalizedStarterCode =
    q.starterCode && typeof q.starterCode === 'object' && !Array.isArray(q.starterCode)
      ? q.starterCode
      : {};

  return {
    id: String(q.id || q.questionId || q._id || `q_${Date.now()}_${index}`),
    type: normalizeQuestionType(q.type, fallbackType),
    difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'easy',
    title: toStr(q.title || 'Coding Question'),
    description: toStr(q.description || q.problem || ''),
    constraints: toStr(q.constraints),
    examples: normalizedExamples,
    testCases: normalizedTestCases,
    starterCode: normalizedStarterCode,
    hints: Array.isArray(q.hints) ? q.hints.map(toStr) : [],
    tags: Array.isArray(q.tags) ? q.tags.map(toStr) : [],
    timeLimit: Number.isFinite(Number(q.timeLimit)) ? Number(q.timeLimit) : 30,
    memoryLimit: toStr(q.memoryLimit || '256MB')
  };
};

// @route   POST /api/interviews
// @desc    Create a new interview session
// @access  Private
router.post('/', 
  authenticateToken, 
  validateCreateInterview, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { type, company, configuration } = req.body;
      const userId = req.user._id;

      // Generate unique session ID
      const sessionId = uuidv4();

      // Create interview record
      const interview = new Interview({
        userId,
        sessionId,
        type,
        company: company || {},
        configuration: {
          duration: 60,
          difficulty: 'mixed',
          questionTypes: ['coding'],
          language: 'javascript',
          numberOfQuestions: 5,
          ...configuration
        },
        status: 'scheduled'
      });

      await interview.save();

      res.status(201).json({
        success: true,
        message: 'Interview session created successfully',
        data: {
          interview,
          sessionId
        }
      });
    } catch (error) {
      console.error('Create interview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create interview session',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Validation for pagination
const validatePaginationQuery = [
  require('express-validator').query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  require('express-validator').query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  require('express-validator').query('status')
    .optional()
    .isIn(['scheduled', 'in_progress', 'completed', 'paused'])
    .withMessage('Invalid status value'),
  require('express-validator').query('type')
    .optional()
    .isIn(['coding', 'behavioral', 'technical', 'system-design', 'ai_interview'])
    .withMessage('Invalid interview type')
];

// @route   GET /api/interviews
// @desc    Get user's interview history
// @access  Private
router.get('/', authenticateToken, validatePaginationQuery, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, type } = req.query;

    // Build filter
    const filter = { userId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    // Calculate pagination with safe integer conversion
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Get interviews with pagination
    const interviews = await Interview.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-questions.testCases -responses.feedback'); // Exclude large fields for list view

    // Get total count for pagination
    const total = await Interview.countDocuments(filter);

    res.json({
      success: true,
      data: {
        interviews,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          hasNext: skip + interviews.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/interviews/:sessionId
// @desc    Get specific interview session
// @access  Private
router.get('/:sessionId', authenticateToken, async (req, res) => {
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

    res.json({
      success: true,
      data: {
        interview
      }
    });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/interviews/:sessionId/start
// @desc    Start an interview session and generate questions
// @access  Private
router.post('/:sessionId/start', authenticateToken, async (req, res) => {
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

    if (interview.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Interview session has already been started or completed'
      });
    }

    const requestedTypes = Array.isArray(interview.configuration?.questionTypes)
      ? interview.configuration.questionTypes
      : [];
    const wantsOnlyCoding = requestedTypes.length > 0 && requestedTypes.every((t) => String(t).toLowerCase() === 'coding');

    // CODING interviews (and coding-only sessions): pick admin-created coding questions (no AI needed)
    if (interview.type === 'coding' || wantsOnlyCoding) {
      const count = Math.max(1, Math.min(10, Number(interview.configuration.numberOfQuestions) || 1));
      const pool = await CodingQuestion.aggregate([{ $sample: { size: count } }]);

      if (!pool || pool.length === 0) {
        return res.status(503).json({
          success: false,
          message: 'No admin coding questions available. Add questions in the admin panel first.'
        });
      }

      interview.questions = pool.map((q, idx) =>
        normalizeInterviewQuestion(
          {
            id: String(q._id),
            type: 'coding',
            difficulty: q.difficulty,
            title: q.title,
            description: q.description,
            constraints: q.constraints,
            examples: q.examples,
            testCases: q.testCases,
            starterCode: q.starterCode,
            hints: q.hints,
            tags: q.tags,
            timeLimit: q.timeLimit,
            memoryLimit: q.memoryLimit
          },
          idx,
          { fallbackType: 'coding' }
        )
      );
    } else {
      // Other interview types: generate questions using AI (unchanged)
      let questions;
      try {
        questions = await aiService.generateInterviewQuestions({
          company: interview.company.name || 'Tech Company',
          role: interview.company.role || 'Software Engineer',
          difficulty: interview.configuration.difficulty,
          questionTypes: interview.configuration.questionTypes,
          count: interview.configuration.numberOfQuestions
        });
      } catch (aiError) {
        const isNotConfigured = String(aiError?.message || '').toLowerCase().includes('not configured');
        return res.status(isNotConfigured ? 503 : 500).json({
          success: false,
          message: isNotConfigured
            ? 'AI is not configured on the server. Set GEMINI_API_KEY to enable question generation.'
            : 'Failed to generate interview questions',
          error: process.env.NODE_ENV === 'development' ? aiError.message : 'Internal server error'
        });
      }

      const rawList = questions?.questions || questions || [];
      const configuredTypes = Array.isArray(interview.configuration?.questionTypes)
        ? interview.configuration.questionTypes
        : [];
      const fallbackType = configuredTypes.length > 0 ? configuredTypes[0] : 'behavioral';
      interview.questions = Array.isArray(rawList)
        ? rawList.map((q, i) => normalizeInterviewQuestion(q, i, { fallbackType }))
        : [];
    }

    interview.status = 'in-progress';
    interview.startTime = new Date();

    await interview.save();

    res.json({
      success: true,
      message: 'Interview session started successfully',
      data: {
        interview,
        currentQuestion: interview.questions[0] || null
      }
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start interview session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/interviews/:sessionId/submit-answer
// @desc    Submit answer for a question
// @access  Private
router.post('/:sessionId/submit-answer',
  authenticateToken,
  [
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('userAnswer').notEmpty().withMessage('User answer is required'),
    body('timeTaken').isInt({ min: 0 }).withMessage('Time taken must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { questionId, userAnswer, code, language, timeTaken } = req.body;
      const userId = req.user._id;

      const interview = await Interview.findOne({ sessionId, userId });

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      if (interview.status !== 'in-progress') {
        return res.status(400).json({
          success: false,
          message: 'Interview session is not in progress'
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

      // Evaluate the answer using AI
      let evaluation = {};
      if (question.type === 'coding' && code) {
        try {
          evaluation = await aiService.evaluateCode({
            code,
            language: language || interview.configuration.language,
            question,
            testCases: question.testCases || []
          });
        } catch (aiError) {
          const isNotConfigured = String(aiError?.message || '').toLowerCase().includes('not configured');
          return res.status(isNotConfigured ? 503 : 500).json({
            success: false,
            message: isNotConfigured
              ? 'AI is not configured on the server. Set GEMINI_API_KEY to enable evaluation.'
              : 'Failed to evaluate code answer',
            error: process.env.NODE_ENV === 'development' ? aiError.message : 'Internal server error'
          });
        }
      } else if (question.type === 'behavioral') {
        try {
          evaluation = await aiService.evaluateBehavioralAnswer({
            question: question.description,
            answer: userAnswer,
            timeSpent: timeTaken
          });
        } catch (aiError) {
          const isNotConfigured = String(aiError?.message || '').toLowerCase().includes('not configured');
          return res.status(isNotConfigured ? 503 : 500).json({
            success: false,
            message: isNotConfigured
              ? 'AI is not configured on the server. Set GEMINI_API_KEY to enable evaluation.'
              : 'Failed to evaluate behavioral answer',
            error: process.env.NODE_ENV === 'development' ? aiError.message : 'Internal server error'
          });
        }
      }

      // Create response record
      const response = {
        questionId,
        userAnswer,
        code: code || null,
        language: language || interview.configuration.language,
        timeTaken,
        isCorrect: evaluation.isCorrect || false,
        testCasesPassed: evaluation.testCasesPassed || 0,
        totalTestCases: question.testCases?.length || 0,
        score: evaluation.score || 0,
        feedback: evaluation.feedback || {},
        submittedAt: new Date()
      };

      interview.responses.push(response);
      await interview.save();

      // Check if all questions are answered
      const nextQuestionIndex = interview.responses.length;
      const nextQuestion = interview.questions[nextQuestionIndex] || null;

      res.json({
        success: true,
        message: 'Answer submitted successfully',
        data: {
          evaluation,
          nextQuestion,
          progress: {
            current: nextQuestionIndex,
            total: interview.questions.length,
            completed: nextQuestionIndex >= interview.questions.length
          }
        }
      });
    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit answer',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/interviews/:sessionId/complete
// @desc    Mark an interview completed and compute scores
// @access  Private
router.post('/:sessionId/complete', authenticateToken, async (req, res) => {
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

    // Compute per-category averages using response.score and question type
    const questionTypeById = new Map((interview.questions || []).map(q => [q.id, q.type]));
    const buckets = {
      technical: [],
      behavioral: [],
      communication: []
    };

    for (const response of interview.responses || []) {
      const score = typeof response.score === 'number' ? response.score : Number(response.score || 0);
      const qType = questionTypeById.get(response.questionId);
      if (qType === 'behavioral') buckets.behavioral.push(score);
      else buckets.technical.push(score);
      buckets.communication.push(score);
    }

    const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length) : 0);

    interview.scores.technical = avg(buckets.technical);
    interview.scores.behavioral = avg(buckets.behavioral);
    interview.scores.communication = avg(buckets.communication);
    interview.calculateOverallScore();

    interview.status = 'completed';
    if (!interview.endTime) interview.endTime = new Date();
    if (interview.startTime && !interview.totalDuration) {
      interview.totalDuration = Math.round((interview.endTime - interview.startTime) / 1000);
    }

    await interview.save();

    const [user, progress] = await Promise.all([
      User.findById(userId),
      Progress.findOne({ userId })
    ]);

    if (progress) {
      const minutes = interview.totalDuration ? Math.round(interview.totalDuration / 60) : 0;
      await progress.updateDailyActivity(new Date(), {
        interviewsCompleted: 1,
        questionsAttempted: interview.responses?.length || 0,
        timeSpent: minutes,
        averageScore: interview.scores.overall
      });

      progress.overallStats.bestScore = Math.max(progress.overallStats.bestScore || 0, interview.scores.overall || 0);
      progress.overallStats.completedInterviews += 1;
      progress.overallStats.totalInterviews += 1;
      progress.overallStats.totalQuestionsAttempted += interview.responses?.length || 0;
      progress.overallStats.totalTimeSpent += minutes;

      const completed = progress.overallStats.completedInterviews || 1;
      const prevAvg = progress.overallStats.averageScore || 0;
      progress.overallStats.averageScore = Math.round(((prevAvg * (completed - 1)) + (interview.scores.overall || 0)) / completed);

      await progress.updateStreak();
      await progress.save();
    }

    if (user) {
      user.stats.totalInterviews += 1;
      user.stats.completedInterviews += 1;
      const completed = user.stats.completedInterviews || 1;
      const prevAvg = user.stats.averageScore || 0;
      user.stats.averageScore = Math.round(((prevAvg * (completed - 1)) + (interview.scores.overall || 0)) / completed);
      if (progress) user.stats.streakDays = progress.overallStats.currentStreak || 0;
      user.stats.lastActiveDate = new Date();
      await user.save();
    }

    return res.json({
      success: true,
      message: 'Interview marked as completed',
      data: {
        interview
      }
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete interview',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
