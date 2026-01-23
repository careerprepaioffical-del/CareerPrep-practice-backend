const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const CodingQuestion = require('../models/CodingQuestion');

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

// Admin-only: Create a coding question
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('source').optional().isIn(['custom', 'leetcode']).withMessage('Invalid source'),
    body('sourceId').optional().isString().withMessage('sourceId must be a string'),
    body('sourceUrl').optional().isString().withMessage('sourceUrl must be a string'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('constraints').optional().isString().withMessage('Constraints must be a string'),
    body('examples').optional().isArray().withMessage('Examples must be an array'),
    body('testCases').optional().isArray().withMessage('Test cases must be an array'),
    body('starterCode').optional().isObject().withMessage('starterCode must be an object')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const payload = req.body;

      const question = await CodingQuestion.create({
        ...payload,
        createdBy: req.user._id
      });

      return res.status(201).json({
        success: true,
        data: { question }
      });
    } catch (error) {
      console.error('Create coding question error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create coding question',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Admin-only: List coding questions
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, difficulty, q } = req.query;
    const filter = {};

    if (difficulty) filter.difficulty = difficulty;
    if (q) filter.title = { $regex: String(q), $options: 'i' };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [items, total] = await Promise.all([
      CodingQuestion.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      CodingQuestion.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
          total
        }
      }
    });
  } catch (error) {
    console.error('List coding questions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list coding questions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Admin-only: Update coding question
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  [
    body('source').optional().isIn(['custom', 'leetcode']),
    body('sourceId').optional().isString(),
    body('sourceUrl').optional().isString(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('constraints').optional().isString(),
    body('examples').optional().isArray(),
    body('testCases').optional().isArray(),
    body('starterCode').optional().isObject(),
    body('hints').optional().isArray(),
    body('tags').optional().isArray()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;

      const question = await CodingQuestion.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }

      return res.json({ success: true, data: { question } });
    } catch (error) {
      console.error('Update coding question error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update coding question',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Admin-only: Delete coding question
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CodingQuestion.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    return res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Delete coding question error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete coding question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
