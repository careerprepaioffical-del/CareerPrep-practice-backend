const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const PreparationSheetQuestion = require('../models/PreparationSheetQuestion');
const PreparationSheetProgress = require('../models/PreparationSheetProgress');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(csv|xls|xlsx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

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

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { q, topic, includeInactive } = req.query;

    const filter = {};
    if (!includeInactive || String(includeInactive) !== 'true') {
      filter.isActive = true;
    }
    if (topic) {
      filter.topic = String(topic);
    }
    if (q) {
      filter.title = { $regex: String(q), $options: 'i' };
    }

    const items = await PreparationSheetQuestion.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data: { items } });
  } catch (error) {
    console.error('Admin list preparation sheet error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch preparation sheet questions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('questionUrl').isURL().withMessage('Valid question URL is required'),
    body('topic').optional().isString().withMessage('Topic must be a string'),
    body('platform').optional().isString().withMessage('Platform must be a string'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const question = await PreparationSheetQuestion.create({
        ...req.body,
        createdBy: req.user._id
      });
      return res.status(201).json({ success: true, data: { question } });
    } catch (error) {
      console.error('Admin create preparation sheet error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create preparation sheet question',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  [
    body('title').optional().isString(),
    body('questionUrl').optional().isURL().withMessage('Valid question URL is required'),
    body('topic').optional().isString(),
    body('platform').optional().isString(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const question = await PreparationSheetQuestion.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }

      return res.json({ success: true, data: { question } });
    } catch (error) {
      console.error('Admin update preparation sheet error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update preparation sheet question',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await PreparationSheetQuestion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await PreparationSheetProgress.updateMany(
      {},
      { $pull: { completedQuestionIds: deleted._id } }
    );

    return res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Admin delete preparation sheet error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete preparation sheet question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Bulk upload from CSV/Excel
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let rows = [];
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();

    // Parse CSV
    if (fileExt === 'csv') {
      try {
        rows = parse(req.file.buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid CSV format: ' + err.message });
      }
    }
    // Parse Excel (xls, xlsx)
    else if (fileExt === 'xls' || fileExt === 'xlsx') {
      try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid Excel format: ' + err.message });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'File is empty or has no data rows' });
    }

    // Validate and prepare questions
    const questions = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because row 1 is header, and Excel is 1-indexed

      // Required fields
      const title = String(row.title || row.Title || '').trim();
      const questionUrl = String(row.questionUrl || row.QuestionUrl || row.url || row.URL || '').trim();

      if (!title) {
        errors.push(`Row ${rowNum}: Title is required`);
        continue;
      }
      if (!questionUrl) {
        errors.push(`Row ${rowNum}: Question URL is required`);
        continue;
      }

      // Validate URL format
      try {
        new URL(questionUrl);
      } catch {
        errors.push(`Row ${rowNum}: Invalid URL format`);
        continue;
      }

      // Optional fields with defaults
      const topic = String(row.topic || row.Topic || '').trim() || 'General';
      const platform = String(row.platform || row.Platform || '').trim() || 'External';
      const difficulty = String(row.difficulty || row.Difficulty || '').toLowerCase().trim();
      const order = parseInt(row.order || row.Order || '0', 10) || 0;
      const isActive = row.isActive === false || String(row.isActive || row.IsActive || '').toLowerCase() === 'false' ? false : true;

      // Validate difficulty
      if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
        errors.push(`Row ${rowNum}: Difficulty must be easy, medium, or hard`);
        continue;
      }

      questions.push({
        title,
        questionUrl,
        topic,
        platform,
        difficulty: difficulty || 'medium',
        order,
        isActive,
        createdBy: req.user._id
      });
    }

    // If we have errors but no valid questions, return errors
    if (errors.length > 0 && questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid questions found',
        errors: errors.slice(0, 20) // Limit error messages
      });
    }

    // Insert questions
    let inserted = 0;
    if (questions.length > 0) {
      const result = await PreparationSheetQuestion.insertMany(questions, { ordered: false });
      inserted = result.length;
    }

    return res.json({
      success: true,
      message: `Successfully uploaded ${inserted} question(s)`,
      data: {
        inserted,
        total: rows.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined
      }
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
