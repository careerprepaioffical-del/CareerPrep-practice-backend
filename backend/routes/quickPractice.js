const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const QuickPracticeQuestion = require('../models/QuickPracticeQuestion');
const QuickPracticeSession = require('../models/QuickPracticeSession');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { ALLOWED_QUICK_PRACTICE_CATEGORIES, ALLOWED_QUICK_PRACTICE_COUNTS } = require('../constants/quickPractice');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const sanitizeSessionForUser = (session) => {
  const s = session.toObject ? session.toObject() : session;
  return {
    sessionId: s.sessionId,
    status: s.status,
    categories: s.categories,
    totalQuestions: s.totalQuestions,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    questions: (s.questions || []).map((q, idx) => ({
      index: idx,
      category: q.category,
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || '',
      difficulty: q.difficulty,
      tags: q.tags
    }))
  };
};

const findSessionOrExplain = async ({ sessionId, userId }) => {
  const session = await QuickPracticeSession.findOne({ sessionId, userId });
  if (session) return { session };

  const exists = await QuickPracticeSession.findOne({ sessionId }).select('_id userId');
  if (!exists) return { notFound: true };
  return { forbidden: true };
};

router.use(authenticateToken);

// Get available topics and their question counts
router.get('/topics', async (req, res) => {
  try {
    const topics = await QuickPracticeQuestion.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          easy: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] }
          },
          hard: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        topics: topics.map(t => ({
          name: t._id,
          total: t.count,
          breakdown: {
            easy: t.easy,
            medium: t.medium,
            hard: t.hard
          }
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics'
    });
  }
});

router.post(
  '/start',
  [
    body('count').isIn(ALLOWED_QUICK_PRACTICE_COUNTS).withMessage(`count must be one of: ${ALLOWED_QUICK_PRACTICE_COUNTS.join(', ')}`),
    body('categories').optional().isArray().withMessage('categories must be an array'),
    body('categories.*').optional().isIn(ALLOWED_QUICK_PRACTICE_CATEGORIES).withMessage('Invalid category')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const count = Number(req.body.count);
      const categories = Array.isArray(req.body.categories) && req.body.categories.length
        ? req.body.categories
        : ['dsa', 'oop', 'dbms', 'os', 'networks'];

      const match = { category: { $in: categories } };
      const sampled = await QuickPracticeQuestion.aggregate([
        { $match: match },
        { $sample: { size: count } }
      ]);

      if (!sampled || sampled.length < count) {
        return res.status(400).json({
          success: false,
          message: `Not enough questions in bank for the selected categories. Found ${sampled?.length || 0}, need ${count}.`
        });
      }

      const sessionId = uuidv4();
      const session = await QuickPracticeSession.create({
        sessionId,
        userId: req.user._id,
        categories,
        totalQuestions: count,
        questions: sampled.map((q) => ({
          questionId: q._id,
          category: q.category,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'easy',
          tags: q.tags || []
        }))
      });

      res.status(201).json({
        success: true,
        data: sanitizeSessionForUser(session)
      });
    } catch (err) {
      console.error('quick practice start error:', err);
      res.status(500).json({ success: false, message: 'Failed to start quick practice' });
    }
  }
);

