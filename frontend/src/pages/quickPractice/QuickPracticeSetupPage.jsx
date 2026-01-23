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

  const canStart = useMemo(() => categories.length > 0 && [10, 20, 30, 50].includes(count), [categories, count]);

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
          <h3 className="text-lg font-semibold text-secondary-900 mb-3">Question Count</h3>
          <div className="grid grid-cols-3 gap-3">
            {[10, 20, 30, 50].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${count === n ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:border-secondary-300'}`}
              >
                <div className="font-semibold text-secondary-900">{n}</div>
                <div className="text-xs text-secondary-600">
                  {n === 10 ? 'Quick warm-up' : n === 20 ? 'Standard set' : n === 30 ? 'Deep practice' : 'Full mock'}
                </div>
              </button>
            ))}
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
