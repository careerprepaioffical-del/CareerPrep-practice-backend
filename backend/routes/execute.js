const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const judge0Service = require('../services/judge0Service');

const router = express.Router();

// Helper function to handle validation errors
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

/**
 * POST /api/execute
 *
 * Input:
 * {
 *   "language": "python | java | c | cpp | javascript",
 *   "code": "source code",
 *   "input": "stdin"
 * }
 *
 * Output:
 * stdout, stderr, compile_output, time, memory, status_description
 */
router.post(
  '/',
  authenticateToken,
  [
    body('language').isIn(['python', 'java', 'c', 'cpp', 'javascript']).withMessage('Invalid language'),
    body('code').notEmpty().withMessage('Code is required'),
    body('input').optional().isString().withMessage('Input must be a string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { language, code, input } = req.body;

      const result = await judge0Service.run({
        language,
        code,
        input
      });

      // Judge0 CE status_description examples: "Accepted", "Compilation Error", "Runtime Error (NZEC)", etc.
      const statusDescription = result.status_description || result.status?.description || 'Unknown';
      const isSuccess = statusDescription === 'Accepted';

      return res.json({
        success: isSuccess,
        data: {
          stdout: result.stdout,
          stderr: result.stderr,
          compile_output: result.compile_output,
          time: result.time,
          memory: result.memory,
          status_description: statusDescription
        }
      });
    } catch (error) {
      // Clean error mapping for API clients
      const code = error.code || 'EXECUTE_FAILED';

      if (code === 'UNSUPPORTED_LANGUAGE') {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (code === 'JUDGE0_TIMEOUT') {
        return res.status(504).json({ success: false, message: error.message });
      }

      // Judge0 CE failures (network, rate limits, etc.)
      const judge0Message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Execution failed';

      return res.status(502).json({
        success: false,
        message: 'Judge0 execution failed',
        error: process.env.NODE_ENV === 'development' ? judge0Message : 'Bad gateway'
      });
    }
  }
);

module.exports = router;
