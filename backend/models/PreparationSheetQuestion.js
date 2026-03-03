const mongoose = require('mongoose');

const preparationSheetQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    topic: {
      type: String,
      default: 'General',
      trim: true,
      maxlength: 80
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    platform: {
      type: String,
      default: 'External',
      trim: true,
      maxlength: 80
    },
    questionUrl: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

preparationSheetQuestionSchema.index({ isActive: 1, order: 1, createdAt: -1 });
preparationSheetQuestionSchema.index({ topic: 1 });

module.exports = mongoose.model('PreparationSheetQuestion', preparationSheetQuestionSchema);
