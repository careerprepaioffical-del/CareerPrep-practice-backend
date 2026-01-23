const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const XLSX = require('xlsx');
const { parse: parseCsv } = require('csv-parse/sync');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const QuickPracticeQuestion = require('../models/QuickPracticeQuestion');
const { ALLOWED_QUICK_PRACTICE_CATEGORIES } = require('../constants/quickPractice');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

router.use(authenticateToken, requireAdmin);

const normalizeCategory = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'js') return 'javascript';
  if (v === 'oops') return 'oop';
  if (v === 'data-structures' || v === 'data structures' || v === 'algorithms') return 'dsa';
  if (v === 'system design' || v === 'systemdesign') return 'system-design';
  if (v === 'network' || v === 'networking') return 'networks';
  if (ALLOWED_QUICK_PRACTICE_CATEGORIES.includes(v)) return v;
  return '';
};

const normalizeDifficulty = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (['easy', 'medium', 'hard'].includes(v)) return v;
  return 'easy';
};

const splitTags = (value) => {
  if (value === null || value === undefined) return [];
  return String(value)
    .split(/[,|]/g)
    .map((x) => x.trim())
    .filter(Boolean);
};

const extractOptionsFromRow = (row) => {
  // Supports:
  // - options: "a|b|c|d"
  // - option1..option8 columns
  const fromOptionsCell = String(row.options || row.Options || '').trim();
  const options = [];

  if (fromOptionsCell) {
    fromOptionsCell
      .split('|')
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((x) => options.push(x));
  }

  for (let i = 1; i <= 8; i += 1) {
    const k1 = `option${i}`;
    const k2 = `Option${i}`;
    const v = String(row[k1] ?? row[k2] ?? '').trim();
    if (v) options.push(v);
  }

  // De-dupe while preserving order
  const seen = new Set();
  return options.filter((x) => {
    const k = x.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const normalizeCorrectIndex = (value, optionsLength) => {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;

  // Accept 0-based or 1-based
  if (Number.isInteger(n)) {
    if (n >= 0 && n < optionsLength) return n;
    if (n >= 1 && n <= optionsLength) return n - 1;
  }
  return null;
};

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const filename = String(req.file.originalname || '').toLowerCase();
    const ext = filename.split('.').pop();

    let rows = [];
    if (ext === 'csv') {
      const text = req.file.buffer.toString('utf8');
      rows = parseCsv(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Upload .csv, .xlsx, or .xls'
      });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No rows found in file' });
    }

    const failures = [];
    const docs = [];

    rows.forEach((row, idx) => {
      const rowNumber = idx + 2; // assuming headers at row 1

      const category = normalizeCategory(row.category ?? row.Category);
      const prompt = String(row.prompt ?? row.Prompt ?? '').trim();
      const difficulty = normalizeDifficulty(row.difficulty ?? row.Difficulty);
      const explanation = String(row.explanation ?? row.Explanation ?? '').trim();
      const tags = splitTags(row.tags ?? row.Tags);
      const options = extractOptionsFromRow(row);
      const correctIndex = normalizeCorrectIndex(row.correctIndex ?? row.CorrectIndex ?? row.correct_index ?? row.correct ?? row.Correct, options.length);

      if (!category) {
        failures.push({ row: rowNumber, message: `Invalid category (allowed: ${ALLOWED_QUICK_PRACTICE_CATEGORIES.join('/')})` });
        return;
      }
      if (!prompt) {
        failures.push({ row: rowNumber, message: 'Prompt is required' });
        return;
      }
      if (!options || options.length < 2) {
        failures.push({ row: rowNumber, message: 'Need at least 2 options' });
        return;
      }
      if (correctIndex === null) {
        failures.push({ row: rowNumber, message: `Invalid correctIndex (use 0-${options.length - 1} or 1-${options.length})` });
        return;
      }

      docs.push({
        category,
        prompt,
        options,
        correctIndex,
        explanation,
        difficulty,
        tags
      });
    });

    if (docs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid rows to import',
        data: { inserted: 0, failed: failures.length, failures }
      });
    }

    await QuickPracticeQuestion.insertMany(docs, { ordered: false });

    return res.status(201).json({
      success: true,
      message: 'Import completed',
      data: {
        inserted: docs.length,
        failed: failures.length,
        failures
      }
    });
  } catch (err) {
    console.error('admin quick practice import error:', err);
    return res.status(500).json({ success: false, message: 'Failed to import questions' });
  }
});

router.get('/', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || '').trim().toLowerCase();
    const difficulty = String(req.query.difficulty || '').trim().toLowerCase();

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (category && ALLOWED_QUICK_PRACTICE_CATEGORIES.includes(category)) filter.category = category;
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) filter.difficulty = difficulty;
    if (q) {
      filter.$or = [{ prompt: { $regex: q, $options: 'i' } }, { tags: { $in: [new RegExp(q, 'i')] } }];
    }

    const [items, total] = await Promise.all([
      QuickPracticeQuestion.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      QuickPracticeQuestion.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        items,
        page,
        limit,
        total
      }
    });
  } catch (err) {
    console.error('admin quick practice list error:', err);
    res.status(500).json({ success: false, message: 'Failed to load questions' });
  }
});

router.post(
  '/',
  [
    body('category').isIn(ALLOWED_QUICK_PRACTICE_CATEGORIES).withMessage('Invalid category'),
    body('prompt').isString().trim().notEmpty().withMessage('Prompt is required'),
    body('options').isArray({ min: 2 }).withMessage('Options must be an array with at least 2 items'),
    body('options.*').isString().trim().notEmpty().withMessage('Each option must be a non-empty string'),
    body('correctIndex').isInt({ min: 0 }).withMessage('correctIndex must be a number >= 0'),
    body('explanation').optional().isString(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('tags').optional().isArray().withMessage('tags must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { category, prompt, options, correctIndex, explanation, tags, difficulty } = req.body;

      const doc = await QuickPracticeQuestion.create({
        category,
        prompt,
        options,
        correctIndex,
        explanation: explanation || '',
        tags: Array.isArray(tags) ? tags : [],
        difficulty: difficulty || 'easy'
      });

      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      console.error('admin quick practice create error:', err);
      res.status(500).json({ success: false, message: 'Failed to create question' });
    }
  }
);

router.put(
  '/:id',
  [
    body('category').optional().isIn(ALLOWED_QUICK_PRACTICE_CATEGORIES).withMessage('Invalid category'),
    body('prompt').optional().isString().trim().notEmpty().withMessage('Prompt must be a non-empty string'),
    body('options').optional().isArray({ min: 2 }).withMessage('Options must be an array with at least 2 items'),
    body('options.*').optional().isString().trim().notEmpty().withMessage('Each option must be a non-empty string'),
    body('correctIndex').optional().isInt({ min: 0 }).withMessage('correctIndex must be a number >= 0'),
    body('explanation').optional().isString(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('tags').optional().isArray().withMessage('tags must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updated = await QuickPracticeQuestion.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if (!updated) return res.status(404).json({ success: false, message: 'Question not found' });

      res.json({ success: true, data: updated });
    } catch (err) {
      console.error('admin quick practice update error:', err);
      res.status(500).json({ success: false, message: 'Failed to update question' });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await QuickPracticeQuestion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('admin quick practice delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
});

module.exports = router;
