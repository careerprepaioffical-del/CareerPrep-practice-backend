import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const ProgressBar = ({ 
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = true,
  animated = true,
  className,
  ...props 
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const variants = {
    default: 'bg-slate-100/50',
    premium: 'bg-gradient-to-r from-amber-100 to-orange-100',
    success: 'bg-gradient-to-r from-emerald-100 to-teal-100',
    dark: 'bg-slate-800'
  };

  const fillVariants = {
    default: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    premium: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500',
    success: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
    dark: 'bg-gradient-to-r from-slate-600 to-slate-400'
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm font-bold text-slate-900">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div 
        className={cn(
          'w-full rounded-full backdrop-blur-sm border border-slate-200/50 relative overflow-hidden',
          sizes[size],
          variants[variant]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full relative overflow-hidden shadow-lg',
            fillVariants[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.7 : 0, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        </motion.div>
      </div>
      
      {/* Milestone markers */}
      {max > 0 && (
        <div className="flex justify-between mt-1">
          {[0, 25, 50, 75, 100].map((milestone) => (
            <div
              key={milestone}
              className={cn(
                'w-1 h-1 rounded-full',
                percentage >= milestone ? 'bg-slate-400' : 'bg-slate-200'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
