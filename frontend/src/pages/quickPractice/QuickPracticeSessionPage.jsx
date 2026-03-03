import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const QuickPracticeSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedIndex }

  const total = session?.totalQuestions || session?.questions?.length || 0;

  const current = useMemo(() => session?.questions?.[currentIndex], [session, currentIndex]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await apiMethods.quickPractice.getSession(sessionId);
      setSession(res?.data?.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const setSelected = (idx) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: idx }));
  };

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionIndex, selectedIndex]) => ({
          questionIndex: Number(questionIndex),
          selectedIndex: Number(selectedIndex)
        }))
      };
      const res = await apiMethods.quickPractice.submit(sessionId, payload);
      const result = res?.data?.data;
      navigate(`/quick-practice/results/${sessionId}`, { state: { result } });
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6">Loading…</div>
      </div>
    );
  }

  if (!session || !current) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6">Session not found.</div>
      </div>
    );
  }

  const selected = answers[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-4 flex items-center justify-between">
        <div className="text-sm text-secondary-700">
          Question <span className="font-semibold">{currentIndex + 1}</span> / {total}
          <span className="ml-3 px-2 py-1 rounded bg-secondary-100 text-secondary-700 text-xs uppercase">
            {current.category}
          </span>
        </div>
        <button
          onClick={submit}
          disabled={submitting}
          className="btn btn-primary"
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>

      <div className="card p-6 space-y-4">
        <div className="text-lg font-semibold text-secondary-900">{current.prompt}</div>

        <div className="space-y-2">
          {(current.options || []).map((opt, idx) => (
            <label
              key={idx}
              className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer ${selected === idx ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:border-secondary-300'}`}
            >
              <input
                type="radio"
                name={`q-${currentIndex}`}
                checked={selected === idx}
                onChange={() => setSelected(idx)}
                className="mt-1"
              />
              <span className="text-secondary-800">{opt}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button onClick={goPrev} disabled={currentIndex === 0} className="btn btn-secondary">
            Prev
          </button>
          <button onClick={goNext} disabled={currentIndex >= total - 1} className="btn btn-secondary">
            Next
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-sm text-secondary-600">
          Answered: <span className="font-semibold">{Object.keys(answers).length}</span> / {total}
        </div>
      </div>
    </div>
  );
};

export default QuickPracticeSessionPage;
