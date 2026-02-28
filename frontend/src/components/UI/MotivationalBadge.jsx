import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, Crown, Award, Gem } from 'lucide-react';
import { cn } from '../../utils/cn';

const MotivationalBadge = ({ 
  type = 'achievement',
  title,
  description,
  progress = 0,
  maxProgress = 100,
  unlocked = false,
  className,
  ...props 
}) => {
  const icons = {
    achievement: Trophy,
    star: Star,
    streak: Flame,
    premium: Crown,
    award: Award,
    gem: Gem
  };

  const colors = {
    achievement: 'from-amber-500 to-orange-500',
    star: 'from-yellow-500 to-amber-500',
    streak: 'from-red-500 to-orange-500',
    premium: 'from-purple-500 to-pink-500',
    award: 'from-emerald-500 to-teal-500',
    gem: 'from-blue-500 to-indigo-500'
  };

  const Icon = icons[type];
  const colorClass = colors[type];

  return (
    <motion.div
      className={cn(
        'relative p-6 rounded-2xl border-2 transition-all duration-300',
        unlocked 
          ? `bg-gradient-to-br ${colorClass}/10 border-${colorClass.split(' ')[0].split('-')[1]}-300 shadow-lg`
          : 'bg-slate-100 border-slate-300 opacity-60',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {/* Badge Icon */}
      <div className="flex items-center justify-center mb-4">
        <div className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg',
          unlocked 
            ? `bg-gradient-to-r ${colorClass} text-white`
            : 'bg-slate-300 text-slate-500'
        )}>
          <Icon className="w-8 h-8" />
        </div>
      </div>

      {/* Badge Content */}
      <div className="text-center">
        <h3 className={cn(
          'font-bold mb-2',
          unlocked ? 'text-slate-900' : 'text-slate-600'
        )}>
          {title}
        </h3>
        <p className={cn(
          'text-sm mb-4',
          unlocked ? 'text-slate-700' : 'text-slate-500'
        )}>
          {description}
        </p>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="relative">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all duration-500 relative overflow-hidden',
                  unlocked ? `bg-gradient-to-r ${colorClass}` : 'bg-slate-400'
                )}
                style={{ width: `${Math.min((progress / maxProgress) * 100, 100)}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {progress}/{maxProgress}
            </p>
          </div>
        )}

        {/* Unlocked Badge */}
        {unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <Star className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MotivationalBadge;
