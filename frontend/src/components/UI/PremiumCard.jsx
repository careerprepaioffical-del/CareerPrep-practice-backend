import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const PremiumCard = ({ 
  children, 
  variant = 'default',
  hover = true,
  className,
  ...props 
}) => {
  const baseClasses = 'rounded-2xl border shadow-xl transition-all duration-300 relative overflow-hidden';
  
  const variants = {
    default: 'glass border-white/30 bg-white/80',
    premium: 'bg-gradient-to-br from-white via-white to-amber-50/30 border-2 border-gradient-to-r from-amber-200/50 to-orange-200/50',
    dark: 'bg-slate-800/90 border-slate-700 text-white',
    success: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-200'
  };

  const classes = cn(
    baseClasses,
    variants[variant],
    hover && 'hover:shadow-2xl hover:-translate-y-2 hover:bg-white/90',
    className
  );

  return (
    <motion.div
      className={classes}
      whileHover={hover ? { scale: 1.02 } : {}}
      {...props}
    >
      {/* Gradient overlay for premium cards */}
      {variant === 'premium' && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />
      )}
      
      {children}
    </motion.div>
  );
};

export default PremiumCard;
