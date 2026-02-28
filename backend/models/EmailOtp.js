const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ['signup', 'password_reset'],
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete documents once expired.
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

emailOtpSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model('EmailOtp', emailOtpSchema);
