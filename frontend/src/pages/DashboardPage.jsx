import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Target,
  Clock,
  Award,
  ArrowRight,
  Play,
  BookOpen,
  BarChart3,
  Zap,
  Code,
  MessageSquare,
  Star,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiMethods } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [error, setError] = useState(null);
  const [quickStarting, setQuickStarting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }

        // Load stats first (critical data needed for dashboard)
        try {
          const statsRes = await apiMethods.users.getStats();
          if (mounted) {
            setStatsData(statsRes.data?.data || null);
          }
        } catch (statsError) {
          console.error('Stats load error:', statsError);
          if (mounted) {
            setStatsData(null); // Use empty state instead of failing
          }
        }

        // Load interviews in background (non-critical, can fail gracefully)
        try {
          const interviewsRes = await apiMethods.interviews.getAll({ page: 1, limit: 3 });
          if (mounted) {
            setRecentInterviews(interviewsRes.data?.data?.interviews || []);
          }
        } catch (interviewsError) {
          console.error('Interviews load error:', interviewsError);
          if (mounted) {
            setRecentInterviews([]); // Fallback to empty
          }
        }

        // Load progress in background (non-critical)
        try {
          const progressRes = await apiMethods.progress.get();
          if (mounted) {
            setProgressData(progressRes.data?.data?.progress || null);
          }
        } catch (progressError) {
          console.error('Progress load error:', progressError);
          if (mounted) {
            setProgressData(null); // Fallback to null
          }
        }

      } catch (e) {
        if (!mounted) return;
        if (!silent) setError('Failed to load some dashboard data. Please refresh.');
      } finally {
        if (!mounted) return;
        if (!silent) setLoading(false);
      }
    };

    loadDashboard();

    // Increase polling interval to 30s and skip if tab not active
    let lastRefreshTime = Date.now();
    const MIN_REFRESH_INTERVAL = 30 * 1000; // 30 seconds minimum

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        // Only refresh if 30+ seconds have passed since last refresh
        if (now - lastRefreshTime >= MIN_REFRESH_INTERVAL) {
          loadDashboard({ silent: true });
          lastRefreshTime = now;
        }
      }
    }, 10000);

    const onFocus = () => loadDashboard({ silent: true });
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadDashboard({ silent: true });
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const computed = useMemo(() => {
    const overall = statsData?.progress?.overallStats;
    const totalTimeMinutes = overall?.totalTimeSpent || 0;
    const timeSpentHours = totalTimeMinutes ? Math.round((totalTimeMinutes / 60) * 10) / 10 : 0;

    const recentActivity = Array.isArray(statsData?.progress?.recentActivity)
      ? statsData.progress.recentActivity
      : [];
    const last7Interviews = recentActivity.reduce(
      (sum, day) => sum + (day?.interviewsCompleted || 0),
      0
    );
    const last7Questions = recentActivity.reduce(
      (sum, day) => sum + (day?.questionsAttempted || 0),
      0
    );

    return {
      totalInterviews: overall?.totalInterviews ?? statsData?.user?.totalInterviews ?? 0,
      completedInterviews: overall?.completedInterviews ?? statsData?.user?.completedInterviews ?? 0,
      averageScore: overall?.averageScore ?? statsData?.user?.averageScore ?? 0,
      currentStreak: overall?.currentStreak ?? statsData?.user?.streakDays ?? 0,
      questionsAttempted: overall?.totalQuestionsAttempted ?? 0,
      accuracyPercentage: statsData?.progress?.accuracyPercentage ?? 0,
      timeSpentHours,
      last7Interviews,
      last7Questions,
      recentActivity
    };
  }, [statsData]);

  // Quick start interview function
  const handleQuickStart = async (type = 'coding') => {
    setQuickStarting(true);
    try {
      const createPayload = {
        type: type,
        configuration: {
          duration: 30,
          difficulty: 'medium',
          questionTypes: [type],
          language: 'javascript',
          numberOfQuestions: 1
        }
      };

      const created = await apiMethods.interviews.create(createPayload);
      const sessionId = created?.data?.data?.sessionId;
      if (!sessionId) throw new Error('Failed to create session');

      await apiMethods.interviews.start(sessionId);

      toast.success('Interview started successfully!', {
        icon: '🚀',
        duration: 2000
      });
      
      // Navigate to the appropriate interview page
      if (type === 'coding') {
        navigate(`/interview/coding/${sessionId}`);
      } else {
        navigate(`/interview/ai/${sessionId}`);
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to start interview';
      toast.error(message);
    } finally {
      setQuickStarting(false);
    }
  };

  const quickActions = [
    {
      title: 'Start Practice Interview',
      description: 'Begin a new interview session',
      icon: Play,
      href: '/interview',
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-white',
      primary: true
    },
    {
      title: 'Quick Start - Coding',
      description: 'Jump into a coding challenge',
      icon: Code,
      action: () => handleQuickStart('coding'),
      color: 'from-green-600 to-emerald-600',
      textColor: 'text-white',
      quick: true
    },
    {
      title: 'Quick Start - AI Interview',
      description: 'Practice with AI interviewer',
      icon: MessageSquare,
      action: () => handleQuickStart('ai_interview'),
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-white',
      quick: true
    },
    {
      title: 'View Progress',
      description: 'Check your improvement analytics',
      icon: BarChart3,
      href: '/progress',
      color: 'from-orange-600 to-yellow-600',
      textColor: 'text-white'
    },
    {
      title: 'Quick Mock Interview',
      description: 'MCQ tests on web development topics',
      icon: Target,
      href: '/quick-mock',
      color: 'from-teal-600 to-cyan-600',
      textColor: 'text-white'
    },
    {
      title: 'Preparation Guide',
      description: 'Get personalized study plans',
      icon: BookOpen,
      href: '/preparation-guide',
      color: 'from-rose-600 to-red-600',
      textColor: 'text-white'
    }
  ];

  const achievements = useMemo(() => {
    const items = Array.isArray(progressData?.achievements) ? progressData.achievements : [];
    // Show most recently unlocked first
    return items
      .slice()
      .sort((a, b) => new Date(b.unlockedAt || 0) - new Date(a.unlockedAt || 0))
      .slice(0, 4);
  }, [progressData]);

  const getCompanyDisplay = (interview) => {
    return (
      interview?.company?.name ||
      interview?.company?.role ||
      interview?.config?.company ||
      interview?.config?.profile?.targetCompany ||
      'Interview'
    );
  };

  const getRoleDisplay = (interview) => {
    return (
      interview?.company?.role ||
      interview?.config?.role ||
      interview?.config?.profile?.targetRole ||
      interview?.type ||
      ''
    );
  };

  const getInterviewScore = (interview) => {
    const score = interview?.scores?.overall;
    return typeof score === 'number' ? score : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Enhanced Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-10 text-white shadow-2xl mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-3">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              Let's keep building your skills and confidence together. You're getting better every day!
            </p>
            
            {/* Quick Start Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleQuickStart('coding')}
                disabled={quickStarting}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                {quickStarting ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Quick Start Coding</span>
                  </>
                )}
              </button>
              
              <Link
                to="/interview"
                className="flex items-center space-x-2 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all transform hover:scale-105 shadow-lg"
              >
                <Play className="w-5 h-5" />
                <span>Custom Setup</span>
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <Brain className="w-16 h-16 text-white" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="card p-8 mb-8 shadow-xl">
          <LoadingSpinner text="Loading your dashboard..." />
        </div>
      )}

      {!loading && error && (
        <div className="card p-8 mb-8 shadow-xl border-2 border-red-200 bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Unable to Load Dashboard</h3>
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-red-600 text-sm mt-2">This can happen if the backend server is starting up. Please try again in a moment.</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                // Reload dashboard
                const loadDashboard = async () => {
                  try {
                    const statsRes = await apiMethods.users.getStats();
                    setStatsData(statsRes.data?.data || null);
                  } catch (e) {
                    setStatsData(null);
                  }
                  try {
                    const interviewsRes = await apiMethods.interviews.getAll({ page: 1, limit: 3 });
                    setRecentInterviews(interviewsRes.data?.data?.interviews || []);
                  } catch (e) {
                    setRecentInterviews([]);
                  }
                  try {
                    const progressRes = await apiMethods.progress.get();
                    setProgressData(progressRes.data?.data?.progress || null);
                  } catch (e) {
                    setProgressData(null);
                  }
                  setLoading(false);
                };
                loadDashboard();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors whitespace-nowrap ml-4"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Stats Overview */}
      {!loading && !error && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-md">
                <Brain className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-xs text-slate-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                Last 7 days: {computed.last7Interviews}
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{computed.totalInterviews}</div>
            <div className="text-sm text-slate-600">Total Interviews</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-md">
                <Target className="w-7 h-7 text-green-600" />
              </div>
              <span className="text-xs text-slate-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                Accuracy: {computed.accuracyPercentage}%
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{computed.questionsAttempted}</div>
            <div className="text-sm text-slate-600">Questions Attempted</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center shadow-md">
                <Star className="w-7 h-7 text-yellow-600" />
              </div>
              <span className="text-xs text-slate-600 font-medium bg-yellow-50 px-2 py-1 rounded-full">
                Last 7 days: {computed.last7Questions}
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{computed.averageScore}%</div>
            <div className="text-sm text-slate-600">Average Score</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-md">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-xs text-slate-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                Streak: {computed.currentStreak} days
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{computed.timeSpentHours}h</div>
            <div className="text-sm text-slate-600">Time Practiced</div>
          </div>
        </div>
      </motion.div>
      )}

      {/* Enhanced Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            if (action.action) {
              // Button with action
              return (
                <motion.button
                  key={action.title}
                  onClick={action.action}
                  disabled={quickStarting}
                  className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-200 group text-left disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <action.icon className={`w-7 h-7 ${action.textColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-semibold">
                    <span>Start now</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </motion.button>
              );
            } else {
              // Link
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-200 group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <action.icon className={`w-7 h-7 ${action.textColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-semibold">
                    <span>Get started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </Link>
              );
            }
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Enhanced Recent Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Interviews</h2>
            <Link
              to="/interview"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {!loading && recentInterviews.length === 0 && (
              <div className="p-6 bg-slate-50 rounded-xl text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-700 font-semibold">No interviews yet</p>
                <p className="text-sm text-slate-600 mt-1">Start an interview to see it here.</p>
              </div>
            )}

            {recentInterviews.map((interview) => {
              const company = getCompanyDisplay(interview);
              const role = getRoleDisplay(interview);
              const score = getInterviewScore(interview);
              const createdAt = interview?.createdAt || interview?.startTime;
              return (
                <motion.div
                  key={interview.sessionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">
                        {String(company).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{company}</h3>
                      <p className="text-sm text-slate-600">{role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">
                      {typeof score === 'number' ? `${score}%` : '—'}
                    </div>
                    <div className="text-sm text-slate-600">
                      {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Enhanced Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Achievements</h2>
            <Link
              to="/progress"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!loading && achievements.length === 0 && (
              <div className="col-span-2 p-6 bg-slate-50 rounded-xl text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-700 font-semibold">No achievements yet</p>
                <p className="text-sm text-slate-600 mt-1">Complete interviews to unlock achievements.</p>
              </div>
            )}

            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * achievements.indexOf(achievement) }}
                className="p-4 rounded-xl border-2 transition-all duration-200 border-green-200 bg-green-50 hover:shadow-md"
              >
                <div className="text-3xl mb-2">{achievement.icon || '🏆'}</div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  {achievement.name}
                </h3>
                <p className="text-xs text-slate-600">{achievement.description}</p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Unlocked
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="pb-8"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <TrendingUp className="w-4 h-4" />
              <span>Last 7 days</span>
            </div>
          </div>

          {loading ? (
            <div className="py-8">
              <LoadingSpinner text="Loading activity..." />
            </div>
          ) : (
            <div className="space-y-3">
              {computed.recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-semibold text-lg">No activity yet</p>
                  <p className="text-sm text-slate-600 mt-2">Start practicing to build your streak.</p>
                  <button
                    onClick={() => handleQuickStart('coding')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Start Your First Interview
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {computed.recentActivity
                    .slice()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((day, index) => (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between bg-slate-50 rounded-xl px-6 py-4 hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            <span className="inline-flex items-center space-x-3">
                              <span className="flex items-center">
                                <Brain className="w-3 h-3 mr-1" />
                                Interviews: {day.interviewsCompleted || 0}
                              </span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Target className="w-3 h-3 mr-1" />
                                Questions: {day.questionsAttempted || 0}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-slate-900">
                            {Math.round(day.averageScore || 0)}%
                          </div>
                          <div className="text-xs text-slate-600">Avg score</div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
