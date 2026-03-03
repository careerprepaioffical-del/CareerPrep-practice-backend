import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ExternalLink, ListChecks, Target } from 'lucide-react';
import { apiMethods } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const difficultyClasses = {
  easy: 'bg-success-100 text-success-700',
  medium: 'bg-warning-100 text-warning-700',
  hard: 'bg-error-100 text-error-700'
};

const PreparationGuidePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionPercentage: 0,
    isCompleted: false
  });
  const [updatingIds, setUpdatingIds] = useState({});

  const loadSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiMethods.preparationSheet.get();
      setItems(res?.data?.data?.items || []);
      setSummary(
        res?.data?.data?.summary || {
          total: 0,
          completed: 0,
          pending: 0,
          completionPercentage: 0,
          isCompleted: false
        }
      );
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load preparation sheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSheet();
  }, []);

  const onToggle = async (item) => {
    try {
      setUpdatingIds((prev) => ({ ...prev, [item._id]: true }));
      const res = await apiMethods.preparationSheet.toggle(item._id, !item.completed);
      setItems(res?.data?.data?.items || []);
      setSummary(
        res?.data?.data?.summary || {
          total: 0,
          completed: 0,
          pending: 0,
          completionPercentage: 0,
          isCompleted: false
        }
      );
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update question status');
    } finally {
      setUpdatingIds((prev) => {
        const next = { ...prev };
        delete next[item._id];
        return next;
      });
    }
  };

  const progressLabel = useMemo(() => {
    if (summary.isCompleted) return 'Sheet completed';
    if (summary.total === 0) return 'No questions added by admin yet';
    return `${summary.completed}/${summary.total} solved`;
  }, [summary]);

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Loading preparation sheet..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">Preparation Sheet</h1>
        <p className="text-lg text-secondary-600">
          Solve admin-posted questions and track your completion like a checklist.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="stats-card">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <ListChecks className="w-6 h-6 text-primary-600" />
          </div>
          <div className="stats-value">{summary.total || 0}</div>
          <div className="stats-label">Total Questions</div>
        </div>

        <div className="stats-card">
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-success-600" />
          </div>
          <div className="stats-value">{summary.completed || 0}</div>
          <div className="stats-label">Completed</div>
        </div>

        <div className="stats-card">
          <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-warning-600" />
          </div>
          <div className="stats-value">{summary.completionPercentage || 0}%</div>
          <div className="stats-label">Sheet Progress</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-secondary-600 mb-2">
            <span>{progressLabel}</span>
            <span>{summary.completionPercentage || 0}%</span>
          </div>
          <div className="w-full h-2 bg-secondary-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600"
              style={{ width: `${summary.completionPercentage || 0}%` }}
            />
          </div>
        </div>

        {error && <p className="text-sm text-error-600 mb-4">{error}</p>}

        {items.length === 0 ? (
          <p className="text-secondary-600">No preparation sheet questions available yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const difficulty = String(item?.difficulty || 'medium').toLowerCase();
              const badgeClass = difficultyClasses[difficulty] || 'bg-secondary-100 text-secondary-700';
              const isUpdating = !!updatingIds[item._id];

              return (
                <div key={item._id} className="border border-secondary-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggle(item)}
                      disabled={isUpdating}
                      className="mt-0.5 text-secondary-500 hover:text-primary-600 disabled:opacity-50"
                      aria-label={item.completed ? 'Mark as not completed' : 'Mark as completed'}
                    >
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-success-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">#{index + 1}</span>
                        <span className={`text-xs px-2 py-1 rounded ${badgeClass}`}>{difficulty}</span>
                        {item.topic && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">{item.topic}</span>
                        )}
                        {item.platform && (
                          <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">{item.platform}</span>
                        )}
                      </div>

                      <a
                        href={item.questionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary-700 hover:text-primary-800"
                      >
                        {item.title}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PreparationGuidePage;
