export const logActivity = async (userId, action, targetId = null) => {
  await Activity.create({ userId, action, targetId });
};