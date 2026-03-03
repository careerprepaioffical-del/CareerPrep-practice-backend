const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    output: { type: String, default: '' },
    explanation: { type: String, default: '' }
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  },
  { _id: false }
);

const codingQuestionSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['custom', 'leetcode'],
      default: 'custom'
    },
    sourceId: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy'
    },
    constraints: { type: String, default: '' },
    examples: { type: [exampleSchema], default: [] },
    testCases: { type: [testCaseSchema], default: [] },
    starterCode: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    hints: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    timeLimit: { type: Number, default: 30 },
    memoryLimit: { type: String, default: '256MB' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodingQuestion', codingQuestionSchema);
