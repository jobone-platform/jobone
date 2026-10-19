import { logActivity } from '../utils/activitytrigger.js'; // Adjust path

export const auditAction = (action) => {
  return async (req, res, next) => {
    // Only track if there is a logged-in user
    if (req.user) {
      await logActivity(req.user._id, action, req.params.id || req.body.jobId);
    }
    next();
  };
};