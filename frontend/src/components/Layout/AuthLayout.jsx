import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, TrendingUp, Brain, Shield, Zap } from 'lucide-react';

const motivationalQuotes = [
  "Every expert was once a beginner",
  "Your next opportunity is one interview away",
  "Preparation is the key to confidence",
  "Dream big, prepare bigger",
  "The only limit is the one you set yourself"
];

const features = [
  { icon: Brain,    label: 'AI-Powered Interviews', color: '#8b5cf6' },
  { icon: TrendingUp, label: 'Track Your Progress',  color: '#06b6d4' },
  { icon: Shield,   label: 'Expert Feedback',        color: '#22c55e' },
  { icon: Zap,      label: 'Instant Results',        color: '#f59e0b' },
];

const AuthLayout = ({ children }) => {
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  return (
    <div className="min-h-screen relative overflow-hidden flex" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b5cf6' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zM39 0h1v40h-1zM0 0v1h40V0zM0 39v1h40v-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      </div>

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 24px rgba(139,92,246,0.5)' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-100">CareerPrep</span>
            <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>AI</span>
          </div>
        </motion.div>

        {/* Hero content */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
              <span className="text-slate-100">Land Your</span>
              <br />
              <span className="gradient-text">Dream Job</span>
              <br />
              <span className="text-slate-100">with AI</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              Practice with AI-powered interviews, get instant feedback, and track your progress to confidently ace any interview.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
                  <f.icon className="w-4 h-4" style={{ color: f.color }} />
                </div>
                <span className="text-sm font-medium text-slate-300">{f.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#a78bfa' }} />
            <p className="text-sm italic text-slate-300">"{randomQuote}"</p>
          </motion.div>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-8"
        >
          {[['10K+', 'Users'], ['50K+', 'Interviews'], ['95%', 'Success Rate']].map(([val, lbl]) => (
            <div key={lbl}>
              <div className="text-2xl font-bold gradient-text">{val}</div>
              <div className="text-xs text-slate-500">{lbl}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-12 xl:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">CareerPrep AI</h1>
              <p className="text-sm text-slate-500 mt-1">AI-Powered Interview Mastery</p>
            </motion.div>
          </div>

          {/* Auth form */}
          {children}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-slate-600">
              By continuing, you agree to our{' '}
              <button type="button" className="text-violet-400 hover:text-violet-300 transition-colors">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-violet-400 hover:text-violet-300 transition-colors">Privacy Policy</button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
