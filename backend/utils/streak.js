const toUtcDayKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const getPreviousUtcDayKey = (dayKey) => {
  const [year, month, day] = String(dayKey || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return toUtcDayKey(date);
};

const toUtcDayStart = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const isActiveActivityDay = (activity) => {
  const interviewsCompleted = Number(activity?.interviewsCompleted || 0);
  const questionsAttempted = Number(activity?.questionsAttempted || 0);
  const timeSpent = Number(activity?.timeSpent || 0);
  const logins = Number(activity?.logins || 0);

  return interviewsCompleted > 0 || questionsAttempted > 0 || timeSpent > 0 || logins > 0;
};

const computeCurrentStreak = (dailyActivity = [], now = new Date()) => {
  // ...existing code...
  
  const activeDayKeys = new Set(
    (Array.isArray(dailyActivity) ? dailyActivity : [])
      .filter((activity) => {
        return isActiveActivityDay(activity);
      })
      .map((activity) => toUtcDayKey(activity?.date))
      .filter(Boolean)
  );

  // ...existing code...

  let streak = 0;
  let cursor = toUtcDayKey(now);
  
  // ...existing code...

  while (cursor && activeDayKeys.has(cursor)) {
    streak += 1;
    // ...existing code...
    cursor = getPreviousUtcDayKey(cursor);
  }

  // ...existing code...
  return streak;
};

module.exports = {
  toUtcDayKey,
  toUtcDayStart,
  computeCurrentStreak,
  isActiveActivityDay
};
