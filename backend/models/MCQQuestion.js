const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  explanation: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true,
    enum: ['html', 'css', 'javascript', 'react', 'nodejs', 'general']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const mcqSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  configuration: {
    topics: [{
      type: String,
      enum: ['html', 'css', 'javascript', 'react', 'nodejs', 'general']
    }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed']
    },
    numberOfQuestions: {
      type: Number,
      required: true,
      min: 5,
      max: 50
    },
    timeLimit: {
      type: Number, // in minutes
      required: true,
      min: 5,
      max: 120
    }
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MCQQuestion',
      required: true
    },
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String,
    topic: String,
    difficulty: String
  }],
  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedAnswer: {
      type: Number,
      required: true
    },
    isCorrect: Boolean,
    timeTaken: Number, // in seconds
    answeredAt: Date
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  scores: {
    total: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    topicBreakdown: [{
      topic: String,
      score: Number,
      totalQuestions: Number
    }]
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better performance
mcqSessionSchema.index({ userId: 1, createdAt: -1 });
mcqSessionSchema.index({ sessionId: 1 });

const MCQQuestion = mongoose.model('MCQQuestion', mcqQuestionSchema);
const MCQSession = mongoose.model('MCQSession', mcqSessionSchema);

module.exports = {
  MCQQuestion,
  MCQSession
};
