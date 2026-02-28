const mongoose = require('mongoose');

const preparationSheetProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    completedQuestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PreparationSheetQuestion'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PreparationSheetProgress', preparationSheetProgressSchema);
