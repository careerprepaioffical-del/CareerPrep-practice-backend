const mongoose = require('mongoose');

const { ALLOWED_QUICK_PRACTICE_CATEGORIES } = require('../constants/quickPractice');

const quickPracticeSessionQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuickPracticeQuestion' },
    category: { type: String, enum: ALLOWED_QUICK_PRACTICE_CATEGORIES, required: true },
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    tags: { type: [String], default: [] }
  },
  { _id: false }
);

const quickPracticeSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    categories: { type: [String], default: [] },
    totalQuestions: { type: Number, required: true },
    questions: { type: [quickPracticeSessionQuestionSchema], default: [] },
    answers: {
      type: [
        {
          questionIndex: { type: Number, required: true },
          selectedIndex: { type: Number, required: true }
        }
      ],
      default: []
    },
    score: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percent: { type: Number, default: 0 }
    },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuickPracticeSession', quickPracticeSessionSchema);
