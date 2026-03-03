import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const QuickPracticeSetupPage = () => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);

  const [count, setCount] = useState(10);
  const [categories, setCategories] = useState([]);

  const canStart = useMemo(() => categories.length > 0 && count >= 5 && count <= 100, [categories, count]);

  const toggleCategory = (cat) => {
    setCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat);
      return [...prev, cat];
    });
  };

  const start = async () => {
    if (!canStart) return;
    setIsStarting(true);
    try {
      const res = await apiMethods.quickPractice.start({ count, categories });
      const sessionId = res?.data?.data?.sessionId;
      if (!sessionId) throw new Error('Failed to start quick practice');
      navigate(`/quick-practice/session/${sessionId}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to start quick practice');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Quick Practice</h1>
        <p className="text-secondary-600">Topic-based MCQ practice (mix and match categories)</p>
      </motion.div>

      <div className="card p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-3">Question Count: <span className="text-primary-600 font-bold">{count}</span></h3>
          <input
            type="range"
            min="5"
            max="100"
            step="1"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-secondary-500 mt-1">
            <span>5</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-3">Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'dsa', label: 'DSA' },
              { key: 'oop', label: 'OOP' },
              { key: 'dbms', label: 'DBMS' },
              { key: 'os', label: 'Operating Systems' },
              { key: 'networks', label: 'Computer Networks' },
              { key: 'system-design', label: 'System Design' },
              { key: 'behavioral', label: 'Behavioral' },
              { key: 'html', label: 'HTML' },
              { key: 'css', label: 'CSS' },
              { key: 'javascript', label: 'JavaScript' },
              { key: 'react', label: 'React' },
              { key: 'nodejs', label: 'Node.js' },
              { key: 'mock', label: 'Full Stack using Nodejs Mock SDC-AI' },
              { key: 'mock1', label: 'Full Stack using Nodejs Mock Similar' },
              { key: 'general', label: 'General' }
            ].map((c) => (
              <label key={c.key} className="flex items-center space-x-2 p-3 border border-secondary-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={categories.includes(c.key)}
                  onChange={() => toggleCategory(c.key)}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-800">{c.label}</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-secondary-500 mt-2">You must select at least one category.</div>
        </div>

        <button
          onClick={start}
          disabled={!canStart || isStarting}
          className="btn btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{isStarting ? 'Starting…' : 'Start Test'}</span>
        </button>
      </div>
    </div>
  );
};

export default QuickPracticeSetupPage;
