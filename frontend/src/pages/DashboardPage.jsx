import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  ArrowRight,
  Play,
  BookOpen,
  BarChart3,
  Code,
  MessageSquare,
  Star,
  CheckCircle,
  Swords,
  GraduationCap
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
      let failSafeTimer;

      try {
        if (!silent) {
          setLoading(true);
          setError(null);
          failSafeTimer = setTimeout(() => {
            if (!mounted) return;
            setLoading(false);
            setError((prev) => prev || 'Dashboard is taking too long to load. Please retry.');
          }, 12000);
        }

        const requestConfig = {
          skipNetworkToast: true,
          skipErrorToast: silent,
          timeout: 10000
        };

        const [statsResult, interviewsResult, progressResult] = await Promise.allSettled([
          apiMethods.users.getStats(requestConfig),
          apiMethods.interviews.getAll({ page: 1, limit: 3 }, requestConfig),
          apiMethods.progress.get(requestConfig)
        ]);

        if (!mounted) return;

        if (statsResult.status === 'fulfilled') {
          const data = statsResult.value.data?.data || null;
          console.log('[DASHBOARD DEBUG] Stats API response:', JSON.stringify(data, null, 2));
          console.log('[DASHBOARD DEBUG] user.streakDays:', data?.user?.streakDays);
          console.log('[DASHBOARD DEBUG] progress.overallStats.currentStreak:', data?.progress?.overallStats?.currentStreak);
          setStatsData(data);
        } else {
          console.error('Stats load error:', statsResult.reason);
          setStatsData(null);
        }

        if (interviewsResult.status === 'fulfilled') {
          setRecentInterviews(interviewsResult.value.data?.data?.interviews || []);
        } else {
          console.error('Interviews load error:', interviewsResult.reason);
          setRecentInterviews([]);
        }

        if (progressResult.status === 'fulfilled') {
          setProgressData(progressResult.value.data?.data?.progress || null);
        } else {
          console.error('Progress load error:', progressResult.reason);
          setProgressData(null);
        }

        if (!silent && statsResult.status === 'rejected' && interviewsResult.status === 'rejected' && progressResult.status === 'rejected') {
          setError('Failed to load dashboard data. Please try again.');
        }
      } catch (error) {
        console.error('Dashboard load error:', error);
        if (!mounted) return;
        if (!silent) {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        if (failSafeTimer) clearTimeout(failSafeTimer);
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
    const timePracticedDisplay = totalTimeMinutes < 60
      ? `${totalTimeMinutes}m`
      : `${timeSpentHours}h`;

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

    const currentStreak = overall?.currentStreak ?? statsData?.user?.streakDays ?? 0;
    console.log('[DASHBOARD DEBUG] Computed currentStreak:', currentStreak, 'from', { 
      overallCurrentStreak: overall?.currentStreak, 
      userStreakDays: statsData?.user?.streakDays 
    });

    return {
      totalInterviews: overall?.totalInterviews ?? statsData?.user?.totalInterviews ?? 0,
      completedInterviews: overall?.completedInterviews ?? statsData?.user?.completedInterviews ?? 0,
      averageScore: overall?.averageScore ?? statsData?.user?.averageScore ?? 0,
      currentStreak,
      questionsAttempted: overall?.totalQuestionsAttempted ?? 0,
      accuracyPercentage: statsData?.progress?.accuracyPercentage ?? 0,
      totalTimeMinutes,
      timeSpentHours,
      timePracticedDisplay,
      last7Interviews,
      last7Questions,
      recentActivity
    };
  }, [statsData]);

  // Quick start coding interview function
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

  // Dashboard AI Interview quick action: go to setup page
  const handleAIInterviewQuickStart = () => {
    navigate('/interview/ai-setup');
  };

  const quickActions = [
    {
      title: 'Start Interview Session',
      description: 'Configure and begin your full interview practice',
      icon: Play,
      href: '/interview',
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-white',
      primary: true
    },
    {
      title: 'Instant Coding Challenge',
      description: 'Solve a timed coding problem right now',
      icon: Code,
      action: () => handleQuickStart('coding'),
      color: 'from-green-600 to-emerald-600',
      textColor: 'text-white',
      quick: true
    },
    {
      title: 'AI Interview Practice',
      description: 'Real-time conversation with AI interviewer',
      icon: MessageSquare,
      action: handleAIInterviewQuickStart,
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-white',
      quick: true
    },
    {
      title: 'Track Your Progress',
      description: 'Analyze performance metrics and growth',
      icon: BarChart3,
      href: '/progress',
      color: 'from-orange-600 to-yellow-600',
      textColor: 'text-white'
    },
    {
      title: 'Quick Mock Test',
      description: 'Rapid MCQ practice on web fundamentals',
      icon: Target,
      href: '/quick-mock',
      color: 'from-teal-600 to-cyan-600',
      textColor: 'text-white'
    },
    {
      title: 'Practice Roadmap',
      description: 'Follow curated problem-solving checklist',
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
    <div className="min-h-screen bg-white p-2 sm:p-4">
      {/* Welcome / Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[20px] p-6 md:p-8 mb-6 border border-blue-200 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 shadow-[0_10px_32px_rgba(30,64,175,0.28)]"
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-white/90 uppercase tracking-wider">
                Dashboard
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-blue-100 text-sm mb-5">
              Keep building your skills — every session brings you closer to your dream role.
            </p>

            {/* Quick Start Buttons */}
            <div className="flex flex-wrap gap-3">

              <Link
                to="/quick-mock"
                className="flex items-center space-x-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all duration-200 shadow-md"
              >
                <Target className="w-4 h-4" />
                <span>Mock Test</span>
              </Link>

              <Link
                to="/interview"
                className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-bold hover:bg-white/20 transition-all duration-200"
              >
                <Play className="w-4 h-4" />
                <span>Custom Setup</span>
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-10 h-10 text-white/90" />
            </div>
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-[20px] p-8 mb-6 shadow-card">
          <LoadingSpinner text="Loading your dashboard..." />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-[20px] p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-red-700 mb-1">Unable to Load Dashboard</h3>
              <p className="text-red-600 text-sm font-medium">{error}</p>
              <p className="text-red-400 text-xs mt-1.5">This can happen if the backend server is starting up. Please try again.</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                const loadDashboard = async () => {
                  const requestConfig = { skipNetworkToast: true, timeout: 10000 };
                  try {
                    const [statsRes, interviewsRes, progressRes] = await Promise.allSettled([
                      apiMethods.users.getStats(requestConfig),
                      apiMethods.interviews.getAll({ page: 1, limit: 3 }, requestConfig),
                      apiMethods.progress.get(requestConfig)
                    ]);

                    setStatsData(statsRes.status === 'fulfilled' ? (statsRes.value.data?.data || null) : null);
                    setRecentInterviews(
                      interviewsRes.status === 'fulfilled'
                        ? (interviewsRes.value.data?.data?.interviews || [])
                        : []
                    );
                    setProgressData(
                      progressRes.status === 'fulfilled'
                        ? (progressRes.value.data?.data?.progress || null)
                        : null
                    );

                    if (statsRes.status === 'rejected' && interviewsRes.status === 'rejected' && progressRes.status === 'rejected') {
                      setError('Failed to load dashboard data. Please try again.');
                    }
                  } catch (e) {
                    setError('Failed to load dashboard data. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                };
                loadDashboard();
              }}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors duration-200 whitespace-nowrap ml-4"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Swords,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
                value: computed.totalInterviews,
                label: 'Total Interviews',
                sub: `+${computed.last7Interviews} this week`
              },
              {
                icon: Target,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
                value: computed.questionsAttempted,
                label: 'Questions Done',
                sub: `${computed.accuracyPercentage}% accuracy`
              },
              {
                icon: Star,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
                value: `${computed.averageScore}%`,
                label: 'Average Score',
                sub: `+${computed.last7Questions} questions`
              },
              {
                icon: Clock,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
                value: computed.currentStreak > 0
                  ? `${computed.currentStreak} day${computed.currentStreak === 1 ? '' : 's'}`
                  : '0 days',
                label: 'Day Streak',
                sub: computed.totalTimeMinutes > 0
                  ? `${computed.timePracticedDisplay} practiced`
                  : 'Start practicing today'
              }
            ].map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden bg-white rounded-[20px] p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 ${stat.iconBg} border border-blue-100 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium text-right leading-tight max-w-[48%]">{stat.sub}</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{stat.value}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const cardClass = "group relative overflow-hidden bg-white border border-slate-200 hover:border-blue-300 hover:shadow-card-hover rounded-[20px] p-5 transition-all duration-200 text-left w-full";
            const inner = (
              <>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50">
                  <action.icon className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1.5 group-hover:text-blue-700 transition-colors duration-200">{action.title}</h3>
                <p className="text-xs text-slate-500 pr-5">{action.description}</p>
                <ArrowRight className="absolute bottom-4 right-4 w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200" />
              </>
            );
            if (action.action) {
              return (
                <motion.button key={action.title} onClick={action.action} disabled={quickStarting} className={cardClass} whileTap={{ scale: 0.98 }}>
                  {inner}
                </motion.button>
              );
            }
            return (
              <Link key={action.title} to={action.href} className={cardClass}>
                {inner}
              </Link>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-slate-50 rounded-[20px] p-5 border border-slate-200 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Recent Interviews</h2>
            <Link to="/interview" className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center transition-colors duration-200">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-2">
            {!loading && recentInterviews.length === 0 && (
              <div className="py-8 text-center">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Target className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm font-medium">No interviews yet</p>
                <p className="text-xs text-slate-400 mt-1">Start an interview to see it here.</p>
              </div>
            )}

            {recentInterviews.map((interview) => {
              const company = getCompanyDisplay(interview);
              const role = getRoleDisplay(interview);
              const score = getInterviewScore(interview);
              const createdAt = interview?.createdAt || interview?.startTime;
              return (
                <div key={interview.sessionId} className="flex items-center justify-between p-3 bg-white hover:bg-blue-50/60 rounded-xl transition-colors duration-200 border border-slate-200 hover:border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">
                        {String(company).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{company}</p>
                      <p className="text-xs text-slate-500">{role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">{typeof score === 'number' ? `${score}%` : '—'}</div>
                    <div className="text-xs text-slate-400">{createdAt ? new Date(createdAt).toLocaleDateString() : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-slate-50 rounded-[20px] p-5 border border-slate-200 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Achievements</h2>
            <Link to="/progress" className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center transition-colors duration-200">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {!loading && achievements.length === 0 && (
              <div className="col-span-2 py-8 text-center">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm font-medium">No achievements yet</p>
                <p className="text-xs text-slate-400 mt-1">Complete interviews to unlock achievements.</p>
              </div>
            )}

            {achievements.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * idx }}
                className="p-3 rounded-xl border border-blue-200 bg-white hover:border-blue-300 transition-colors duration-200"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="font-semibold text-slate-800 text-xs mb-0.5">{achievement.name}</p>
                <p className="text-xs text-slate-500">{achievement.description}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    <CheckCircle className="w-2.5 h-2.5 mr-1" />
                    Unlocked
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="pb-6"
      >
        <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Recent Activity</h2>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <TrendingUp className="w-3 h-3" />
              <span>Last 7 days</span>
            </div>
          </div>

          {loading ? (
            <div className="py-6"><LoadingSpinner text="Loading activity..." /></div>
          ) : (
            <div className="space-y-2">
              {computed.recentActivity.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">No activity yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start practicing to build your streak.</p>
                  <button
                    onClick={() => handleQuickStart('coding')}
                    className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                  >
                    Start Your First Interview
                  </button>
                </div>
              ) : (
                computed.recentActivity
                  .slice()
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((day) => (
                    <div key={day.date} className="flex items-center justify-between bg-white hover:bg-blue-50/60 rounded-xl px-4 py-3 transition-colors duration-200 border border-slate-200 hover:border-blue-200">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                          <span className="flex items-center"><Swords className="w-2.5 h-2.5 mr-0.5" />{day.interviewsCompleted || 0} interviews</span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center"><Target className="w-2.5 h-2.5 mr-0.5" />{day.questionsAttempted || 0} questions</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800">{Math.round(day.averageScore || 0)}%</div>
                        <div className="text-xs text-slate-400">avg score</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
