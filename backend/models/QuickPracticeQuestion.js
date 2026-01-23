const mongoose = require('mongoose');

const { ALLOWED_QUICK_PRACTICE_CATEGORIES } = require('../constants/quickPractice');

const quickPracticeQuestionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ALLOWED_QUICK_PRACTICE_CATEGORIES
    },
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2 && v.every((x) => String(x || '').trim().length > 0),
        message: 'Options must be an array with at least 2 non-empty strings'
      }
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0
    },
    explanation: {
      type: String,
      default: '',
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy'
    }
  },
  { timestamps: true }
);

quickPracticeQuestionSchema.pre('validate', function (next) {
  const opts = Array.isArray(this.options) ? this.options : [];
  if (typeof this.correctIndex === 'number' && this.correctIndex >= opts.length) {
    this.invalidate('correctIndex', 'correctIndex must be within options range');
  }
  next();
});

module.exports = mongoose.model('QuickPracticeQuestion', quickPracticeQuestionSchema);
