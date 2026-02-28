const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Interview = require('../models/Interview');
const QuickPracticeSession = require('../models/QuickPracticeSession');
const { MCQSession } = require('../models/MCQQuestion');
const { computeCurrentStreak, toUtcDayKey } = require('../utils/streak');

const router = express.Router();

const computeTotalTimeSpent = (dailyActivity = []) => {
  return (Array.isArray(dailyActivity) ? dailyActivity : []).reduce(
    (sum, activity) => sum + Math.max(0, Number(activity?.timeSpent || 0)),
    0
  );
};

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

// Validation for profile update
const validateProfileUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('profile.experience').optional().isIn(['fresher', '0-1', '1-3', '3-5', '5+']).withMessage('Invalid experience level'),
  body('profile.skills').optional().isArray().withMessage('Skills must be an array'),
  body('profile.targetCompanies').optional().isArray().withMessage('Target companies must be an array'),
  body('profile.targetRoles').optional().isArray().withMessage('Target roles must be an array'),
  body('profile.preferredLanguages').optional().isArray().withMessage('Preferred languages must be an array')
];

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Get user's progress data
    const progress = await Progress.findOne({ userId: user._id });

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        progress: progress || null,
        profileCompletion: user.profileCompletion
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', 
  authenticateToken, 
  validateProfileUpdate, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const userId = req.user._id;
      const updateData = req.body;

      // Remove any fields that shouldn't be updated directly
      delete updateData.email;
      delete updateData.password;
      delete updateData.role;
      delete updateData.stats;
      delete updateData.subscription;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: user.toJSON(),
          profileCompletion: user.profileCompletion
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', 
  authenticateToken,
  [
    body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'mixed']).withMessage('Invalid difficulty level'),
    body('interviewTypes').optional().isArray().withMessage('Interview types must be an array'),
    body('notifications.email').optional().isBoolean().withMessage('Email notification must be boolean'),
    body('notifications.reminders').optional().isBoolean().withMessage('Reminders must be boolean')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { difficulty, interviewTypes, notifications } = req.body;

      const updateData = {};
      if (difficulty) updateData['preferences.difficulty'] = difficulty;
      if (interviewTypes) updateData['preferences.interviewTypes'] = interviewTypes;
      if (notifications) {
        if (notifications.email !== undefined) updateData['preferences.notifications.email'] = notifications.email;
        if (notifications.reminders !== undefined) updateData['preferences.notifications.reminders'] = notifications.reminders;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          preferences: user.preferences
        }
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let progress = await Progress.findOne({ userId: user._id });

    // ...existing code...
    // ...existing code...

    // Create progress record if it doesn't exist (fixes cold start issues)
    if (!progress) {
      progress = new Progress({ userId: user._id });
      await progress.save();
    }

    // ...existing code...
    // ...existing code...
    
    // Show last 3 days of activity for debugging
    const last3 = progress.dailyActivity.slice(-3).map(a => ({
      date: toUtcDayKey(a.date),
      logins: a.logins,
      interviews: a.interviewsCompleted,
      questions: a.questionsAttempted,
      timeSpent: a.timeSpent
    }));
    // ...existing code...

    const derivedCurrentStreak = computeCurrentStreak(progress.dailyActivity);
    // ...existing code...
    const derivedTotalTimeSpent = computeTotalTimeSpent(progress.dailyActivity);
    let finalTotalTimeSpent = derivedTotalTimeSpent;
    let shouldSaveProgress = false;

    if (finalTotalTimeSpent === 0) {
      const [completedInterviews, completedQuickPractice, completedMcq] = await Promise.all([
        Interview.find({ userId: user._id, status: 'completed' }).select('totalDuration').lean(),
        QuickPracticeSession.find({ userId: user._id, status: 'completed' }).select('createdAt completedAt').lean(),
        MCQSession.find({ userId: user._id, status: 'completed' }).select('timeSpent').lean()
      ]);

      const interviewMinutes = (completedInterviews || []).reduce((sum, item) => {
        const sec = Number(item?.totalDuration || 0);
        if (sec <= 0) return sum;
        return sum + Math.max(1, Math.round(sec / 60));
      }, 0);

      const quickPracticeMinutes = (completedQuickPractice || []).reduce((sum, item) => {
        const start = item?.createdAt ? new Date(item.createdAt).getTime() : 0;
        const end = item?.completedAt ? new Date(item.completedAt).getTime() : 0;
        const ms = end > start ? (end - start) : 0;
        if (ms <= 0) return sum;
        return sum + Math.max(1, Math.round(ms / 60000));
      }, 0);

      const mcqMinutes = (completedMcq || []).reduce((sum, item) => {
        const sec = Number(item?.timeSpent || 0);
        if (sec <= 0) return sum;
        return sum + Math.max(1, Math.round(sec / 60));
      }, 0);

      finalTotalTimeSpent = interviewMinutes + quickPracticeMinutes + mcqMinutes;
    }

    if ((progress.overallStats?.currentStreak || 0) !== derivedCurrentStreak) {
      progress.overallStats.currentStreak = derivedCurrentStreak;
      shouldSaveProgress = true;
    }

    if (derivedCurrentStreak > (progress.overallStats?.longestStreak || 0)) {
      progress.overallStats.longestStreak = derivedCurrentStreak;
      shouldSaveProgress = true;
    }

    if ((progress.overallStats?.totalTimeSpent || 0) !== finalTotalTimeSpent) {
      progress.overallStats.totalTimeSpent = finalTotalTimeSpent;
      shouldSaveProgress = true;
    }

    if (shouldSaveProgress) {
      await progress.save();
    }

    if ((user.stats?.streakDays || 0) !== derivedCurrentStreak) {
      user.stats.streakDays = derivedCurrentStreak;
      await user.save();
    }

    const stats = {
      user: {
        totalInterviews: user.stats.totalInterviews,
        completedInterviews: user.stats.completedInterviews,
        averageScore: user.stats.averageScore,
        streakDays: user.stats.streakDays
      },
      progress: {
        overallStats: progress.overallStats,
        accuracyPercentage: progress.accuracyPercentage,
        weeklyGoalCompletion: progress.weeklyGoalCompletion,
        skillProgress: progress.skillProgress,
        recentActivity: progress.dailyActivity.slice(-7) // Last 7 days
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user's progress data
    await Progress.findOneAndDelete({ userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
