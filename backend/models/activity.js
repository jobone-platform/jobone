const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['apply', 'message', 'viewProfile', 'login'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // e.g., Job ID or Recipient ID
  timestamp: { type: Date, default: Date.now }
});