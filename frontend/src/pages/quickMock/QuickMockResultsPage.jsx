import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Award, 
  RotateCcw,
  BookOpen,
  AlertCircle,
  Star,
  BarChart3,
  Download,
  Code,
  Palette,
  Zap,
  Server
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
  dsa: 'from-blue-600 to-blue-700',
  oop: 'from-blue-600 to-blue-700',
  dbms: 'from-blue-600 to-blue-700',
  os: 'from-blue-600 to-blue-700',
  networks: 'from-blue-600 to-blue-700',
  'system-design': 'from-blue-600 to-blue-700',
  behavioral: 'from-blue-600 to-blue-700',
  html: 'from-blue-600 to-blue-700',
  css: 'from-blue-600 to-blue-700',
  javascript: 'from-blue-600 to-blue-700',
  react: 'from-blue-600 to-blue-700',
  nodejs: 'from-blue-600 to-blue-700',
  general: 'from-blue-600 to-blue-700'
};

const QuickMockResultsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiMethods.quickPractice.getResults(sessionId);
      
      if (response.data?.success) {
        setResults(response.data.data);
      } else {
        toast.error('Failed to load results');
        navigate('/quick-mock');
      }
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results');
      navigate('/quick-mock');
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Expert', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 70) return { level: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 60) return { level: 'Developing', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Beginner', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const downloadResults = () => {
    const data = {
      sessionId: results.sessionId,
      score: results.score,
      completedAt: results.completedAt,
      review: results.review.map(r => ({
        prompt: r.prompt,
        selectedIndex: r.selectedIndex,
        correctIndex: r.correctIndex,
        isCorrect: r.isCorrect,
        category: r.category,
        explanation: r.explanation
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock-test-results-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Results downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">Results not found</p>
        </div>
      </div>
    );
  }

  const performance = getPerformanceLevel(results.score?.percent || 0);
  const correctAnswers = results.review?.filter(r => r.isCorrect).length || 0;
  const totalQuestions = results.review?.length || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[20px] border border-blue-200 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white mb-6 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
            >
              <Award className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-3">Test Complete!</h1>
            <p className="text-blue-100 text-lg">
              Here's how you performed in your Quick Mock Test
            </p>
            
            <div className="flex items-center justify-center space-x-2">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${performance.bg} ${performance.color}`}>
                {performance.level} Level
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-2 sm:py-4">
        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[20px] shadow-card p-8 border border-slate-200 mb-8"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${
                results.score?.percent >= 90 ? 'from-green-500 to-emerald-600' :
                results.score?.percent >= 80 ? 'from-blue-500 to-indigo-600' :
                results.score?.percent >= 70 ? 'from-yellow-500 to-orange-600' :
                'from-red-500 to-rose-600'
              } flex items-center justify-center shadow-lg`}>
                <span className="text-4xl font-bold text-white">
                  {results.score?.percent || 0}%
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-slate-200">
                <Star className={`w-6 h-6 ${performance.color}`} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-4">Overall Score</h2>
            <p className="text-slate-600 mt-1">
              {correctAnswers} of {totalQuestions} questions correct
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {results.score?.correct || 0}
              </div>
              <div className="text-sm text-slate-600">Correct Answers</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatTime(
                  Math.max(
                    0,
                    Math.round(
                      (
                        new Date(results.completedAt).getTime() -
                        new Date(results.startedAt || results.createdAt || results.completedAt).getTime()
                      ) / 1000
                    )
                  )
                )}
              </div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {results.score?.total || 0}
              </div>
              <div className="text-sm text-slate-600">Total Questions</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {results.categories?.length || 0}
              </div>
              <div className="text-sm text-slate-600">Categories</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Topic Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[20px] shadow-card p-6 border border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Topic Breakdown
            </h3>
            
            <div className="space-y-4">
              {/* Calculate topic breakdown from results */}
              {(() => {
                const topicStats = {};
                results.review?.forEach(item => {
                  if (!topicStats[item.category]) {
                    topicStats[item.category] = { correct: 0, total: 0 };
                  }
                  topicStats[item.category].total++;
                  if (item.isCorrect) {
                    topicStats[item.category].correct++;
                  }
                });
                
                return Object.entries(topicStats).map(([category, stats]) => {
                  const Icon = topicIcons[category] || BookOpen;
                  const percentage = Math.round((stats.correct / stats.total) * 100);
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${topicColors[category]} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 capitalize">
                              {category === 'dsa' ? 'DSA' :
                               category === 'oop' ? 'OOP' :
                               category === 'dbms' ? 'DBMS' :
                               category === 'os' ? 'OS' :
                               category === 'networks' ? 'CN' :
                               category === 'system-design' ? 'System Design' :
                               category === 'behavioral' ? 'Behavioral' :
                               category}
                            </span>
                            <div className="text-sm text-slate-600">
                              {stats.total} questions
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {percentage}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${topicColors[category]} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                });
              })()
              }
            </div>
          </motion.div>

          {/* Question Review */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[20px] shadow-card p-6 border border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Question Review
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.review?.map((response, index) => {
                const Icon = topicIcons[response.category] || BookOpen;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`p-4 rounded-xl border transition-colors duration-200 ${
                      response.isCorrect 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 bg-gradient-to-r ${topicColors[response.category]} rounded flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          Question {index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          response.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          response.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {response.difficulty}
                        </span>
                      </div>
                      
                      <div>
                        {response.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-2 line-clamp-2">
                      {response.prompt}
                    </p>
                    
                    <div className="text-xs text-slate-600">
                      Your answer: {response.options?.[response.selectedIndex] || `Option ${response.selectedIndex + 1}`}
                      {!response.isCorrect && (
                        <span className="block text-green-600 mt-1">
                          Correct: {response.options?.[response.correctIndex] || `Option ${response.correctIndex + 1}`}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[20px] shadow-card p-6 border border-slate-200 mt-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/quick-mock')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Another Mock</span>
            </button>
            
            <button
              onClick={downloadResults}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Download Results</span>
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickMockResultsPage;
