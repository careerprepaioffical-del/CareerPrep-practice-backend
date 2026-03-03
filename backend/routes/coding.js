const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const Interview = require('../models/Interview');
const Progress = require('../models/Progress');
const User = require('../models/User');
const codeExecutionService = require('../services/codeExecutionService');

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

const ALLOWED_LANGUAGES = ['javascript', 'python', 'java', 'cpp'];
const TEST_CASE_LANGUAGES = ['javascript', 'js', 'python', 'py', 'java', 'cpp'];

const pickCodingQuestion = (interview) => {
  if (!interview || !Array.isArray(interview.questions)) return null;
  return interview.questions.find(q => q.type === 'coding') || interview.questions[0] || null;
};

const sanitizeQuestionForClient = (question) => {
  if (!question) return null;

  const plain = typeof question.toObject === 'function' ? question.toObject() : question;
  const testCases = Array.isArray(plain.testCases) ? plain.testCases : [];

  return {
    ...plain,
    testCases: testCases
      .filter(tc => !tc?.isHidden)
      .map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: false
      }))
  };
};

// @route   GET /api/coding/session/:sessionId
// @desc    Get coding question + public test case counts for a session
// @access  Private
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
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

    const question = pickCodingQuestion(interview);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'No coding question found for this session'
      });
    }

    const all = Array.isArray(question.testCases) ? question.testCases : [];
    const visible = all.filter(tc => !tc?.isHidden);

    return res.json({
      success: true,
      data: {
        sessionId,
        interviewType: interview.type,
        language: interview.configuration?.language || 'javascript',
        question: sanitizeQuestionForClient(question),
        testCaseCounts: {
          total: all.length,
          visible: visible.length,
          hidden: all.length - visible.length
        }
      }
    });
  } catch (error) {
    console.error('Get coding session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get coding session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/coding/execute
// @desc    Execute code with test cases
// @access  Private
router.post('/execute',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(ALLOWED_LANGUAGES).withMessage('Invalid language'),
    body('testCases').optional().isArray().withMessage('Test cases must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId, questionId, code, language } = req.body;
      const userId = req.user._id;

      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      if (interview.status === 'completed') {
        const existingResponse = Array.isArray(interview.responses)
          ? interview.responses.find((response) => response.questionId === questionId)
          : null;

        return res.json({
          success: true,
          message: 'Solution already submitted',
          data: {
            sessionId,
            questionId,
            finalScore: interview.scores?.overall ?? existingResponse?.score ?? 0,
            rating: existingResponse?.feedback?.overall || 'Completed',
            testsPassed: existingResponse?.testCasesPassed,
            totalTests: existingResponse?.totalTestCases,
            timeElapsed: existingResponse?.timeTaken,
            submittedAt: existingResponse?.submittedAt || interview.endTime,
            idempotent: true
          }
        });
      }

      const question = Array.isArray(interview.questions)
        ? interview.questions.find(q => q.id === questionId)
        : null;

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      const normalizedLanguage = String(language || '').toLowerCase();

      const testCases = Array.isArray(question.testCases) ? question.testCases : [];
      const shouldUseTestCases = TEST_CASE_LANGUAGES.includes(normalizedLanguage);

      const start = Date.now();
      const executionResult = await codeExecutionService.executeCode(
        normalizedLanguage,
        code,
        shouldUseTestCases ? testCases : []
      );
      const executionTimeMs = Date.now() - start;

      const complexityAnalysis = codeExecutionService.analyzeComplexity(code, normalizedLanguage);

      if (!executionResult.success) {
        return res.status(400).json({
          success: false,
          message: executionResult.error || 'Code execution failed',
          data: {
            ...executionResult,
            executionTimeMs,
            complexityAnalysis
          }
        });
      }

      return res.json({
        success: true,
        data: {
          ...executionResult,
          executionTimeMs,
          complexityAnalysis
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

// @route   GET /api/coding/progress/:sessionId
// @desc    Get saved coding progress for a session (optionally filtered by questionId)
// @access  Private
router.get('/progress/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId } = req.query;
    const userId = req.user._id;

    const interview = await Interview.findOne({ sessionId, userId });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    const codingProgress = interview.config?.codingProgress || {};
    if (questionId) {
      return res.json({
        success: true,
        data: {
          sessionId,
          questionId,
          progress: codingProgress[questionId] || null
        }
      });
    }

    return res.json({
      success: true,
      data: {
        sessionId,
        progress: codingProgress
      }
    });
  } catch (error) {
    console.error('Get coding progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get coding progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/coding/save-progress
// @desc    Save coding progress
// @access  Private
router.post('/save-progress',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('code').notEmpty().withMessage('Code is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId, questionId, code, language, score, testsPassed, totalTests, timeElapsed } = req.body;
      const userId = req.user._id;

      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      if (!interview.config || typeof interview.config !== 'object') {
        interview.config = {};
      }
      if (!interview.config.codingProgress || typeof interview.config.codingProgress !== 'object') {
        interview.config.codingProgress = {};
      }

      interview.config.codingProgress[questionId] = {
        code,
        language: language || interview.configuration?.language || 'javascript',
        score: typeof score === 'number' ? score : score ? Number(score) : undefined,
        testsPassed: typeof testsPassed === 'number' ? testsPassed : testsPassed ? Number(testsPassed) : undefined,
        totalTests: typeof totalTests === 'number' ? totalTests : totalTests ? Number(totalTests) : undefined,
        timeElapsed: typeof timeElapsed === 'number' ? timeElapsed : timeElapsed ? Number(timeElapsed) : undefined,
        updatedAt: new Date()
      };

      if (!interview.startTime) {
        interview.startTime = new Date();
      }
      if (interview.status === 'scheduled') {
        interview.status = 'in-progress';
      }

      await interview.save();

      res.json({
        success: true,
        message: 'Progress saved successfully',
        data: {
          sessionId,
          questionId,
          progress: interview.config.codingProgress[questionId]
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

// @route   POST /api/coding/submit
// @desc    Submit final solution
// @access  Private
router.post('/submit',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('finalScore').isNumeric().withMessage('Final score must be a number')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId, questionId, code, language, finalScore, testsPassed, totalTests, timeElapsed } = req.body;
      const userId = req.user._id;

      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      const normalizedLanguage = String(language || interview.configuration?.language || 'javascript').toLowerCase();

      const numericFinalScore = Number(finalScore);
      const numericTestsPassed = testsPassed !== undefined ? Number(testsPassed) : undefined;
      const numericTotalTests = totalTests !== undefined ? Number(totalTests) : undefined;
      const numericTimeElapsed = timeElapsed !== undefined ? Number(timeElapsed) : undefined;

      let rating = 'Poor';
      if (numericFinalScore >= 90) rating = 'Excellent';
      else if (numericFinalScore >= 80) rating = 'Good';
      else if (numericFinalScore >= 60) rating = 'Average';

      const submittedAt = new Date();

      const newResponse = {
        questionId,
        userAnswer: 'Submitted code solution',
        code,
        language: normalizedLanguage,
        timeTaken: Number.isFinite(numericTimeElapsed) ? numericTimeElapsed : 0,
        isCorrect:
          Number.isFinite(numericTestsPassed) && Number.isFinite(numericTotalTests)
            ? numericTestsPassed === numericTotalTests
            : undefined,
        testCasesPassed: Number.isFinite(numericTestsPassed) ? numericTestsPassed : 0,
        totalTestCases: Number.isFinite(numericTotalTests) ? numericTotalTests : 0,
        score: Number.isFinite(numericFinalScore) ? numericFinalScore : 0,
        feedback: {
          overall: rating
        },
        submittedAt
      };

      const totalDuration = interview.startTime
        ? Math.round((submittedAt - interview.startTime) / 1000)
        : interview.totalDuration;
      const overallScore = Math.round(Number.isFinite(numericFinalScore) ? numericFinalScore : 0);

      const updatedInterview = await Interview.findOneAndUpdate(
        { _id: interview._id, status: { $in: ['scheduled', 'in-progress'] } },
        {
          $push: { responses: newResponse },
          $set: {
            status: 'completed',
            endTime: submittedAt,
            totalDuration,
            'scores.technical': overallScore,
            'scores.behavioral': 0,
            'scores.communication': overallScore,
            'scores.overall': Math.round(overallScore * 0.7)
          }
        },
        { new: true }
      );

      if (!updatedInterview) {
        const latest = await Interview.findOne({ sessionId, userId });
        if (latest?.status === 'completed') {
          const latestResponse = Array.isArray(latest.responses)
            ? latest.responses.find((response) => response.questionId === questionId)
            : null;
          return res.json({
            success: true,
            message: 'Solution already submitted',
            data: {
              sessionId,
              questionId,
              finalScore: latest.scores?.overall ?? latestResponse?.score ?? 0,
              rating: latestResponse?.feedback?.overall || 'Completed',
              testsPassed: latestResponse?.testCasesPassed,
              totalTests: latestResponse?.totalTestCases,
              timeElapsed: latestResponse?.timeTaken,
              submittedAt: latestResponse?.submittedAt || latest.endTime,
              idempotent: true
            }
          });
        }
        return res.status(409).json({
          success: false,
          message: 'Interview state changed. Please retry.'
        });
      }

      // Update user + progress stats
      const [user, progress] = await Promise.all([
        User.findById(userId),
        Progress.findOne({ userId })
      ]);

      if (progress) {
        // Update activity (minutes)
        const minutes = updatedInterview.totalDuration > 0 ? Math.max(1, Math.round(updatedInterview.totalDuration / 60)) : 0;
        await progress.updateDailyActivity(new Date(), {
          interviewsCompleted: 1,
          questionsAttempted: 1,
          timeSpent: minutes,
          averageScore: updatedInterview.scores.overall
        });

        progress.overallStats.bestScore = Math.max(progress.overallStats.bestScore || 0, updatedInterview.scores.overall || 0);
        progress.overallStats.completedInterviews += 1;
        progress.overallStats.totalInterviews += 1;
        progress.overallStats.totalQuestionsAttempted += 1;
        progress.overallStats.totalTimeSpent += minutes;
        if (numericTestsPassed !== undefined && numericTotalTests !== undefined) {
          progress.overallStats.totalQuestionsCorrect += numericTestsPassed === numericTotalTests ? 1 : 0;
        }
        // Keep averageScore in sync (simple running average)
        const completed = progress.overallStats.completedInterviews || 1;
        const prevAvg = progress.overallStats.averageScore || 0;
        progress.overallStats.averageScore = Math.round(((prevAvg * (completed - 1)) + (updatedInterview.scores.overall || 0)) / completed);

        await progress.updateSkillProgress('Coding', {
          score: updatedInterview.scores.overall,
          questionsAttempted: (progress.skillProgress.find(s => s.skill === 'Coding')?.questionsAttempted || 0) + 1,
          questionsCorrect:
            (progress.skillProgress.find(s => s.skill === 'Coding')?.questionsCorrect || 0) +
            ((numericTestsPassed !== undefined && numericTotalTests !== undefined && numericTestsPassed === numericTotalTests) ? 1 : 0)
        });

        await progress.updateStreak();
      }

      if (user) {
        user.stats.totalInterviews += 1;
        user.stats.completedInterviews += 1;
        const completed = user.stats.completedInterviews || 1;
        const prevAvg = user.stats.averageScore || 0;
        user.stats.averageScore = Math.round(((prevAvg * (completed - 1)) + (updatedInterview.scores.overall || 0)) / completed);
        if (progress) {
          user.stats.streakDays = progress.overallStats.currentStreak || 0;
        }
        user.stats.lastActiveDate = new Date();
        await user.save();
      }

      res.json({
        success: true,
        message: 'Solution submitted successfully',
        data: {
          sessionId,
          questionId,
          finalScore: numericFinalScore,
          rating,
          testsPassed: numericTestsPassed,
          totalTests: numericTotalTests,
          timeElapsed: numericTimeElapsed,
          submittedAt
        }
      });
      
    } catch (error) {
      console.error('Submit solution error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit solution',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
