const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'bot'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String }, // Optional: for grouping chats
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);