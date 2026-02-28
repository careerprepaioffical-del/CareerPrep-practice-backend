const User = require('../models/User');
const Progress = require('../models/Progress');
const { toUtcDayKey } = require('../utils/streak');

const markLoginActivityAndStreak = async (userId) => {
  // ...existing code...
  
  let progress = await Progress.findOne({ userId });
  
  if (!progress) {
    // ...existing code...
    progress = new Progress({ userId });
  }
  
  // ...existing code...
  console.log('[STREAK SERVICE] Before update - currentStreak:', progress.overallStats?.currentStreak || 0);

  // Update daily activity with login
  await progress.updateDailyActivity(new Date(), {
    logins: 1
  });
  
  console.log('[STREAK SERVICE] After updateDailyActivity - dailyActivity length:', progress.dailyActivity?.length || 0);
  
  // Reload progress to ensure we have the saved data
  progress = await Progress.findOne({ userId });
  console.log('[STREAK SERVICE] After reload - dailyActivity length:', progress.dailyActivity?.length || 0);
  
  // Log last 3 days to debug
  const last3 = (progress.dailyActivity || []).slice(-3).map(a => ({
    date: toUtcDayKey(a.date),
    logins: a.logins,
    interviews: a.interviewsCompleted,
    questions: a.questionsAttempted,
    time: a.timeSpent
  }));
  console.log('[STREAK SERVICE] Last 3 activity records:', JSON.stringify(last3, null, 2));

  // Update streak computation
  await progress.updateStreak();
  
  // Reload again to get the computed streak
  progress = await Progress.findOne({ userId });

  const currentStreak = progress.overallStats.currentStreak || 0;

  console.log('[STREAK SERVICE] Final computed streak:', currentStreak);

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
  
  console.log('[STREAK SERVICE] User.stats.streakDays updated to:', currentStreak);

  return currentStreak;
};

module.exports = {
  markLoginActivityAndStreak
};
