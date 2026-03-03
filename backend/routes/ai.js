const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireSubscription } = require('../middleware/auth');
const aiService = require('../services/aiService');

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

// Validation for question generation
const validateQuestionGeneration = [
  body('company').notEmpty().withMessage('Company is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('difficulty').isIn(['easy', 'medium', 'hard', 'mixed']).withMessage('Invalid difficulty level'),
  body('questionTypes').isArray().withMessage('Question types must be an array'),
  body('count').optional().isInt({ min: 1, max: 10 }).withMessage('Count must be between 1 and 10')
];

// Validation for code evaluation
const validateCodeEvaluation = [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript']).withMessage('Invalid language'),
  body('question').isObject().withMessage('Question object is required'),
  body('testCases').optional().isArray().withMessage('Test cases must be an array')
];

// Validation for behavioral evaluation
const validateBehavioralEvaluation = [
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('timeSpent').isInt({ min: 0 }).withMessage('Time spent must be a positive integer')
];

// @route   POST /api/ai/generate-questions
// @desc    Generate interview questions using AI
// @access  Private
router.post('/generate-questions', 
  authenticateToken, 
  validateQuestionGeneration, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { company, role, difficulty, questionTypes, count } = req.body;

      const questions = await aiService.generateInterviewQuestions({
        company,
        role,
        difficulty,
        questionTypes,
        count: count || 5
      });

      res.json({
        success: true,
        message: 'Questions generated successfully',
        data: {
          questions,
          metadata: {
            company,
            role,
            difficulty,
            questionTypes,
            generatedAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Generate questions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate questions',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/ai/evaluate-code
// @desc    Evaluate code solution using AI
// @access  Private
router.post('/evaluate-code', 
  authenticateToken, 
  validateCodeEvaluation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { code, language, question, testCases } = req.body;

      const evaluation = await aiService.evaluateCode({
        code,
        language,
        question,
        testCases: testCases || []
      });

      res.json({
        success: true,
        message: 'Code evaluated successfully',
        data: {
          evaluation,
          metadata: {
            language,
            evaluatedAt: new Date().toISOString(),
            codeLength: code.length
          }
        }
      });
    } catch (error) {
      console.error('Evaluate code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to evaluate code',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/ai/evaluate-behavioral
// @desc    Evaluate behavioral answer using AI
// @access  Private
router.post('/evaluate-behavioral', 
  authenticateToken, 
  validateBehavioralEvaluation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { question, answer, timeSpent } = req.body;

      const evaluation = await aiService.evaluateBehavioralAnswer({
        question,
        answer,
        timeSpent
      });

      res.json({
        success: true,
        message: 'Behavioral answer evaluated successfully',
        data: {
          evaluation,
          metadata: {
            evaluatedAt: new Date().toISOString(),
            answerLength: answer.length,
            timeSpent
          }
        }
      });
    } catch (error) {
      console.error('Evaluate behavioral answer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to evaluate behavioral answer',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/ai/preparation-guide
// @desc    Generate personalized preparation guide
// @access  Private (Premium feature)
router.post('/preparation-guide', 
  authenticateToken, 
  requireSubscription('premium'),
  [
    body('company').notEmpty().withMessage('Company is required'),
    body('role').notEmpty().withMessage('Role is required')
  ],
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { company, role } = req.body;
      const user = req.user;

      const guide = await aiService.generatePreparationGuide({
        company,
        role,
        userProfile: user.profile,
        experience: user.profile.experience
      });

      res.json({
        success: true,
        message: 'Preparation guide generated successfully',
        data: {
          guide,
          metadata: {
            company,
            role,
            generatedAt: new Date().toISOString(),
            userExperience: user.profile.experience
          }
        }
      });
    } catch (error) {
      console.error('Generate preparation guide error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate preparation guide',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/ai/personalized-feedback
// @desc    Generate personalized feedback based on user performance
// @access  Private
router.post('/personalized-feedback', 
  authenticateToken, 
  async (req, res) => {
    try {
      const user = req.user;
      const { recentPerformance, skillGaps } = req.body;

      const feedback = await aiService.generatePersonalizedFeedback({
        userStats: user.stats,
        recentPerformance: recentPerformance || [],
        skillGaps: skillGaps || []
      });

      res.json({
        success: true,
        message: 'Personalized feedback generated successfully',
        data: {
          feedback,
          metadata: {
            generatedAt: new Date().toISOString(),
            userLevel: user.profile.experience
          }
        }
      });
    } catch (error) {
      console.error('Generate personalized feedback error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate personalized feedback',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/ai/follow-up-questions
// @desc    Generate follow-up questions based on user's answer
// @access  Private
router.post('/follow-up-questions', 
  authenticateToken, 
  [
    body('originalQuestion').notEmpty().withMessage('Original question is required'),
    body('userAnswer').notEmpty().withMessage('User answer is required'),
    body('questionType').isIn(['coding', 'behavioral', 'technical', 'system-design']).withMessage('Invalid question type')
  ],
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { originalQuestion, userAnswer, questionType } = req.body;

      const followUpQuestions = await aiService.generateFollowUpQuestions({
        originalQuestion,
        userAnswer,
        questionType
      });

      res.json({
        success: true,
        message: 'Follow-up questions generated successfully',
        data: {
          followUpQuestions,
          metadata: {
            originalQuestionType: questionType,
            generatedAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Generate follow-up questions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate follow-up questions',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
