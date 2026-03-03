const mongoose = require('mongoose');
const { computeCurrentStreak, toUtcDayKey, toUtcDayStart } = require('../utils/streak');

const skillProgressSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  questionsAttempted: {
    type: Number,
    default: 0
  },
  questionsCorrect: {
    type: Number,
    default: 0
  },
  lastPracticed: {
    type: Date,
    default: Date.now
  }
});

const dailyActivitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  logins: {
    type: Number,
    default: 0
  },
  interviewsCompleted: {
    type: Number,
    default: 0
  },
  questionsAttempted: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
});

const achievementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: String,
  category: {
    type: String,
    enum: ['streak', 'score', 'completion', 'improvement', 'milestone'],
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  isVisible: {
    type: Boolean,
    default: true
  }
});

const studyPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  targetRole: String,
  targetCompany: String,
  duration: {
    type: Number, // in days
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  topics: [{
    name: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    resources: [String],
    estimatedTime: Number // in hours
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetEndDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  overallStats: {
    totalInterviews: {
      type: Number,
      default: 0
    },
    completedInterviews: {
      type: Number,
      default: 0
    },
    totalQuestionsAttempted: {
      type: Number,
      default: 0
    },
    totalQuestionsCorrect: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    bestScore: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0
    },
    lastActivityDate: {
      type: Date,
      default: Date.now
    }
  },
  skillProgress: [skillProgressSchema],
  dailyActivity: [dailyActivitySchema],
  achievements: [achievementSchema],
  studyPlans: [studyPlanSchema],
  weeklyGoals: {
    interviewsTarget: {
      type: Number,
      default: 5
    },
    interviewsCompleted: {
      type: Number,
      default: 0
    },
    timeTarget: {
      type: Number, // in minutes
      default: 300 // 5 hours
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    weekStartDate: {
      type: Date,
      default: () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        return new Date(now.setDate(diff));
      }
    }
  },
  preferences: {
    reminderTime: {
      type: String,
      default: '18:00'
    },
    reminderDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'wednesday', 'friday']
    }],
    goalType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
progressSchema.index({ userId: 1 });
progressSchema.index({ userId: 1, 'overallStats.lastActivityDate': -1 });
progressSchema.index({ 'overallStats.lastActivityDate': -1 });
progressSchema.index({ 'dailyActivity.date': -1 });
progressSchema.index({ userId: 1, 'dailyActivity.date': -1 });
progressSchema.index({ userId: 1, accuracyPercentage: -1 });

// Virtual for accuracy percentage
progressSchema.virtual('accuracyPercentage').get(function() {
  const { totalQuestionsAttempted, totalQuestionsCorrect } = this.overallStats;
  if (totalQuestionsAttempted === 0) return 0;
  return Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100);
});

// Virtual for weekly goal completion percentage
progressSchema.virtual('weeklyGoalCompletion').get(function() {
  const { interviewsTarget, interviewsCompleted, timeTarget, timeSpent } = this.weeklyGoals;
  const interviewProgress = interviewsTarget > 0 ? (interviewsCompleted / interviewsTarget) * 100 : 0;
  const timeProgress = timeTarget > 0 ? (timeSpent / timeTarget) * 100 : 0;
  return Math.round((interviewProgress + timeProgress) / 2);
});

// Method to update daily activity
progressSchema.methods.updateDailyActivity = function(date, updates) {
  const today = toUtcDayStart(date);
  if (!today) {
    throw new Error('Invalid date provided for daily activity update');
  }
  const todayKey = toUtcDayKey(today);
  
  // ...existing code...
  
  let dailyRecord = this.dailyActivity.find(activity => 
    toUtcDayKey(activity?.date) === todayKey
  );
  
  if (!dailyRecord) {
    // ...existing code...
    dailyRecord = {
      date: today,
      logins: 0,
      interviewsCompleted: 0,
      questionsAttempted: 0,
      timeSpent: 0,
      averageScore: 0
    };
    this.dailyActivity.push(dailyRecord);
  } else {
    // ...existing code...
  }

  const prevInterviewsCompleted = Number.isFinite(dailyRecord.interviewsCompleted)
    ? dailyRecord.interviewsCompleted
    : 0;

  const addInterviewsCompleted = Number.isFinite(updates?.interviewsCompleted)
    ? updates.interviewsCompleted
    : 0;

  if (Number.isFinite(updates?.logins)) {
    const oldLogins = dailyRecord.logins || 0;
    dailyRecord.logins = oldLogins + updates.logins;
    // ...existing code...
  }

  // Increment numeric counters (do not overwrite)
  if (Number.isFinite(updates?.interviewsCompleted)) {
    dailyRecord.interviewsCompleted = prevInterviewsCompleted + addInterviewsCompleted;
  }

  if (Number.isFinite(updates?.questionsAttempted)) {
    dailyRecord.questionsAttempted = (dailyRecord.questionsAttempted || 0) + updates.questionsAttempted;
  }

  if (Number.isFinite(updates?.timeSpent)) {
    dailyRecord.timeSpent = (dailyRecord.timeSpent || 0) + updates.timeSpent;
  }

  // Maintain a running daily average score based on interview count increments.
  if (Number.isFinite(updates?.averageScore)) {
    if (addInterviewsCompleted > 0) {
      const prevAvg = Number.isFinite(dailyRecord.averageScore) ? dailyRecord.averageScore : 0;
      const nextCount = prevInterviewsCompleted + addInterviewsCompleted;
      dailyRecord.averageScore = nextCount > 0
        ? Math.round(((prevAvg * prevInterviewsCompleted) + (updates.averageScore * addInterviewsCompleted)) / nextCount)
        : 0;
    } else {
      // If caller didn't provide an interview-count increment, treat as a direct set.
      dailyRecord.averageScore = updates.averageScore;
    }
  }

  this.overallStats.lastActivityDate = new Date();
  
  // Mark the array as modified so Mongoose saves the changes
  this.markModified('dailyActivity');
  
  // ...existing code...
  
  return this.save();
};

// Method to update skill progress
progressSchema.methods.updateSkillProgress = function(skillName, updates) {
  let skill = this.skillProgress.find(s => s.skill === skillName);
  
  if (!skill) {
    skill = {
      skill: skillName,
      level: 'beginner',
      score: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      lastPracticed: new Date()
    };
    this.skillProgress.push(skill);
  }
  
  Object.assign(skill, updates);
  skill.lastPracticed = new Date();
  
  // Update skill level based on score
  if (skill.score >= 90) skill.level = 'expert';
  else if (skill.score >= 70) skill.level = 'advanced';
  else if (skill.score >= 40) skill.level = 'intermediate';
  else skill.level = 'beginner';
  
  return this.save();
};

// Method to unlock achievement
progressSchema.methods.unlockAchievement = function(achievementData) {
  const existingAchievement = this.achievements.find(a => a.id === achievementData.id);
  
  if (!existingAchievement) {
    this.achievements.push({
      ...achievementData,
      unlockedAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to update streak
progressSchema.methods.updateStreak = function() {
  const currentStreak = computeCurrentStreak(this.dailyActivity);
  
  // ...existing code...
  // ...existing code...

  this.overallStats.currentStreak = currentStreak;
  if (currentStreak > (this.overallStats.longestStreak || 0)) {
    this.overallStats.longestStreak = currentStreak;
  }

  return this.save();
};

module.exports = mongoose.model('Progress', progressSchema);
