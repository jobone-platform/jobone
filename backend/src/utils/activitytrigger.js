import Activity from '../models/activity.js';

export const logActivity = async (userId, action, targetId = null) => {
  try {
    if (!userId || !action) return;
    await Activity.create({ userId, action, targetId });
  } catch (err) {
    // Non-blocking operational log error handling
    console.error(`[ActivityLogger] Failed to log activity "${action}" for user "${userId}":`, err.message);
  }
};

export default logActivity;