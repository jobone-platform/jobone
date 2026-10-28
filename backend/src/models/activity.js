import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, enum: ['apply', 'message', 'viewProfile', 'login'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // e.g., Job ID or Recipient ID
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;