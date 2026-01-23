const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    experience: {
      type: String,
      enum: ['fresher', '0-1', '1-3', '3-5', '5+'],
      default: 'fresher'
    },
    skills: [{
      type: String,
      trim: true
    }],
    targetCompanies: [{
      type: String,
      trim: true
    }],
    targetRoles: [{
      type: String,
      trim: true
    }],
    preferredLanguages: [{
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript'],
      default: 'javascript'
    }]
  },
  preferences: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed'
    },
    interviewTypes: [{
      type: String,
      enum: ['technical', 'behavioral', 'system-design', 'coding'],
      default: ['technical', 'behavioral']
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    totalInterviews: {
      type: Number,
      default: 0
    },
    completedInterviews: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'stats.lastActiveDate': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  let completion = 0;
  const fields = ['name', 'email', 'profile.bio', 'profile.experience'];
  
  fields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj && obj[key], this);
    if (value) completion += 25;
  });
  
  if (this.profile.skills && this.profile.skills.length > 0) completion += 25;
  
  return Math.min(completion, 100);
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const rounds = Math.max(8, parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10) || 12);
    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active date
userSchema.methods.updateLastActive = function() {
  this.stats.lastActiveDate = new Date();
  return this.save();
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
