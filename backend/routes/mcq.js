const express = require('express');
const router = express.Router();
const { MCQQuestion, MCQSession } = require('../models/MCQQuestion');
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
const Progress = require('../models/Progress');
const User = require('../models/User');

const buildCompletedSessionPayload = (session) => ({
  sessionId: session.sessionId,
  scores: session.scores,
  timeSpent: session.timeSpent,
  responses: session.responses.map(r => {
    const question = session.questions.find(q => q.questionId.toString() === r.questionId.toString());
    return {
      questionId: r.questionId,
      question: question.question,
      selectedAnswer: r.selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: r.isCorrect,
      explanation: question.explanation,
      topic: question.topic,
      difficulty: question.difficulty
    };
  })
});

// Get available topics and their question counts
router.get('/topics', async (req, res) => {
  try {
    const topics = await MCQQuestion.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$topic',
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

// Create a new MCQ session
router.post('/create', async (req, res) => {
  try {
    const { topics, difficulty, numberOfQuestions, timeLimit } = req.body;
    const userId = req.user.id; // User is now attached by auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Validate input
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topics are required'
      });
    }

    if (!numberOfQuestions || numberOfQuestions < 5 || numberOfQuestions > 50) {
      return res.status(400).json({
        success: false,
        message: 'Number of questions must be between 5 and 50'
      });
    }

    // Build query for questions
    const query = {
      isActive: true,
      topic: { $in: topics }
    };

    if (difficulty !== 'mixed') {
      query.difficulty = difficulty;
    }

    // Get available questions
    const availableQuestions = await MCQQuestion.find(query);
    
    if (availableQuestions.length < numberOfQuestions) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableQuestions.length} questions available for the selected criteria`
      });
    }

    // Randomly select questions
    const selectedQuestions = _.sampleSize(availableQuestions, numberOfQuestions);

    // Create session
    const sessionId = uuidv4();
    const session = new MCQSession({
      userId,
      sessionId,
      configuration: {
        topics,
        difficulty,
        numberOfQuestions,
        timeLimit
      },
      questions: selectedQuestions.map(q => ({
        questionId: q._id,
        question: q.question,
        options: q.options.map(opt => opt.text),
        correctAnswer: q.options.findIndex(opt => opt.isCorrect),
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty
      }))
    });

    await session.save();

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        configuration: session.configuration,
        questions: session.questions.map((q, index) => ({
          index: index + 1,
          questionId: q.questionId,
          question: q.question,
          options: q.options,
          topic: q.topic,
          difficulty: q.difficulty
        }))
      }
    });
  } catch (error) {
    console.error('Error creating MCQ session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session'
    });
  }
});

// Get session details
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await MCQSession.findOne({ sessionId, userId })
      .populate('questions.questionId');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        configuration: session.configuration,
        questions: session.questions.map((q, index) => ({
          index: index + 1,
          questionId: q.questionId,
          question: q.question,
          options: q.options,
          topic: q.topic,
          difficulty: q.difficulty
        })),
        startTime: session.startTime,
        status: session.status,
        responses: session.responses,
        timeSpent: session.timeSpent
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session'
    });
  }
});

// Submit answer
router.post('/session/:sessionId/answer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, selectedAnswer, timeTaken } = req.body;
    const userId = req.user.id;

    const session = await MCQSession.findOne({ sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Session is not active'
      });
    }

    // Find the question
    const question = session.questions.find(q => q.questionId.toString() === questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if already answered
    const existingResponse = session.responses.find(r => r.questionId.toString() === questionId);
    if (existingResponse) {
      return res.json({
        success: true,
        data: {
          isCorrect: existingResponse.isCorrect,
          explanation: question.explanation,
          correctAnswer: question.correctAnswer,
          idempotent: true
        }
      });
    }

    // Calculate if correct
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Add response
    session.responses.push({
      questionId,
      selectedAnswer,
      isCorrect,
      timeTaken: timeTaken || 0,
      answeredAt: new Date()
    });

    await session.save();

    res.json({
      success: true,
      data: {
        isCorrect,
        explanation: question.explanation,
        correctAnswer: question.correctAnswer
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer'
    });
  }
});

// Complete session
router.post('/session/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await MCQSession.findOne({ sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status === 'completed') {
      return res.json({
        success: true,
        data: {
          ...buildCompletedSessionPayload(session),
          idempotent: true
        }
      });
    }

    if (session.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Session is not active'
      });
    }

    // Calculate scores
    const totalQuestions = session.questions.length;
    const correctAnswers = session.responses.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculate topic breakdown
    const topicBreakdown = {};
    session.questions.forEach(q => {
      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { correct: 0, total: 0 };
      }
      topicBreakdown[q.topic].total++;
      
      const response = session.responses.find(r => r.questionId.toString() === q.questionId.toString());
      if (response && response.isCorrect) {
        topicBreakdown[q.topic].correct++;
      }
    });

    const topicScores = Object.entries(topicBreakdown).map(([topic, breakdown]) => ({
      topic,
      score: Math.round((breakdown.correct / breakdown.total) * 100),
      totalQuestions: breakdown.total
    }));

    const endTime = new Date();
    const timeSpent = Math.round((endTime - session.startTime) / 1000);

    const updatedSession = await MCQSession.findOneAndUpdate(
      { _id: session._id, status: 'in-progress' },
      {
        $set: {
          status: 'completed',
          endTime,
          timeSpent,
          scores: {
            total: correctAnswers,
            percentage,
            topicBreakdown: topicScores
          }
        }
      },
      { new: true }
    );

    if (!updatedSession) {
      const latest = await MCQSession.findOne({ sessionId, userId });
      if (latest?.status === 'completed') {
        return res.json({
          success: true,
          data: {
            ...buildCompletedSessionPayload(latest),
            idempotent: true
          }
        });
      }
      return res.status(409).json({
        success: false,
        message: 'Session state changed. Please retry.'
      });
    }

    // Update progress + user stats so dashboard reflects quick-mock completions.
    try {
      const [user, existingProgress] = await Promise.all([
        User.findById(userId),
        Progress.findOne({ userId })
      ]);

      const progress = existingProgress || new Progress({ userId });
      const answeredCount = Array.isArray(updatedSession.responses) ? updatedSession.responses.length : 0;
      const minutes = updatedSession.timeSpent > 0 ? Math.max(1, Math.round(updatedSession.timeSpent / 60)) : 0;

      await progress.updateDailyActivity(new Date(), {
        interviewsCompleted: 1,
        questionsAttempted: answeredCount,
        timeSpent: minutes,
        averageScore: percentage
      });

      progress.overallStats.bestScore = Math.max(progress.overallStats.bestScore || 0, percentage || 0);
      progress.overallStats.completedInterviews += 1;
      progress.overallStats.totalInterviews += 1;
      progress.overallStats.totalQuestionsAttempted += answeredCount;
      progress.overallStats.totalQuestionsCorrect += correctAnswers;
      progress.overallStats.totalTimeSpent += minutes;

      const completed = progress.overallStats.completedInterviews || 1;
      const prevAvg = progress.overallStats.averageScore || 0;
      progress.overallStats.averageScore = Math.round(((prevAvg * (completed - 1)) + (percentage || 0)) / completed);

      await progress.updateStreak();
      await progress.save();

      if (user) {
        user.stats.totalInterviews += 1;
        user.stats.completedInterviews += 1;
        const userCompleted = user.stats.completedInterviews || 1;
        const userPrevAvg = user.stats.averageScore || 0;
        user.stats.averageScore = Math.round(((userPrevAvg * (userCompleted - 1)) + (percentage || 0)) / userCompleted);
        user.stats.streakDays = progress.overallStats.currentStreak || 0;
        user.stats.lastActiveDate = new Date();
        await user.save();
      }
    } catch (statsError) {
      console.warn('mcq stats update error:', statsError);
    }

    res.json({
      success: true,
      data: buildCompletedSessionPayload(updatedSession)
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete session'
    });
  }
});

// Get session results
router.get('/session/:sessionId/results', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await MCQSession.findOne({ sessionId, userId });

    if (!session || session.status !== 'completed') {
      return res.status(404).json({
        success: false,
        message: 'Results not found'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        configuration: session.configuration,
        scores: session.scores,
        timeSpent: session.timeSpent,
        startTime: session.startTime,
        endTime: session.endTime,
        responses: session.responses.map(r => {
          const question = session.questions.find(q => q.questionId.toString() === r.questionId.toString());
          return {
            questionId: r.questionId,
            question: question.question,
            options: question.options,
            selectedAnswer: r.selectedAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: r.isCorrect,
            explanation: question.explanation,
            topic: question.topic,
            difficulty: question.difficulty,
            timeTaken: r.timeTaken
          };
        })
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
});

module.exports = router;
