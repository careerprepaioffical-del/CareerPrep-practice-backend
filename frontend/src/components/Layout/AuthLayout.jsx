import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, TrendingUp } from 'lucide-react';

const motivationalQuotes = [
  "Every expert was once a beginner",
  "Your next opportunity is one interview away",
  "Preparation is the key to confidence",
  "Dream big, prepare bigger"
];

const AuthLayout = ({ children }) => {
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-200 rounded-full blur-3xl"></div>
      </div>
      
      <div className="flex min-h-screen relative z-10">
        {/* Centered Content Layout */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-md"
          >
            {/* Centered Logo and Branding */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex flex-col items-center mb-6"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                  <img
                    src="/image.png"
                    alt="CareerPrep Ai"
                    className="relative w-20 h-20 rounded-2xl object-cover shadow-2xl ring-4 ring-white"
                  />
                </div>
                <h1 className="text-3xl font-bold gradient-text mb-2">CareerPrep Ai</h1>
                <p className="text-sm text-secondary-600 font-medium">AI-Powered Interview Mastery</p>
              </motion.div>
              
              {/* Motivational Quote */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-4 mb-8 border-2 border-primary-100 shadow-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">Daily Motivation</span>
                </div>
                <p className="text-base font-medium text-secondary-700 italic">
                  "{randomQuote}"
                </p>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="grid grid-cols-3 gap-3 mb-8"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md">
                  <Target className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-secondary-600">Plan Your Success</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md">
                  <TrendingUp className="w-5 h-5 text-success-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-secondary-600">Track Progress</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md">
                  <Sparkles className="w-5 h-5 text-warning-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-secondary-600">Master Interviews</div>
                </div>
              </motion.div>
            </div>

            {/* Auth form container */}
            <div>
              {children}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-secondary-500">
                By continuing, you agree to our{' '}
                <button type="button" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
