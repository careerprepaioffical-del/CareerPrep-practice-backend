const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['coding', 'behavioral', 'technical', 'system-design'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  constraints: String,
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  starterCode: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  hints: [String],
  tags: [String],
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  memoryLimit: {
    type: String,
    default: '256MB'
  }
});

const responseSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  code: String,
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript']
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  isCorrect: Boolean,
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  feedback: {
    correctness: String,
    efficiency: String,
    codeQuality: String,
    communication: String,
    overall: String,
    suggestions: [String]
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const interviewSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['practice', 'mock', 'company-specific', 'ai_interview', 'ai_interview_personalized', 'coding'],
    required: true
  },
  company: {
    name: String,
    role: String,
    level: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead']
    }
  },
  configuration: {
    duration: {
      type: Number, // in minutes
      default: 60
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed'
    },
    questionTypes: [{
      type: String,
      enum: ['coding', 'behavioral', 'technical', 'system-design']
    }],
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript'],
      default: 'javascript'
    },
    numberOfQuestions: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  questions: [questionSchema],
  responses: [responseSchema],
  // AI interview sessions store conversational turns + analysis here.
  // (The main `responses` schema is designed for coding/practice workflows.)
  aiResponses: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'in_progress', 'completed', 'abandoned'],
    default: 'scheduled'
  },
  startTime: Date,
  endTime: Date,
  totalDuration: Number, // in seconds
  scores: {
    technical: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    behavioral: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    communication: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  feedback: {
    strengths: [String],
    improvements: [String],
    recommendations: [String],
    nextSteps: [String]
  },
  aiAnalysis: {
    performanceInsights: String,
    skillGaps: [String],
    recommendedTopics: [String],
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceInfo: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ sessionId: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ 'company.name': 1 });
interviewSchema.index({ type: 1 });

// Virtual for completion percentage
interviewSchema.virtual('completionPercentage').get(function() {
  if (this.questions.length === 0) return 0;
  return Math.round((this.responses.length / this.questions.length) * 100);
});

// Virtual for average response time
interviewSchema.virtual('averageResponseTime').get(function() {
  if (this.responses.length === 0) return 0;
  const totalTime = this.responses.reduce((sum, response) => sum + response.timeTaken, 0);
  return Math.round(totalTime / this.responses.length);
});

// Method to calculate overall score
interviewSchema.methods.calculateOverallScore = function() {
  const scores = this.scores;
  const weights = {
    technical: 0.4,
    behavioral: 0.3,
    communication: 0.3
  };
  
  const overall = (
    scores.technical * weights.technical +
    scores.behavioral * weights.behavioral +
    scores.communication * weights.communication
  );
  
  this.scores.overall = Math.round(overall);
  return this.scores.overall;
};

// Method to update interview status
interviewSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  if (newStatus === 'in-progress' && !this.startTime) {
    this.startTime = new Date();
  } else if (newStatus === 'completed' && !this.endTime) {
    this.endTime = new Date();
    if (this.startTime) {
      this.totalDuration = Math.round((this.endTime - this.startTime) / 1000);
    }
  }
  
  return this.save();
};

module.exports = mongoose.model('Interview', interviewSchema);
// Updated model with AI interview support
