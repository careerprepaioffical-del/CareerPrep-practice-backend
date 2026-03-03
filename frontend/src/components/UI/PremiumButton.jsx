import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  loading = false,
  disabled = false,
  className,
  ...props 
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden group';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    premium: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white hover:from-amber-600 hover:via-orange-600 hover:to-red-600 focus:ring-amber-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    glass: 'glass text-slate-700 hover:bg-white/90 border-2 border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg'
  };

  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <motion.button
      className={classes}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Button content */}
      <span className={cn('flex items-center space-x-2', loading && 'opacity-0')}>
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </span>
    </motion.button>
  );
};

export default PremiumButton;
