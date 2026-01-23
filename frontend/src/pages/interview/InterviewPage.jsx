import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Code, ClipboardList, Target, Play, Clock, CheckCircle } from 'lucide-react';

const InterviewPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white"
      >
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-3">Interview Practice</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Choose your interview mode and start practicing with real-world scenarios
            </p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Coding Interview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code className="w-7 h-7 text-white" />
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Technical
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Coding Interview
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Solve real coding problems with test cases. Perfect for technical interviews at top tech companies.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>30-120 minutes</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Target className="w-4 h-4" />
                <span>Real-time feedback</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4" />
                <span>Test case validation</span>
              </div>
            </div>
            
            <Link
              to="/interview/setup"
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5" />
              <span>Start Coding Session</span>
            </Link>
          </motion.div>

          {/* AI Interview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                AI-Powered
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              AI Interview
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Practice with an AI interviewer that adapts to your responses and provides personalized feedback.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Brain className="w-4 h-4" />
                <span>Adaptive questions</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Target className="w-4 h-4" />
                <span>Real-time feedback</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Play className="w-4 h-4" />
                <span>Follow-up questions</span>
              </div>
            </div>
            
            <Link
              to="/interview/ai-setup"
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5" />
              <span>Start AI Interview</span>
            </Link>
          </motion.div>

          {/* Quick Mock Interview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                MCQ Test
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Quick Mock Interview
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Test your knowledge with MCQ questions covering HTML, CSS, JavaScript, React, and Node.js.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <ClipboardList className="w-4 h-4" />
                <span>Multiple choice questions</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Timed sessions</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4" />
                <span>Instant feedback</span>
              </div>
            </div>
            
            <Link to="/quick-mock" className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
              <Play className="w-5 h-5" />
              <span>Start Mock Test</span>
            </Link>
          </motion.div>
        </div>
        
        {/* Additional Options */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Need More Practice?</h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Explore our comprehensive question bank with customizable difficulty levels and topics
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quick-practice"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              <ClipboardList className="w-5 h-5" />
              <span>Question Bank</span>
            </Link>
            
            <Link
              to="/progress"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Target className="w-5 h-5" />
              <span>View Progress</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
