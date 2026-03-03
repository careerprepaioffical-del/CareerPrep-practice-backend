const User = require('../models/User');
const Progress = require('../models/Progress');

const markLoginActivityAndStreak = async (userId) => {
  let progress = await Progress.findOne({ userId });

  if (!progress) {
    progress = new Progress({ userId });
  }

  // Update daily activity with login
  await progress.updateDailyActivity(new Date(), { logins: 1 });

  // Reload progress to ensure we have the saved state
  progress = await Progress.findOne({ userId });

  // Recompute streak
  await progress.updateStreak();

  // Reload again to get the freshly computed streak
  progress = await Progress.findOne({ userId });

  const currentStreak = progress.overallStats.currentStreak || 0;

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        lastLogin: new Date(),
        'stats.lastActiveDate': new Date(),
        'stats.streakDays': currentStreak
      }
    }
  );

  return currentStreak;
};

module.exports = {
  markLoginActivityAndStreak
};