router.get('/session/:sessionId', async (req, res) => {
  try {
    const { session, notFound, forbidden } = await findSessionOrExplain({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (notFound) return res.status(404).json({ success: false, message: 'Session not found' });
    if (forbidden) return res.status(403).json({ success: false, message: 'Access denied for this session' });

    res.json({ success: true, data: sanitizeSessionForUser(session) });
  } catch (err) {
    console.error('quick practice get session error:', err);
    res.status(500).json({ success: false, message: 'Failed to load session' });
  }
});

router.get('/session/:sessionId/results', async (req, res) => {
  try {
    const { session, notFound, forbidden } = await findSessionOrExplain({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (notFound) return res.status(404).json({ success: false, message: 'Session not found' });
    if (forbidden) return res.status(403).json({ success: false, message: 'Access denied for this session' });

    if (session.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Session not completed yet' });
    }

    const answers = Array.isArray(session.answers) ? session.answers : [];
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        score: session.score,
        completedAt: session.completedAt,
        review: session.questions.map((q, index) => {
          const a = answers.find((x) => x.questionIndex === index);
          return {
            index,
            category: q.category,
            prompt: q.prompt,
            options: q.options,
            selectedIndex: a ? a.selectedIndex : null,
            correctIndex: q.correctIndex,
            isCorrect: a ? a.selectedIndex === q.correctIndex : false,
            explanation: q.explanation || ''
          };
        })
      }
    });
  } catch (err) {
    console.error('quick practice results error:', err);
    res.status(500).json({ success: false, message: 'Failed to load results' });
  }
});

router.post(
  '/session/:sessionId/submit',
  [
    body('answers').isArray().withMessage('answers must be an array'),
    body('answers.*.questionIndex').isInt({ min: 0 }).withMessage('questionIndex must be >= 0'),
    body('answers.*.selectedIndex').isInt({ min: 0 }).withMessage('selectedIndex must be >= 0')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { session, notFound, forbidden } = await findSessionOrExplain({
        sessionId: req.params.sessionId,
        userId: req.user._id
      });

      if (notFound) return res.status(404).json({ success: false, message: 'Session not found' });
      if (forbidden) return res.status(403).json({ success: false, message: 'Access denied for this session' });

      if (session.status === 'completed') {
        return res.json({
          success: true,
          data: {
            sessionId: session.sessionId,
            status: session.status,
            score: session.score,
            completedAt: session.completedAt
          }
        });
      }

      const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
      const normalized = answers
        .map((a) => ({
          questionIndex: Number(a.questionIndex),
          selectedIndex: Number(a.selectedIndex)
        }))
        .filter((a) => Number.isInteger(a.questionIndex) && Number.isInteger(a.selectedIndex));

      // Only keep last answer per questionIndex
      const latestByIndex = new Map();
      for (const a of normalized) latestByIndex.set(a.questionIndex, a);
      const deduped = [...latestByIndex.values()];

      let correct = 0;
      for (const a of deduped) {
        const q = session.questions[a.questionIndex];
        if (!q) continue;
        if (a.selectedIndex === q.correctIndex) correct += 1;
      }

      const total = session.questions.length;
      const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

      session.answers = deduped;
      session.score = { correct, total, percent };
      session.status = 'completed';
      session.completedAt = new Date();
      await session.save();

      // Update user + progress stats (so dashboard/progress pages reflect results).
      try {
        const userId = req.user._id;
        const [user, existingProgress] = await Promise.all([
          User.findById(userId),
          Progress.findOne({ userId })
        ]);

        const progress = existingProgress || new Progress({ userId });

        const answeredCount = deduped.length;
        const correctCount = correct;
        const overallPercent = percent;

        await progress.updateDailyActivity(new Date(), {
          interviewsCompleted: 1,
          questionsAttempted: answeredCount,
          timeSpent: 0,
          averageScore: overallPercent
        });

        progress.overallStats.bestScore = Math.max(progress.overallStats.bestScore || 0, overallPercent || 0);
        progress.overallStats.completedInterviews += 1;
        progress.overallStats.totalInterviews += 1;
        progress.overallStats.totalQuestionsAttempted += answeredCount;
        progress.overallStats.totalQuestionsCorrect += correctCount;

        const completed = progress.overallStats.completedInterviews || 1;
        const prevAvg = progress.overallStats.averageScore || 0;
        progress.overallStats.averageScore = Math.round(
          ((prevAvg * (completed - 1)) + (overallPercent || 0)) / completed
        );

        // Update per-category skill progress (cumulative accuracy per category).
        const byCategory = new Map();
        for (const a of deduped) {
          const q = session.questions?.[a.questionIndex];
          if (!q?.category) continue;
          const key = q.category;
          const stats = byCategory.get(key) || { attempted: 0, correct: 0 };
          stats.attempted += 1;
          if (a.selectedIndex === q.correctIndex) stats.correct += 1;
          byCategory.set(key, stats);
        }

        for (const [category, stats] of byCategory.entries()) {
          const existing = progress.skillProgress.find((s) => s.skill === category);
          const prevAttempted = existing?.questionsAttempted || 0;
          const prevCorrect = existing?.questionsCorrect || 0;
          const nextAttempted = prevAttempted + stats.attempted;
          const nextCorrect = prevCorrect + stats.correct;
          const nextScore = nextAttempted > 0 ? Math.round((nextCorrect / nextAttempted) * 100) : 0;

          await progress.updateSkillProgress(category, {
            score: nextScore,
            questionsAttempted: nextAttempted,
            questionsCorrect: nextCorrect
          });
        }

        await progress.updateStreak();

        if (user) {
          user.stats.totalInterviews += 1;
          user.stats.completedInterviews += 1;
          const userCompleted = user.stats.completedInterviews || 1;
          const userPrevAvg = user.stats.averageScore || 0;
          user.stats.averageScore = Math.round(
            ((userPrevAvg * (userCompleted - 1)) + (overallPercent || 0)) / userCompleted
          );
          user.stats.streakDays = progress.overallStats.currentStreak || 0;
          user.stats.lastActiveDate = new Date();
          await user.save();
        }
      } catch (statsErr) {
        // Do not fail the submission if stats updates fail.
        console.warn('quick practice stats update error:', statsErr);
      }

      res.json({
        success: true,
        data: {
          sessionId: session.sessionId,
          status: session.status,
          score: session.score,
          completedAt: session.completedAt,
          review: session.questions.map((q, index) => {
            const a = deduped.find((x) => x.questionIndex === index);
            return {
              index,
              category: q.category,
              prompt: q.prompt,
              options: q.options,
              selectedIndex: a ? a.selectedIndex : null,
              correctIndex: q.correctIndex,
              isCorrect: a ? a.selectedIndex === q.correctIndex : false,
              explanation: q.explanation || ''
            };
          })
        }
      });
    } catch (err) {
      console.error('quick practice submit error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit quick practice' });
    }
  }
);

module.exports = router;
