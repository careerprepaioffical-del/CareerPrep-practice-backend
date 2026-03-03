import React from 'react';

// Custom Rocket Icon - Premium Design
export const RocketIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
      <linearGradient id="flameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2C12 2 8 6 8 12C8 14 9 16 10 17L6 21L8 21L11 18C11.3 18 11.7 18 12 18C12.3 18 12.7 18 13 18L16 21L18 21L14 17C15 16 16 14 16 12C16 6 12 2 12 2Z" 
      fill="url(#rocketGradient)"
    />
    <circle cx="12" cy="10" r="2" fill="white" opacity="0.9"/>
    <path 
      d="M9 19C8 20 7 21 6 21C6 20 7 19 8 18M15 19C16 20 17 21 18 21C18 20 17 19 16 18" 
      stroke="url(#flameGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Custom Trophy Icon - Premium Design
export const TrophyIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2C14 2 16 3 17 5L19 5C20 5 21 6 21 7C21 8 20 9 19 9L19 11C19 14 16 17 12 17C8 17 5 14 5 11L5 9C4 9 3 8 3 7C3 6 4 5 5 5L7 5C8 3 10 2 12 2Z" 
      fill="url(#trophyGradient)"
    />
    <path 
      d="M10 17L10 20C10 21 11 22 12 22C13 22 14 21 14 20L14 17" 
      stroke="url(#trophyGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path 
      d="M12 6L13.5 9L16.5 9L14 11L15.5 14L12 12L8.5 14L10 11L7.5 9L10.5 9L12 6Z" 
      fill="url(#starGradient)"
    />
  </svg>
);

// Custom Brain Icon - Premium Design
export const BrainIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2C10 2 8.5 3 7.5 4.5C6.5 4 5.5 4 4.5 4.5C3.5 5 3 6 3 7C2 7.5 2 8.5 2.5 9.5C2 10.5 2 11.5 2.5 12.5C2 13.5 2 14.5 3 15C3 16 3.5 17 4.5 17.5C5.5 18 6.5 18 7.5 17.5C8.5 19 10 20 12 20C14 20 15.5 19 16.5 17.5C17.5 18 18.5 18 19.5 17.5C20.5 17 21 16 21 15C22 14.5 22 13.5 21.5 12.5C22 11.5 22 10.5 21.5 9.5C22 8.5 22 7.5 21 7C21 6 20.5 5 19.5 4.5C18.5 4 17.5 4 16.5 4.5C15.5 3 14 2 12 2Z" 
      fill="url(#brainGradient)"
      opacity="0.9"
    />
    <circle cx="9" cy="10" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="15" cy="10" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="12" cy="14" r="1" fill="white" opacity="0.8"/>
    <path 
      d="M9 10C9 10 10.5 11 12 11C13.5 11 15 10 15 10M10 14C10 14 11 15 12 15C13 15 14 14 14 14" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

// Custom Code Icon - Premium Design
export const CodeIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#14b8a6" />
      </linearGradient>
    </defs>
    <path 
      d="M8 3L3 8L8 13" 
      stroke="url(#codeGradient)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M16 3L21 8L16 13" 
      stroke="url(#codeGradient)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M13 3L11 13" 
      stroke="url(#codeGradient)" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    <rect x="2" y="16" width="20" height="4" rx="1" fill="url(#codeGradient)" opacity="0.3"/>
  </svg>
);

// Custom Target Icon - Premium Design
export const TargetIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#targetGradient)" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="7" stroke="url(#targetGradient)" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="4" stroke="url(#targetGradient)" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" fill="url(#targetGradient)"/>
    <path 
      d="M12 2L12 6M12 18L12 22M2 12L6 12M18 12L22 12" 
      stroke="url(#targetGradient)" 
      strokeWidth="2" 
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

// Custom Star Icon - Premium Design
export const StarIcon = ({ className = "w-6 h-6", filled = true, ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2L14.5 9L22 9L16 14L18.5 21L12 16L5.5 21L8 14L2 9L9.5 9L12 2Z" 
      fill={filled ? "url(#starGradient)" : "none"}
      stroke="url(#starGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Custom Flame Icon - Premium Design
export const FlameIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2C12 2 8 6 8 11C8 14 10 16 12 16C14 16 16 14 16 11C16 6 12 2 12 2Z" 
      fill="url(#flameGradient)"
    />
    <path 
      d="M12 16C10 16 8 18 8 20C8 22 10 22 12 22C14 22 16 22 16 20C16 18 14 16 12 16Z" 
      fill="url(#flameGradient)"
      opacity="0.7"
    />
    <circle cx="12" cy="10" r="1.5" fill="white" opacity="0.8"/>
  </svg>
);

// Custom Crown Icon - Premium Design
export const CrownIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <path 
      d="M5 8L8 4L11 8L12 5L13 8L16 4L19 8L19 16C19 17 18 18 17 18L7 18C6 18 5 17 5 16L5 8Z" 
      fill="url(#crownGradient)"
    />
    <circle cx="8" cy="6" r="2" fill="white" opacity="0.9"/>
    <circle cx="12" cy="6" r="2" fill="white" opacity="0.9"/>
    <circle cx="16" cy="6" r="2" fill="white" opacity="0.9"/>
    <rect x="5" y="14" width="14" height="2" fill="white" opacity="0.3"/>
  </svg>
);

// Custom Sparkles Icon - Premium Design
export const SparklesIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="sparklesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2L13 7L18 8L13 9L12 14L11 9L6 8L11 7L12 2Z" 
      fill="url(#sparklesGradient)"
    />
    <path 
      d="M4 16L4.5 18L6.5 18.5L4.5 19L4 21L3.5 19L1.5 18.5L3.5 18L4 16Z" 
      fill="url(#sparklesGradient)"
      opacity="0.7"
    />
    <path 
      d="M20 16L20.5 18L22.5 18.5L20.5 19L20 21L19.5 19L17.5 18.5L19.5 18L20 16Z" 
      fill="url(#sparklesGradient)"
      opacity="0.7"
    />
  </svg>
);

// Custom Gem Icon - Premium Design
export const GemIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2L16 6L16 14L12 22L8 14L8 6L12 2Z" 
      fill="url(#gemGradient)"
    />
    <path 
      d="M8 6L12 2L16 6M8 6L4 10L8 14M16 6L20 10L16 14M8 14L12 22L16 14" 
      stroke="white" 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.4"
    />
    <circle cx="12" cy="10" r="1.5" fill="white" opacity="0.6"/>
  </svg>
);

// Custom Compass Icon - Premium Design
export const CompassIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="compassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#compassGradient)" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" fill="url(#compassGradient)"/>
    <path 
      d="M12 2L12 6M12 18L12 22M2 12L6 12M18 12L22 12" 
      stroke="url(#compassGradient)" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity="0.5"
    />
    <path 
      d="M12 12L8 8L16 16L12 12Z" 
      fill="url(#compassGradient)"
      opacity="0.8"
    />
    <path 
      d="M12 12L16 8L8 16L12 12Z" 
      fill="url(#compassGradient)"
      opacity="0.6"
    />
  </svg>
);

export default {
  RocketIcon,
  TrophyIcon,
  BrainIcon,
  CodeIcon,
  TargetIcon,
  StarIcon,
  FlameIcon,
  CrownIcon,
  SparklesIcon,
  GemIcon,
  CompassIcon
};
