import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Code, ClipboardList, Target, Play, Clock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const interviewModes = [
  {
    title: 'Coding Interview',
    description: 'Solve practical coding problems with live validation and feedback designed for real interview rounds.',
    icon: Code,
    badge: 'Technical',
    href: '/interview/setup',
    cta: 'Start Coding Session',
    points: ['30-120 minutes', 'Real-time feedback', 'Test case validation']
  },
  {
    title: 'AI Interview',
    description: 'Practice adaptive interview conversations and receive personalized follow-up questions instantly.',
    icon: Brain,
    badge: 'Guided',
    href: '/interview/ai-setup',
    cta: 'Start AI Interview',
    points: ['Adaptive questions', 'Context-aware prompts', 'Instant coaching insights']
  },
  {
    title: 'Quick Mock Test',
    description: 'Take focused MCQ tests across core web topics and review performance in minutes.',
    icon: Target,
    badge: 'MCQ Test',
    href: '/quick-mock',
    cta: 'Start Mock Test',
    points: ['Multiple choice questions', 'Timed sessions', 'Instant score feedback']
  }
];

const InterviewPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[20px] border border-blue-200 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white mb-6 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-12 relative">
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-8 w-44 h-44 bg-white/10 rounded-full pointer-events-none" />
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold uppercase tracking-wide mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Interview Center
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Interview Practice</h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
              Choose your interview mode and start practicing with real-world scenarios
            </p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-2 sm:py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interviewModes.map((mode, index) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-[20px] border border-slate-200 shadow-card p-6 hover:shadow-card-hover transition-all duration-200"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 flex items-center justify-center">
                  <mode.icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold">
                  {mode.badge}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mb-2">{mode.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{mode.description}</p>

              <div className="space-y-2.5 mb-6">
                {mode.points.map((point, i) => (
                  <div key={point} className="flex items-center gap-2 text-sm text-slate-600">
                    {i === 0 ? <Clock className="w-4 h-4 text-slate-400" /> : i === 1 ? <Target className="w-4 h-4 text-slate-400" /> : <CheckCircle className="w-4 h-4 text-slate-400" />}
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <Link
                to={mode.href}
                className="flex items-center justify-center space-x-2 w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md"
              >
                <Play className="w-4 h-4" />
                <span>{mode.cta}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Options */}
        <div className="mt-10 text-center rounded-[20px] border border-slate-200 bg-slate-50 p-6 shadow-card">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need More Practice?</h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Explore our comprehensive question bank with customizable difficulty levels and topics
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quick-practice"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors duration-200"
            >
              <ClipboardList className="w-5 h-5" />
              <span>Question Bank</span>
            </Link>

            <Link
              to="/progress"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md"
            >
              <Target className="w-5 h-5" />
              <span>View Progress</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
