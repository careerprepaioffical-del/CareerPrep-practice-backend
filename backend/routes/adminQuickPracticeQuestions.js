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
  if (!v) return '';
  if (v === 'js') return 'javascript';
  if (v === 'oops') return 'oop';
  if (v === 'data-structures' || v === 'data structures' || v === 'algorithms') return 'dsa';
  if (v === 'system design' || v === 'systemdesign') return 'system-design';
  if (v === 'network' || v === 'networking') return 'networks';
  if (ALLOWED_QUICK_PRACTICE_CATEGORIES.includes(v)) return v;
  // For admin imports: accept any non-empty category (admins are trusted)
  return v;
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

/**
 * Normalize every key in a parsed row:
 * - Strip BOM (\uFEFF) Excel sometimes embeds on the first column header
 * - Trim surrounding whitespace
 * - Lowercase
 * This makes the import resilient to header casing/spacing variations that
 * cause ALL rows to fail in production when the CSV was built in Excel.
 */
const normalizeRowKeys = (row) => {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '').toLowerCase();
    out[key] = v;
  }
  return out;
};

const extractOptionsFromRow = (row) => {
  // row keys are already lowercased by normalizeRowKeys
  // Supports:
  // - options: "a|b|c|d" (pipe-separated cell)
  // - option1..option8 individual columns
  const fromOptionsCell = String(row.options || '').trim();
  const options = [];

  if (fromOptionsCell) {
    fromOptionsCell
      .split('|')
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((x) => options.push(x));
  }

  for (let i = 1; i <= 8; i += 1) {
    const v = String(row[`option${i}`] ?? '').trim();
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
      // Strip BOM (\uFEFF) added by Excel/Windows before parsing
      let text = req.file.buffer.toString('utf8');
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      rows = parseCsv(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true
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

    // Normalize all row keys once (lowercase + trim + strip BOM).
    // This is the primary defence against Excel-generated CSVs that have
    // header casing/spacing issues causing every row to fail in production.
    rows = rows.map(normalizeRowKeys);


    const failures = [];
    const docs = [];

    rows.forEach((row, idx) => {
      const rowNumber = idx + 2; // assuming headers at row 1

      // All keys are already lowercased — also support common column aliases:
      // "question" as alias for "prompt", "answer"/"correct_answer" for "correctindex"
      const category = normalizeCategory(row.category);
      const prompt = String(row.prompt ?? row.question ?? '').trim();
      const difficulty = normalizeDifficulty(row.difficulty);
      const explanation = String(row.explanation ?? '').trim();
      const tags = splitTags(row.tags);
      const options = extractOptionsFromRow(row);
      const correctIndex = normalizeCorrectIndex(
        row.correctindex ?? row.correct_index ?? row.correct ?? row.answer ?? row.correct_answer,
        options.length
      );

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
      const firstReason = failures.length > 0 ? ` First error (row ${failures[0].row}): ${failures[0].message}` : '';
      return res.status(400).json({
        success: false,
        message: `No valid rows to import.${firstReason}`,
        data: { inserted: 0, failed: failures.length, failures }
      });
    }

    // Insert one-by-one so a single row validation error never kills the whole batch
    let inserted = 0;
    for (const doc of docs) {
      try {
        await QuickPracticeQuestion.create(doc);
        inserted++;
      } catch (e) {
        console.error('Row insert error:', e.message, '| prompt:', doc.prompt?.slice(0, 60));
        failures.push({ row: `prompt: ${doc.prompt?.slice(0, 60)}`, message: e.message });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Import completed: ${inserted} inserted, ${failures.length} failed`,
      data: {
        inserted,
        failed: failures.length,
        failures
      }
    });
  } catch (err) {
    console.error('admin quick practice import error:', err);
    return res.status(500).json({ success: false, message: 'Import error: ' + err.message });
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
    body('category').isString().trim().notEmpty().withMessage('Category is required'),
    // Admin is trusted – accept any non-empty category (mock, mock1, mock2, …)
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
    body('category').optional().isString().trim().notEmpty().withMessage('Category must be a non-empty string'),
    // Admin is trusted – accept any non-empty category
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
      // Whitelist fields — never pass req.body directly to prevent mass-assignment.
    const { category, prompt, options, correctIndex, explanation, difficulty, tags } = req.body;
    const allowedUpdate = {};
    if (category !== undefined) allowedUpdate.category = category;
    if (prompt !== undefined) allowedUpdate.prompt = prompt;
    if (options !== undefined) allowedUpdate.options = options;
    if (correctIndex !== undefined) allowedUpdate.correctIndex = correctIndex;
    if (explanation !== undefined) allowedUpdate.explanation = explanation;
    if (difficulty !== undefined) allowedUpdate.difficulty = difficulty;
    if (tags !== undefined) allowedUpdate.tags = tags;

    const updated = await QuickPracticeQuestion.findByIdAndUpdate(req.params.id, { $set: allowedUpdate }, {
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
