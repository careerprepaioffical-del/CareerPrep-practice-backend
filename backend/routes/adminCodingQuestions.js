const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const CodingQuestion = require('../models/CodingQuestion');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
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

// Bulk upload from CSV/Excel
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let rows = [];
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();

    if (fileExt === 'csv') {
      try {
        rows = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid CSV format: ' + err.message });
      }
    } else if (fileExt === 'xls' || fileExt === 'xlsx') {
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

    const questions = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      // Required
      const title = String(row.title || row.Title || '').trim();
      const description = String(row.description || row.Description || '').trim();

      if (!title) {
        errors.push(`Row ${rowNum}: Title is required`);
        continue;
      }
      if (!description) {
        errors.push(`Row ${rowNum}: Description is required`);
        continue;
      }

      // Optional
      const source = String(row.source || row.Source || 'leetcode').toLowerCase();
      const sourceId = String(row.sourceId || row.SourceId || row.sourceID || '').trim();
      const sourceUrl = String(row.sourceUrl || row.SourceUrl || row.sourceURL || '').trim();
      const difficulty = String(row.difficulty || row.Difficulty || 'easy').toLowerCase();
      const constraints = String(row.constraints || row.Constraints || '').trim();
      const tags = String(row.tags || row.Tags || '').split(',').map(t => t.trim()).filter(Boolean);
      const hints = String(row.hints || row.Hints || '').split('|').map(h => h.trim()).filter(Boolean);

      // Validate
      if (source && !['custom', 'leetcode'].includes(source)) {
        errors.push(`Row ${rowNum}: Source must be custom or leetcode`);
        continue;
      }
      if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
        errors.push(`Row ${rowNum}: Difficulty must be easy, medium, or hard`);
        continue;
      }

      // Build testCases from columns (testCase1Input, testCase1Output, etc.)
      const testCases = [];
      for (let j = 1; j <= 10; j++) {
        const input = String(row[`testCase${j}Input`] || row[`testcase${j}input`] || '').trim();
        const expectedOutput = String(row[`testCase${j}Output`] || row[`testcase${j}output`] || '').trim();
        const isHidden = String(row[`testCase${j}Hidden`] || row[`testcase${j}hidden`] || 'false').toLowerCase() === 'true';
        
        if (input && expectedOutput) {
          testCases.push({ input, expectedOutput, isHidden });
        }
      }

      // Starter code from columns
      const starterCode = {};
      const languages = ['javascript', 'python', 'java', 'cpp'];
      for (const lang of languages) {
        const code = String(row[`starterCode_${lang}`] || row[`startercode_${lang}`] || '').trim();
        if (code) starterCode[lang] = code;
      }

      questions.push({
        source: source || 'leetcode',
        sourceId,
        sourceUrl,
        title,
        description,
        difficulty: difficulty || 'easy',
        constraints,
        examples: [], // Could parse if needed
        testCases,
        starterCode,
        tags,
        hints,
        createdBy: req.user._id
      });
    }

    if (errors.length > 0 && questions.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid questions found', errors: errors.slice(0, 20) });
    }

    let inserted = 0;
    if (questions.length > 0) {
      const result = await CodingQuestion.insertMany(questions, { ordered: false });
      inserted = result.length;
    }

    return res.json({
      success: true,
      message: `Successfully uploaded ${inserted} question(s)`,
      data: { inserted, total: rows.length, errors: errors.length > 0 ? errors.slice(0, 10) : undefined }
    });
  } catch (error) {
    console.error('Bulk upload coding questions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
