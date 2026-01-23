import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiMethods } from '../../utils/api';

const QuickPracticeResultsPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(location.state?.result || null);

  const load = async () => {
    setLoading(true);
    try {
      if (result) return;
      const res = await apiMethods.quickPractice.getResults(sessionId);
      setResult(res?.data?.data || null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card p-6">Loading…</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="card p-6">
          Results not available. Please submit the test again.
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/quick-practice')}>Back to Quick Practice</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card p-6 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-secondary-900">Score: {result.score?.percent || 0}%</div>
          <div className="text-secondary-600">Correct {result.score?.correct || 0} / {result.score?.total || 0}</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/quick-practice')}>New Test</button>
      </div>

      <div className="space-y-4">
        {(result.review || []).map((q) => (
          <div key={q.index} className="card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-secondary-900">Q{q.index + 1}: {q.prompt}</div>
              <span className={`text-xs px-2 py-1 rounded ${q.isCorrect ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>
                {q.isCorrect ? 'Correct' : 'Wrong'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {(q.options || []).map((opt, idx) => {
                const isCorrect = idx === q.correctIndex;
                const isSelected = idx === q.selectedIndex;
                const cls = isCorrect
                  ? 'border-success-300 bg-success-50'
                  : isSelected
                    ? 'border-error-300 bg-error-50'
                    : 'border-secondary-200';

                return (
                  <div key={idx} className={`p-3 rounded-lg border ${cls}`}>
                    <div className="text-secondary-800">
                      {opt}
                      {isCorrect && <span className="ml-2 text-xs text-success-700">(Correct)</span>}
                      {isSelected && !isCorrect && <span className="ml-2 text-xs text-error-700">(Your answer)</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {q.explanation && (
              <div className="text-sm text-secondary-700">
                <span className="font-medium">Explanation:</span> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickPracticeResultsPage;
