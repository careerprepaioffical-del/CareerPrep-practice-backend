const ALLOWED_QUICK_PRACTICE_CATEGORIES = [
  // Core interview topics (recommended)
  'dsa',
  'oop',
  'dbms',
  'os',
  'networks',
  'system-design',
  'behavioral',

  // Legacy web topics (kept for backward compatibility)
  'html',
  'css',
  'javascript',
  'react',
  'nodejs',
  'general',

  // Added topics
  'linux',
  'git',
  'mock',
  'mock1'
];

const ALLOWED_QUICK_PRACTICE_COUNTS = [10, 20, 30, 40, 50];

module.exports = {
  ALLOWED_QUICK_PRACTICE_CATEGORIES,
  ALLOWED_QUICK_PRACTICE_COUNTS
};
