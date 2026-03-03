import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  ArrowRight, 
  RotateCcw,
  Trophy,
  Star,
  TrendingUp,
  Award,
  BarChart3,
  BookOpen,
  Lightbulb,
  Zap,
  Heart
} from 'lucide-react';
import { apiMethods } from '../../utils/api';

const InterviewResultsPage = () => {
  const { sessionId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!sessionId) return;
      setLoading(true);
      setError('');
      try {
        const resp = await apiMethods.interviews.getById(sessionId);
        setInterview(resp?.data?.data?.interview || null);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const results = useMemo(() => {
    if (!interview) return null;

    const questions = Array.isArray(interview.questions) ? interview.questions : [];
    const responses = Array.isArray(interview.responses) ? interview.responses : [];
    const responseById = new Map(responses.map(r => [r.questionId, r]));

    const durationSeconds = typeof interview.totalDuration === 'number'
      ? interview.totalDuration
      : (interview.startTime && interview.endTime)
        ? Math.round((new Date(interview.endTime) - new Date(interview.startTime)) / 1000)
        : 0;

    const durationText = durationSeconds
      ? `${Math.max(1, Math.round(durationSeconds / 60))} minutes`
      : `${Number(interview.configuration?.duration || 0)} minutes`;

    const questionResults = questions.map((q) => {
      const r = responseById.get(q.id);
      const score = typeof r?.score === 'number' ? r.score : Number(r?.score || 0);
      const timeTakenSeconds = typeof r?.timeTaken === 'number' ? r.timeTaken : Number(r?.timeTaken || 0);
      const status = r?.isCorrect ? 'correct' : (score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs-work');

      return {
        id: q.id,
        title: q.title,
        type: q.type,
        difficulty: q.difficulty,
        score,
        status,
        timeTaken: timeTakenSeconds ? `${Math.max(1, Math.round(timeTakenSeconds / 60))} minutes` : '—'
      };
    });

    return {
      overall: {
        score: interview.scores?.overall || 0,
        status: interview.status || 'completed',
        duration: durationText,
        questionsAnswered: responses.length,
        totalQuestions: questions.length
      },
      scores: {
        technical: interview.scores?.technical || 0,
        behavioral: interview.scores?.behavioral || 0,
        communication: interview.scores?.communication || 0,
        overall: interview.scores?.overall || 0
      },
      questions: questionResults,
      feedback: {
        strengths: Array.isArray(interview.feedback?.strengths) ? interview.feedback.strengths : [],
        improvements: Array.isArray(interview.feedback?.improvements) ? interview.feedback.improvements : [],
        recommendations: Array.isArray(interview.feedback?.recommendations) ? interview.feedback.recommendations : []
      }
    };
  }, [interview]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'correct':
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial':
      case 'good':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Expert', icon: Trophy, color: 'text-green-600' };
    if (score >= 80) return { level: 'Advanced', icon: Star, color: 'text-blue-600' };
    if (score >= 70) return { level: 'Intermediate', icon: TrendingUp, color: 'text-yellow-600' };
    if (score >= 60) return { level: 'Developing', icon: Award, color: 'text-orange-600' };
    return { level: 'Beginner', icon: Target, color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading results…</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700 font-medium">{error}</div>
          </div>
        </div>
      ) : !results ? (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700 font-medium">Results not found.</div>
          </div>
        </div>
      ) : (
      <>
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-6 py-12"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Interview Complete!
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            Here's how you performed in your interview session
          </p>
          
          <div className="flex items-center justify-center space-x-2">
            {(() => {
              const performance = getPerformanceLevel(results.overall.score);
              const Icon = performance.icon;
              return (
                <>
                  <Icon className={`w-6 h-6 ${performance.color}`} />
                  <span className={`text-lg font-semibold ${performance.color}`}>
                    {performance.level} Level
                  </span>
                </>
              );
            })()}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 pb-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(results.overall.score)} flex items-center justify-center shadow-lg`}>
                  <span className="text-4xl font-bold text-white">
                    {results.overall.score}%
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-slate-200">
                  {(() => {
                    const performance = getPerformanceLevel(results.overall.score);
                    const Icon = performance.icon;
                    return <Icon className={`w-6 h-6 ${performance.color}`} />;
                  })()}
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-slate-900">Overall Score</h2>
                <p className="text-slate-600 mt-1">
                  {results.overall.questionsAnswered} of {results.overall.totalQuestions} questions completed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {results.scores.technical}%
                </div>
                <div className="text-sm text-slate-600">Technical</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {results.scores.behavioral}%
                </div>
                <div className="text-sm text-slate-600">Behavioral</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {results.scores.communication}%
                </div>
                <div className="text-sm text-slate-600">Communication</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {results.overall.duration}
                </div>
                <div className="text-sm text-slate-600">Duration</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-6 pb-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Question Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              Question Results
            </h2>

            <div className="space-y-3">
              {results.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(question.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {question.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                          {question.type}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold capitalize">
                          {question.difficulty}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-500">{question.timeTaken}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`text-lg font-bold ${getScoreColor(question.score)}`}>
                      {question.score}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Strengths */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
                Strengths
              </h3>
              {results.feedback.strengths.length ? (
                <div className="space-y-3">
                  {results.feedback.strengths.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 leading-relaxed">{strength}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg">
                  No strengths recorded.
                </div>
              )}
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <Target className="w-4 h-4 text-yellow-600" />
                </div>
                Areas for Improvement
              </h3>
              {results.feedback.improvements.length ? (
                <div className="space-y-3">
                  {results.feedback.improvements.map((improvement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <Target className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 leading-relaxed">{improvement}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg">
                  No improvements recorded.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-6 pb-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Lightbulb className="w-4 h-4 text-purple-600" />
              </div>
              Recommendations for Next Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.feedback.recommendations.length ? (
                results.feedback.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <BookOpen className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700 leading-relaxed">{recommendation}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <Lightbulb className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">No recommendations available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready for more?</h3>
              <p className="text-slate-600">Continue your learning journey with these next steps</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/interview/setup"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Practice Again</span>
              </Link>
              
              <Link
                to="/progress"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <TrendingUp className="w-5 h-5" />
                <span>View Progress</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/dashboard"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
              >
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
      </>
      )}
    </div>
  );
};

export default InterviewResultsPage;
