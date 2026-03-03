import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorStyles = {
    primary:   { borderColor: 'rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6' },
    secondary: { borderColor: 'rgba(100,116,139,0.2)', borderTopColor: '#64748b' },
    white:     { borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#ffffff' },
    cyan:      { borderColor: 'rgba(6,182,212,0.2)',   borderTopColor: '#06b6d4' },
    success:   { borderColor: 'rgba(34,197,94,0.2)',   borderTopColor: '#22c55e' },
    warning:   { borderColor: 'rgba(245,158,11,0.2)',  borderTopColor: '#f59e0b' },
    error:     { borderColor: 'rgba(239,68,68,0.2)',   borderTopColor: '#ef4444' }
  };

  const spinnerStyle = colorStyles[color] || colorStyles.primary;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 rounded-full`}
        style={spinnerStyle}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <motion.p
          className="mt-3 text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
