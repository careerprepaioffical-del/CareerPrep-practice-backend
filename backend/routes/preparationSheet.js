const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const PreparationSheetQuestion = require('../models/PreparationSheetQuestion');
const PreparationSheetProgress = require('../models/PreparationSheetProgress');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

const buildResponse = ({ questions, progress }) => {
  const completedSet = new Set((progress?.completedQuestionIds || []).map((id) => String(id)));

  const items = questions.map((item) => ({
    ...item,
    completed: completedSet.has(String(item._id))
  }));

  const total = items.length;
  const completed = items.filter((item) => item.completed).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    items,
    summary: {
      total,
      completed,
      pending: Math.max(0, total - completed),
      completionPercentage,
      isCompleted: total > 0 && completed === total
    }
  };
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const [questions, progress] = await Promise.all([
      PreparationSheetQuestion.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean(),
      PreparationSheetProgress.findOne({ userId }).lean()
    ]);

    return res.json({
      success: true,
      data: buildResponse({ questions, progress })
    });
  } catch (error) {
    console.error('Get preparation sheet error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch preparation sheet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.patch(
  '/:questionId/toggle',
  authenticateToken,
  [body('completed').optional().isBoolean().withMessage('completed must be boolean')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { questionId } = req.params;
      const hasCompletedValue = typeof req.body.completed === 'boolean';

      const question = await PreparationSheetQuestion.findOne({ _id: questionId, isActive: true }).lean();
      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }

      let progress = await PreparationSheetProgress.findOne({ userId });
      if (!progress) {
        progress = await PreparationSheetProgress.create({ userId, completedQuestionIds: [] });
      }

      const alreadyCompleted = (progress.completedQuestionIds || []).some(
        (id) => String(id) === String(questionId)
      );

      const shouldComplete = hasCompletedValue ? req.body.completed : !alreadyCompleted;

      if (shouldComplete && !alreadyCompleted) {
        progress.completedQuestionIds.push(questionId);
      }

      if (!shouldComplete && alreadyCompleted) {
        progress.completedQuestionIds = (progress.completedQuestionIds || []).filter(
          (id) => String(id) !== String(questionId)
        );
      }

      await progress.save();

      const questions = await PreparationSheetQuestion.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: buildResponse({ questions, progress })
      });
    } catch (error) {
      console.error('Toggle preparation sheet item error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update question status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
