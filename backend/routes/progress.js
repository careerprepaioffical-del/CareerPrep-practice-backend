const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const Progress = require('../models/Progress');
const Interview = require('../models/Interview');
const QuickPracticeSession = require('../models/QuickPracticeSession');

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

// @route   GET /api/progress
// @desc    Get user's progress data
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    let progress = await Progress.findOne({ userId });
    
    // Create progress record if it doesn't exist
    if (!progress) {
      progress = new Progress({ userId });
      await progress.save();
    }

    res.json({
      success: true,
      data: {
        progress
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/progress/update-activity
// @desc    Update daily activity
// @access  Private
router.post('/update-activity', 
  authenticateToken,
  [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('interviewsCompleted').optional().isInt({ min: 0 }).withMessage('Interviews completed must be a positive integer'),
    body('questionsAttempted').optional().isInt({ min: 0 }).withMessage('Questions attempted must be a positive integer'),
    body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a positive integer'),
    body('averageScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Average score must be between 0 and 100')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { date, interviewsCompleted, questionsAttempted, timeSpent, averageScore } = req.body;

      let progress = await Progress.findOne({ userId });
      
      if (!progress) {
        progress = new Progress({ userId });
      }

      // Update daily activity
      await progress.updateDailyActivity(date, {
        interviewsCompleted,
        questionsAttempted,
        timeSpent,
        averageScore
      });

      // Update overall stats
      if (interviewsCompleted) {
        progress.overallStats.totalInterviews += interviewsCompleted;
        progress.overallStats.completedInterviews += interviewsCompleted;
      }
      
      if (questionsAttempted) {
        progress.overallStats.totalQuestionsAttempted += questionsAttempted;
      }
      
      if (timeSpent) {
        progress.overallStats.totalTimeSpent += timeSpent;
      }

      // Update streak
      await progress.updateStreak();

      res.json({
        success: true,
        message: 'Activity updated successfully',
        data: {
          progress
        }
      });
    } catch (error) {
      console.error('Update activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update activity',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/progress/update-skill
// @desc    Update skill progress
// @access  Private
router.post('/update-skill', 
  authenticateToken,
  [
    body('skill').notEmpty().withMessage('Skill name is required'),
    body('score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
    body('questionsAttempted').optional().isInt({ min: 0 }).withMessage('Questions attempted must be a positive integer'),
    body('questionsCorrect').optional().isInt({ min: 0 }).withMessage('Questions correct must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { skill, score, questionsAttempted, questionsCorrect } = req.body;

      let progress = await Progress.findOne({ userId });
      
      if (!progress) {
        progress = new Progress({ userId });
      }

      // Update skill progress
      await progress.updateSkillProgress(skill, {
        score,
        questionsAttempted,
        questionsCorrect
      });

      res.json({
        success: true,
        message: 'Skill progress updated successfully',
        data: {
          skillProgress: progress.skillProgress.find(s => s.skill === skill)
        }
      });
    } catch (error) {
      console.error('Update skill error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update skill progress',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   GET /api/progress/analytics
// @desc    Get detailed analytics
// @access  Private
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = '30' } = req.query; // days
    
    const progress = await Progress.findOne({ userId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress data not found'
      });
    }

    const since = new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000);

    // Get recent interviews for detailed analysis
    const recentInterviews = await Interview.find({
      userId,
      createdAt: {
        $gte: since
      }
    }).sort({ createdAt: -1 });

    // Include Quick Practice/Quick Mock sessions in score trend
    const recentQuickSessions = await QuickPracticeSession.find({
      userId,
      status: 'completed',
      completedAt: { $gte: since }
    })
      .select('completedAt score.percent')
      .sort({ completedAt: -1 });

    // Calculate analytics
    const analytics = {
      overview: {
        totalInterviews: progress.overallStats.totalInterviews,
        averageScore: progress.overallStats.averageScore,
        currentStreak: progress.overallStats.currentStreak,
        accuracyPercentage: progress.accuracyPercentage
      },
      trends: {
        dailyActivity: progress.dailyActivity.slice(-parseInt(timeframe)),
        scoreProgression: [
          ...recentInterviews.map(interview => ({
            date: interview.createdAt,
            score: interview.scores.overall,
            type: interview.type
          })),
          ...recentQuickSessions.map((s) => ({
            date: s.completedAt,
            score: s.score?.percent || 0,
            type: 'quick_mock'
          }))
        ]
          .filter((p) => p && p.date)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      },
      skills: {
        topSkills: progress.skillProgress
          .sort((a, b) => b.score - a.score)
          .slice(0, 5),
        improvementAreas: progress.skillProgress
          .filter(skill => skill.score < 60)
          .sort((a, b) => a.score - b.score)
          .slice(0, 3)
      },
      goals: {
        weekly: progress.weeklyGoals,
        completion: progress.weeklyGoalCompletion
      }
    };

    res.json({
      success: true,
      data: {
        analytics,
        timeframe: parseInt(timeframe)
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/progress/achievements
// @desc    Unlock achievement
// @access  Private
router.post('/achievements', 
  authenticateToken,
  [
    body('id').notEmpty().withMessage('Achievement ID is required'),
    body('name').notEmpty().withMessage('Achievement name is required'),
    body('description').notEmpty().withMessage('Achievement description is required'),
    body('category').isIn(['streak', 'score', 'completion', 'improvement', 'milestone']).withMessage('Invalid achievement category')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const achievementData = req.body;

      let progress = await Progress.findOne({ userId });
      
      if (!progress) {
        progress = new Progress({ userId });
      }

      // Unlock achievement
      await progress.unlockAchievement(achievementData);

      res.json({
        success: true,
        message: 'Achievement unlocked successfully',
        data: {
          achievement: achievementData
        }
      });
    } catch (error) {
      console.error('Unlock achievement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unlock achievement',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
