import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Code, 
  Palette, 
  Zap, 
  Server, 
  BookOpen,
  CheckCircle,
  TrendingUp,
  Award,
  Play,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const topicIcons = {
  dsa: Code,
  oop: Target,
  dbms: Server,
  os: BookOpen,
  networks: Zap,
  'system-design': Award,
  behavioral: TrendingUp,
  html: Code,
  css: Palette,
  javascript: Zap,
  react: Target,
  nodejs: Server,
  general: BookOpen
};

const topicColors = {
  dsa: 'from-blue-500 to-cyan-600',
  oop: 'from-purple-500 to-pink-600',
  dbms: 'from-green-500 to-emerald-600',
  os: 'from-orange-500 to-red-600',
  networks: 'from-indigo-500 to-purple-600',
  'system-design': 'from-yellow-500 to-orange-600',
  behavioral: 'from-teal-500 to-blue-600',
  html: 'from-orange-500 to-red-600',
  css: 'from-blue-500 to-purple-600',
  javascript: 'from-yellow-500 to-orange-600',
  react: 'from-cyan-500 to-blue-600',
  nodejs: 'from-green-500 to-emerald-600',
  general: 'from-purple-500 to-pink-600'
};

const QuickMockSetupPage = () => {
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(15);
  const [loadingTopics, setLoadingTopics] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoadingTopics(true);
      const response = await apiMethods.quickPractice.getTopics();
      if (response.data?.success) {
        setTopics(response.data.data.topics);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setLoadingTopics(false);
    }
  };

  const toggleTopic = (topicName) => {
    setSelectedTopics(prev => 
      prev.includes(topicName)
        ? prev.filter(t => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleStart = async () => {
    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic');
      return;
    }

    setLoading(true);
    try {
      const response = await apiMethods.quickPractice.start({
        count: numberOfQuestions,
        categories: selectedTopics
      });

      if (response.data?.success) {
        toast.success('Mock interview created successfully!');
        window.location.href = `/quick-mock/session/${response.data.data.sessionId}`;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error?.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const estimatedTime = useMemo(() => {
    return Math.ceil((numberOfQuestions * timeLimit) / 60);
  }, [numberOfQuestions, timeLimit]);

  if (loadingTopics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white"
      >
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">Quick Mock Interview</h1>
              <p className="text-blue-100 text-lg">
                Test your knowledge with MCQ questions covering DSA, OOP, DBMS, OS, Networks, System Design, and Behavioral topics
              </p>
            </div>
            <div className="hidden lg:block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Target className="w-12 h-12 text-white" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topic Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                Select Topics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map((topic) => {
                  const Icon = topicIcons[topic.name] || BookOpen;
                  const isSelected = selectedTopics.includes(topic.name);
                  
                  return (
                    <motion.button
                      key={topic.name}
                      onClick={() => toggleTopic(topic.name)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${topicColors[topic.name]} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-slate-900 capitalize mb-1">
                        {topic.name === 'dsa' ? 'DSA (Data Structures & Algorithms)' :
                         topic.name === 'oop' ? 'OOP (Object Oriented Programming)' :
                         topic.name === 'dbms' ? 'DBMS (Database Management Systems)' :
                         topic.name === 'os' ? 'OS (Operating Systems)' :
                         topic.name === 'networks' ? 'CN (Computer Networks)' :
                         topic.name === 'system-design' ? 'System Design' :
                         topic.name === 'behavioral' ? 'Behavioral' :
                         topic.name === 'nodejs' ? 'Node.js' : topic.name}
                      </h3>
                      
                      <div className="text-sm text-slate-600 mb-2">
                        {topic.total} questions available
                      </div>
                      
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Easy: {topic.breakdown.easy}
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                          Medium: {topic.breakdown.medium}
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          Hard: {topic.breakdown.hard}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Settings Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Configuration
              </h2>
              
              <div className="space-y-6">
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['easy', 'medium', 'hard', 'mixed'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          difficulty === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Number of Questions: {numberOfQuestions}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="10"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>10</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Time per Question: {timeLimit} seconds
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>10s</span>
                    <span>120s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Interview Summary
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Topics:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedTopics.length > 0 ? selectedTopics.join(', ') : 'None selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Difficulty:</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Questions:</span>
                  <span className="font-semibold text-slate-900">
                    {numberOfQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Est. Time:</span>
                  <span className="font-semibold text-slate-900">
                    {estimatedTime} min
                  </span>
                </div>
              </div>

              <motion.button
                onClick={handleStart}
                disabled={loading || selectedTopics.length === 0}
                className="w-full mt-6 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                whileHover={{ scale: loading || selectedTopics.length === 0 ? 1 : 1.02 }}
                whileTap={{ scale: loading || selectedTopics.length === 0 ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Mock Interview</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuickMockSetupPage;
