import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { apiMethods } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [progressDoc, setProgressDoc] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }

        const [statsRes, progressRes, analyticsRes] = await Promise.all([
          apiMethods.users.getStats(),
          apiMethods.progress.get(),
          apiMethods.progress.getAnalytics({ timeframe: 30 })
        ]);

        if (!isMounted) return;

        setStatsData(statsRes?.data?.data || null);
        setProgressDoc(progressRes?.data?.data?.progress || null);
        setAnalytics(analyticsRes?.data?.data?.analytics || null);
      } catch (err) {
        if (!isMounted) return;
        if (!silent) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load progress data');
        }
      } finally {
        if (!isMounted) return;
        if (!silent) setLoading(false);
      }
    };

    load();

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load({ silent: true });
      }
    }, 20000);

    const onFocus = () => load({ silent: true });
    const onVisibility = () => {
      if (document.visibilityState === 'visible') load({ silent: true });
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const overview = useMemo(() => {
    const user = statsData?.user || {};
    const overallStats = statsData?.progress?.overallStats || progressDoc?.overallStats || {};

    const averageScore = user.averageScore ?? overallStats.averageScore ?? 0;
    const completedInterviews = user.completedInterviews ?? overallStats.completedInterviews ?? 0;
    const streakDays = user.streakDays ?? overallStats.currentStreak ?? 0;
    const achievementsCount = progressDoc?.achievements?.length ?? 0;

    return {
      averageScore,
      completedInterviews,
      streakDays,
      achievementsCount
    };
  }, [progressDoc, statsData]);

  const skills = useMemo(() => {
    const skillProgress = statsData?.progress?.skillProgress || progressDoc?.skillProgress || [];
    return [...skillProgress]
      .filter(s => s && s.skill)
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [progressDoc, statsData]);

  const recentAchievements = useMemo(() => {
    const achievements = progressDoc?.achievements || [];
    return [...achievements]
      .filter(a => a && (a.isVisible ?? true))
      .sort((a, b) => new Date(b.unlockedAt || 0) - new Date(a.unlockedAt || 0))
      .slice(0, 6);
  }, [progressDoc]);

  const scoreProgression = useMemo(() => {
    const list = analytics?.trends?.scoreProgression || [];
    return [...list]
      .filter(x => x && x.date)
      .slice(0, 10);
  }, [analytics]);

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Loading progress…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-secondary-900">Your Progress</h1>
        <p className="mt-2 text-sm text-error-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Your Progress
        </h1>
        <p className="text-lg text-secondary-600">
          Track your improvement and achievements
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="stats-card">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-primary-600" />
          </div>
          <div className="stats-value">{Math.round(overview.averageScore || 0)}%</div>
          <div className="stats-label">Average Score</div>
        </div>

        <div className="stats-card">
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-success-600" />
          </div>
          <div className="stats-value">{overview.completedInterviews || 0}</div>
          <div className="stats-label">Interviews Completed</div>
        </div>

        <div className="stats-card">
          <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-warning-600" />
          </div>
          <div className="stats-value">{overview.streakDays || 0}</div>
          <div className="stats-label">Day Streak</div>
        </div>

        <div className="stats-card">
          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-secondary-600" />
          </div>
          <div className="stats-value">{overview.achievementsCount || 0}</div>
          <div className="stats-label">Achievements</div>
        </div>
      </motion.div>

      {/* Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold text-secondary-900 mb-6">
          Performance Trend
        </h2>
        {scoreProgression.length === 0 ? (
          <div className="h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600">No recent interview scores yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {scoreProgression.map((point, index) => (
              <div key={`${point.date}-${index}`} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <div className="font-medium text-secondary-900">
                    {new Date(point.date).toLocaleDateString()} · {point.type || 'interview'}
                  </div>
                  <div className="text-xs text-secondary-600">Overall score</div>
                </div>
                <div className="text-sm font-semibold text-secondary-900">{Math.round(point.score || 0)}%</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">
            Skills Progress
          </h2>
          <div className="space-y-4">
            {skills.length === 0 ? (
              <div className="text-sm text-secondary-600">No skill progress recorded yet.</div>
            ) : (
              skills.map((item) => (
              <div key={item.skill}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-secondary-900">{item.skill}</span>
                  <span className="text-sm text-secondary-600">{(item.level || 'beginner').toString()}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.round(item.score || 0)}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-secondary-600 mt-1">
                  {Math.round(item.score || 0)}%
                </div>
              </div>
            )))}
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">
            Recent Achievements
          </h2>
          <div className="space-y-4">
            {recentAchievements.length === 0 ? (
              <div className="text-sm text-secondary-600">No achievements unlocked yet.</div>
            ) : (
              recentAchievements.map((achievement, index) => (
                <div key={achievement.id || index} className="flex items-center space-x-4 p-3 bg-secondary-50 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-lg">
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-secondary-900">{achievement.name}</h3>
                    <p className="text-sm text-secondary-600">{achievement.description}</p>
                  </div>
                  <div className="text-xs text-secondary-500">
                    {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressPage;
