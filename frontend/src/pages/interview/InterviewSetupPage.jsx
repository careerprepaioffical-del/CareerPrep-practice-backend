import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryType = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('type');
  }, [location.search]);

  const [config, setConfig] = useState({
    type: 'coding',
    difficulty: 'easy',
    duration: 30,
    language: 'cpp',
    numberOfQuestions: 1
  });

  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (queryType === 'ai_interview') {
      navigate('/interview/ai-setup', { replace: true });
    }
  }, [navigate, queryType]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const createPayload = {
        type: 'coding',
        configuration: {
          duration: config.duration,
          difficulty: config.difficulty,
          questionTypes: ['coding'],
          language: config.language,
          numberOfQuestions: 1
        }
      };

      const created = await apiMethods.interviews.create(createPayload);
      const sessionId = created?.data?.data?.sessionId;
      if (!sessionId) throw new Error('Failed to create session');

      await apiMethods.interviews.start(sessionId);

      navigate(`/interview/coding/${sessionId}`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to start interview';
      toast.error(message);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Setup Coding Session
        </h1>
        <p className="text-lg text-secondary-600">
          Choose language and difficulty
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={config.difficulty}
                  onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                  className="input"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                  className="input"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Programming Language
                </label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                  className="input"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Summary & Start */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6 sticky top-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Interview Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Type:</span>
                <span className="font-medium text-secondary-900 capitalize">
                  Coding
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Duration:</span>
                <span className="font-medium text-secondary-900">
                  {config.duration} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Questions:</span>
                <span className="font-medium text-secondary-900">
                  1
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Difficulty:</span>
                <span className="font-medium text-secondary-900 capitalize">
                  {config.difficulty}
                </span>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={isStarting}
              className="btn btn-primary w-full mt-6 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{isStarting ? 'Starting…' : 'Start Interview'}</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupPage;
