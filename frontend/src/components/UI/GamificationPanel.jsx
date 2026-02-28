import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, Target, Zap, Award, Crown, Gem, Rocket } from 'lucide-react';
import { cn } from '../../utils/cn';

const GamificationPanel = ({ stats = {}, achievements = [], streak = 0 }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  useEffect(() => {
    if (achievements.length > 0) {
      const latestAchievement = achievements[achievements.length - 1];
      if (latestAchievement.unlocked && !latestAchievement.seen) {
        setCurrentAchievement(latestAchievement);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    }
  }, [achievements]);

  const level = Math.floor(stats.totalPoints / 100) + 1;
  const progressToNextLevel = (stats.totalPoints % 100);
  const levelTitle = getLevelTitle(level);

  function getLevelTitle(level) {
    const titles = [
      'Beginner', 'Novice', 'Apprentice', 'Journeyman', 'Expert',
      'Master', 'Grandmaster', 'Legend', 'Mythic', 'Titan'
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
  }

  return (
    <>
      {/* Achievement Notification */}
      <AnimatePresence>
        {showNotification && currentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 right-4 z-50 glass p-4 rounded-2xl border-2 border-amber-300 shadow-2xl max-w-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Achievement Unlocked!</h4>
                <p className="text-sm text-slate-700">{currentAchievement.title}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gamification Panel */}
      <div className="space-y-6">
        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6 rounded-2xl border-2 border-white/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Level {level}</h3>
                <p className="text-sm text-slate-600">{levelTitle}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold gradient-text">{stats.totalPoints || 0}</div>
              <div className="text-xs text-slate-500">Total Points</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-slate-100/50 rounded-full h-3 backdrop-blur-sm border border-slate-200/50">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </motion.div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-600">{progressToNextLevel}/100 XP</span>
              <span className="text-xs text-slate-600">Level {level + 1}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Flame, label: 'Streak', value: streak, color: 'from-red-500 to-orange-500', suffix: ' days' },
            { icon: Target, label: 'Accuracy', value: stats.accuracy || 0, color: 'from-emerald-500 to-teal-500', suffix: '%' },
            { icon: Zap, label: 'Speed', value: stats.speed || 0, color: 'from-amber-500 to-yellow-500', suffix: 's' },
            { icon: Star, label: 'Score', value: stats.averageScore || 0, color: 'from-purple-500 to-pink-500', suffix: '' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-4 rounded-xl text-center border-2 border-white/30 hover-lift"
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-slate-900">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass p-6 rounded-2xl border-2 border-white/30"
        >
          <h3 className="font-bold text-slate-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-amber-500" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {achievements.slice(-3).reverse().map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-xl border transition-all',
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                    : 'bg-slate-300'
                )}>
                  <Gem className={cn(
                    'w-5 h-5',
                    achievement.unlocked ? 'text-white' : 'text-slate-500'
                  )} />
                </div>
                <div className="flex-1">
                  <h4 className={cn(
                    'font-semibold text-sm',
                    achievement.unlocked ? 'text-slate-900' : 'text-slate-600'
                  )}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-slate-600">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Star className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass p-6 rounded-2xl border-2 border-white/30 text-center"
        >
          <Rocket className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
          <p className="text-lg font-medium text-slate-800 italic">
            "Every expert was once a beginner. Keep pushing forward!"
          </p>
          <p className="text-sm text-slate-600 mt-2">Your journey to excellence continues...</p>
        </motion.div>
      </div>
    </>
  );
};

export default GamificationPanel;
