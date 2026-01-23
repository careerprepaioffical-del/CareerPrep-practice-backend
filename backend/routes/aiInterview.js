const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const aiInterviewerService = require('../services/aiInterviewerService');
const Interview = require('../models/Interview');
const Progress = require('../models/Progress');
const User = require('../models/User');

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

// @route   POST /api/ai-interview/start-personalized
// @desc    Start personalized AI interview session
// @access  Private
router.post('/start-personalized',
  authenticateToken,
  [
    body('profile').isObject().withMessage('Profile is required'),
    body('profile.name').notEmpty().withMessage('Name is required'),
    body('profile.experience').notEmpty().withMessage('Experience is required'),
    body('profile.currentRole').notEmpty().withMessage('Current role is required'),
    body('profile.targetCompany').notEmpty().withMessage('Target company is required'),
    body('profile.targetRole').notEmpty().withMessage('Target role is required'),
    body('interviewType').isIn(['behavioral', 'technical', 'mixed', 'leadership']).withMessage('Invalid interview type')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!aiInterviewerService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'AI interview is not configured (missing GEMINI_API_KEY)'
        });
      }

      const { profile, interviewType } = req.body;
      const userId = req.user._id;

      // Generate session ID
      const sessionId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate personalized opening question based on profile
      const openingQuestion = generatePersonalizedOpening(profile, interviewType);

      // Create interview session in database (so /session and /respond can resolve it)
      const interview = new Interview({
        userId,
        sessionId,
        type: 'ai_interview_personalized',
        company: {
          name: profile.targetCompany,
          role: profile.targetRole
        },
        status: 'in_progress',
        startTime: new Date(),
        questions: [],
        responses: [],
        aiResponses: [],
        config: {
          interviewType,
          profile,
          openingQuestion,
          currentQuestion: openingQuestion
        },
        metadata: {
          aiGenerated: true,
          realTime: true,
          personalized: true
        }
      });

      await interview.save();

      // Initialize AI interviewer with profile context
      const aiSession = await aiInterviewerService.initializePersonalizedInterview(
        sessionId,
        profile,
        interviewType
      );

      // Keep the opening question in the in-memory conversation context
      const session = aiInterviewerService.getSession(sessionId);
      if (session) {
        session.messages.push({ role: 'assistant', content: openingQuestion });
      }

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`interview-${sessionId}`).emit('interview-started', {
        sessionId,
        question: openingQuestion,
        questionNumber: 1,
        totalQuestions: 'Dynamic',
        profile
      });

      res.json({
        success: true,
        data: {
          sessionId,
          question: openingQuestion,
          questionNumber: 1,
          totalQuestions: 'Dynamic',
          estimatedDuration: profile.duration || 30,
          profile
        }
      });

    } catch (error) {
      console.error('Personalized AI interview start error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start personalized AI interview',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Helper function to generate personalized opening
function generatePersonalizedOpening(profile, interviewType) {
  const { name, currentRole, targetRole, targetCompany, experience } = profile;

  const openings = {
    behavioral: `Hello ${name}! I'm excited to interview you for the ${targetRole} position at ${targetCompany}. I see you have ${experience} years of experience as a ${currentRole}. Let's start with this: Can you walk me through your journey and what specifically draws you to ${targetCompany}?`,

    technical: `Hi ${name}! Welcome to your technical interview for the ${targetRole} role at ${targetCompany}. Given your background as a ${currentRole} with ${experience} years of experience, I'd like to start by understanding your technical approach. Can you tell me about a challenging technical problem you've solved recently?`,

    mixed: `Hello ${name}! I'm conducting your interview for the ${targetRole} position at ${targetCompany}. I see you're currently a ${currentRole} with ${experience} years of experience. Let's begin with: Tell me about yourself and what excites you most about this opportunity at ${targetCompany}.`,

    leadership: `Hi ${name}! Great to meet you for the ${targetRole} interview at ${targetCompany}. With your ${experience} years of experience as a ${currentRole}, I'm interested in your leadership perspective. Can you share an example of how you've led a team or project to success?`
  };

  return openings[interviewType] || openings.mixed;
}

// @route   POST /api/ai-interview/start
// @desc    Start AI interview session (legacy)
// @access  Private
router.post('/start',
  authenticateToken,
  [
    body('company').notEmpty().withMessage('Company is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('interviewType').isIn(['behavioral', 'technical', 'mixed', 'system_design']).withMessage('Invalid interview type'),
    body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!aiInterviewerService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'AI interview is not configured (missing GEMINI_API_KEY)'
        });
      }

      const { company, role, interviewType, difficulty } = req.body;
      const userId = req.user._id;

      // Create interview session in database
      const interview = new Interview({
        userId,
        sessionId: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai_interview',
        config: {
          company,
          role,
          interviewType,
          difficulty,
          questionTypes: [interviewType]
        },
        status: 'in_progress',
        startTime: new Date(),
        questions: [], // Will be populated as interview progresses
        responses: [],
        aiResponses: [],
        metadata: {
          aiGenerated: true,
          realTime: true
        }
      });

      await interview.save();

      // Initialize AI interviewer
      const aiSession = await aiInterviewerService.initializeInterview(interview.sessionId, {
        company,
        role,
        interviewType,
        difficulty
      });

      // Persist the opening question for refresh/restart support
      interview.config = {
        ...(interview.config || {}),
        currentQuestion: aiSession.question
      };
      await interview.save();

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`interview-${interview.sessionId}`).emit('interview-started', {
        sessionId: interview.sessionId,
        question: aiSession.question,
        questionNumber: aiSession.questionNumber,
        totalQuestions: aiSession.totalQuestions
      });

      res.json({
        success: true,
        data: {
          sessionId: interview.sessionId,
          question: aiSession.question,
          questionNumber: aiSession.questionNumber,
          totalQuestions: aiSession.totalQuestions,
          estimatedDuration: aiSession.estimatedDuration
        }
      });

    } catch (error) {
      console.error('AI interview start error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start AI interview',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/ai-interview/respond
// @desc    Submit response to AI interviewer
// @access  Private
router.post('/respond',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('response').notEmpty().withMessage('Response is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!aiInterviewerService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'AI interview is not configured (missing GEMINI_API_KEY)'
        });
      }

      const { sessionId, response } = req.body;
      const userId = req.user._id;

      // Verify session belongs to user
      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      // If server restarted (or memory was cleared), rehydrate an AI session from stored config.
      // This keeps /respond working instead of hard-failing.
      let aiSession = aiInterviewerService.getSession(sessionId);
      if (!aiSession) {
        if (interview.type === 'ai_interview_personalized' && interview.config?.profile) {
          await aiInterviewerService.initializePersonalizedInterview(
            sessionId,
            interview.config.profile,
            interview.config.interviewType
          );
          aiSession = aiInterviewerService.getSession(sessionId);
          if (aiSession && interview.config?.openingQuestion) {
            aiSession.messages.push({ role: 'assistant', content: interview.config.openingQuestion });
          }
        } else if (interview.type === 'ai_interview') {
          await aiInterviewerService.initializeInterview(sessionId, interview.config || {});
          aiSession = aiInterviewerService.getSession(sessionId);
        }
      }

      // Process response with AI interviewer
      const result = await aiInterviewerService.processResponse(sessionId, response);

      // Save response to database
      interview.aiResponses.push({
        questionIndex: result.questionNumber - 2, // Adjust for 0-based index
        response,
        timestamp: new Date(),
        analysis: result.analysis
      });

      // Persist the next question so a page refresh can continue
      interview.config = {
        ...(interview.config || {}),
        currentQuestion: result.followUp?.question || interview.config?.currentQuestion
      };

      // If interview is complete, update status
      if (result.isComplete) {
        interview.status = 'completed';
        interview.endTime = new Date();
      }

      await interview.save();

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`interview-${sessionId}`).emit('ai-response', {
        sessionId,
        analysis: result.analysis,
        followUp: result.followUp,
        questionNumber: result.questionNumber,
        isComplete: result.isComplete
      });

      res.json({
        success: true,
        data: {
          analysis: result.analysis,
          followUp: result.followUp,
          questionNumber: result.questionNumber,
          totalQuestions: result.totalQuestions,
          isComplete: result.isComplete
        }
      });

    } catch (error) {
      console.error('AI interview response error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process response',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/ai-interview/complete
// @desc    Complete AI interview and get final summary
// @access  Private
router.post('/complete',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!aiInterviewerService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'AI interview is not configured (missing GEMINI_API_KEY)'
        });
      }

      const { sessionId } = req.body;
      const userId = req.user._id;

      // Verify session belongs to user
      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      // Generate final summary
      const summary = await aiInterviewerService.generateInterviewSummary(sessionId);

      const safeNumber = (value, fallback = 0) => {
        const n = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(n) ? n : fallback;
      };

      const clamp0to100 = (value) => Math.min(100, Math.max(0, safeNumber(value, 0)));

      // Update interview with final results
      interview.status = 'completed';
      interview.endTime = new Date();

      // Keep Interview.scores populated so /users/stats and analytics trend can include AI sessions.
      // Summary is expected to be 0-100.
      const summaryScores = summary?.scores || {};
      interview.scores.communication = clamp0to100(summaryScores.communication);
      interview.scores.technical = clamp0to100(summaryScores.technical);
      interview.scores.behavioral = clamp0to100(summaryScores.behavioral);
      interview.scores.overall = clamp0to100(summary?.overallScore);

      // Store duration on the Interview document as well.
      const durationMinutes = safeNumber(summary?.duration, 0);
      interview.totalDuration = durationMinutes > 0 ? Math.round(durationMinutes * 60) : interview.totalDuration;

      interview.results = {
        overallScore: summary.overallScore,
        scores: summary.scores,
        strengths: summary.strengths,
        improvements: summary.improvements,
        recommendation: summary.recommendation,
        duration: summary.duration
      };

      await interview.save();

      // Update user + progress stats (so dashboard/progress reflects AI interview completions)
      try {
        const [user, existingProgress] = await Promise.all([
          User.findById(userId),
          Progress.findOne({ userId })
        ]);

        const progress = existingProgress || new Progress({ userId });
        const minutes = durationMinutes > 0 ? Math.round(durationMinutes) : 0;
        const questionsAttempted = Array.isArray(interview.aiResponses) ? interview.aiResponses.length : 0;

        await progress.updateDailyActivity(new Date(), {
          interviewsCompleted: 1,
          questionsAttempted,
          timeSpent: minutes,
          averageScore: interview.scores.overall
        });

        progress.overallStats.bestScore = Math.max(progress.overallStats.bestScore || 0, interview.scores.overall || 0);
        progress.overallStats.completedInterviews += 1;
        progress.overallStats.totalInterviews += 1;
        progress.overallStats.totalQuestionsAttempted += questionsAttempted;
        progress.overallStats.totalTimeSpent += minutes;

        const completed = progress.overallStats.completedInterviews || 1;
        const prevAvg = progress.overallStats.averageScore || 0;
        progress.overallStats.averageScore = Math.round(((prevAvg * (completed - 1)) + (interview.scores.overall || 0)) / completed);

        const skillName = (() => {
          const t = String(interview?.config?.interviewType || '').trim();
          return t ? `AI Interview (${t})` : 'AI Interview';
        })();

        const prevSkillAttempted = progress.skillProgress.find(s => s.skill === skillName)?.questionsAttempted || 0;
        await progress.updateSkillProgress(skillName, {
          score: interview.scores.overall,
          questionsAttempted: prevSkillAttempted + 1
        });

        await progress.updateStreak();
        await progress.save();

        if (user) {
          user.stats.totalInterviews += 1;
          user.stats.completedInterviews += 1;
          const userCompleted = user.stats.completedInterviews || 1;
          const userPrevAvg = user.stats.averageScore || 0;
          user.stats.averageScore = Math.round(((userPrevAvg * (userCompleted - 1)) + (interview.scores.overall || 0)) / userCompleted);
          user.stats.streakDays = progress.overallStats.currentStreak || 0;
          user.stats.lastActiveDate = new Date();
          await user.save();
        }
      } catch (statsErr) {
        console.warn('ai interview stats update error:', statsErr);
      }

      // Emit completion event
      const io = req.app.get('io');
      io.to(`interview-${sessionId}`).emit('interview-completed', {
        sessionId,
        summary
      });

      res.json({
        success: true,
        data: summary
      });

    } catch (error) {
      console.error('AI interview completion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete interview',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   GET /api/ai-interview/session/:sessionId
// @desc    Get AI interview session status
// @access  Private
router.get('/session/:sessionId',
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user._id;

      // Get session from database
      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      // Get AI session state
      const aiSession = aiInterviewerService.getSession(sessionId);

      res.json({
        success: true,
        data: {
          sessionId,
          status: interview.status,
          config: interview.config,
          currentQuestion: aiSession?.currentQuestionIndex || 0,
          question: interview.config?.currentQuestion || interview.config?.openingQuestion || '',
          totalQuestions: interview.type === 'ai_interview_personalized' ? 'Dynamic' : 8,
          responses: (interview.aiResponses || []).length,
          startTime: interview.startTime,
          endTime: interview.endTime,
          results: interview.results
        }
      });

    } catch (error) {
      console.error('AI interview session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get session status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/ai-interview/hint
// @desc    Get hint for current question
// @access  Private
router.post('/hint',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!aiInterviewerService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'AI interview is not configured (missing GEMINI_API_KEY)'
        });
      }

      const { sessionId } = req.body;
      const userId = req.user._id;

      // Verify session
      const interview = await Interview.findOne({ sessionId, userId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found'
        });
      }

      const aiSession = aiInterviewerService.getSession(sessionId);
      const question = interview.config?.currentQuestion || interview.config?.openingQuestion || '';

      const context = (aiSession?.messages || [])
        .slice(-6)
        .map(m => `${String(m.role || '').toUpperCase()}: ${m.content}`)
        .join('\n\n');

      const hintPrompt = `Provide a short, actionable hint to help the candidate answer the current interview question.

Current question: ${question}

Conversation context (recent):
${context}

Return valid JSON as: { "hint": "..." }`;

      const hintResult = await aiInterviewerService.generateJson({
        system: 'You are an expert interviewer coach. Give concise hints without answering the question for them. Always respond with valid JSON.',
        prompt: hintPrompt,
        temperature: 0.4,
        maxTokens: 200
      });

      const hint = hintResult?.hint || 'Focus on a clear structure and concrete impact.';

      res.json({
        success: true,
        data: { hint }
      });

    } catch (error) {
      console.error('AI interview hint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get hint',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
