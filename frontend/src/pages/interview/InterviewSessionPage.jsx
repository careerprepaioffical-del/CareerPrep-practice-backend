import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, SkipForward } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import RealTimeCodeEditor from '../../components/Interview/RealTimeCodeEditor';
import { apiMethods } from '../../utils/api';
import { toast } from 'react-hot-toast';

const InterviewSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { joinInterviewSession, leaveInterviewSession, connected } = useSocket();
  const [timeLeft, setTimeLeft] = useState(0);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [answer, setAnswer] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [executionResults, setExecutionResults] = useState(null);
  const questionStartRef = useRef(Date.now());

  const currentQuestionIndex = useMemo(() => {
    if (!interview) return 0;
    const responses = Array.isArray(interview.responses) ? interview.responses : [];
    return responses.length;
  }, [interview]);

  const currentQuestion = useMemo(() => {
    if (!interview) return null;
    const questions = Array.isArray(interview.questions) ? interview.questions : [];
    return questions[currentQuestionIndex] || null;
  }, [interview, currentQuestionIndex]);

  const isCodingQuestion = useMemo(() => {
    if (!currentQuestion) return false;
    const looksLikeCodingType = currentQuestion.type === 'coding';
    const hasRealTests = Array.isArray(currentQuestion.testCases) && currentQuestion.testCases.length > 0;
    return looksLikeCodingType && hasRealTests;
  }, [currentQuestion]);

  // Join interview session on mount
  useEffect(() => {
    if (sessionId) {
      joinInterviewSession(sessionId);
    }

    return () => {
      leaveInterviewSession();
    };
  }, [sessionId, joinInterviewSession, leaveInterviewSession]);

  // Load interview session
  useEffect(() => {
    const load = async () => {
      if (!sessionId) return;
      setLoading(true);
      setError('');
      try {
        const resp = await apiMethods.interviews.getById(sessionId);
        const loaded = resp?.data?.data?.interview;
        if (!loaded) throw new Error('Interview session not found');
        setInterview(loaded);
        setLanguage(String(loaded.configuration?.language || 'javascript').toLowerCase());
      } catch (e) {
        const message = e?.response?.data?.message || e?.message || 'Failed to load interview session';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  // Reset per-question timer/input when question changes
  useEffect(() => {
    questionStartRef.current = Date.now();
    setAnswer('');
    setCode('');
    setExecutionResults(null);
  }, [currentQuestion?.id]);

  // Timer effect
  useEffect(() => {
    if (!interview) return;

    const durationMinutes = Number(interview.configuration?.duration || 60);
    const startMs = interview.startTime ? new Date(interview.startTime).getTime() : Date.now();
    const endMs = startMs + durationMinutes * 60 * 1000;

    const timer = setInterval(async () => {
      const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        try {
          await apiMethods.interviews.complete(sessionId);
        } catch (e) {
          // ignore
        }
        navigate(`/interview/results/${sessionId}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [interview, sessionId, navigate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishInterview = async () => {
    try {
      await apiMethods.interviews.complete(sessionId);
    } catch (e) {
      // ignore
    }
    navigate(`/interview/results/${sessionId}`);
  };

  const submitAnswer = async (mode = 'submit') => {
    if (!interview || !currentQuestion) return;

    const timeTaken = Math.max(0, Math.floor((Date.now() - questionStartRef.current) / 1000));
    const isCoding = isCodingQuestion;
    const userAnswer = mode === 'skip' ? 'Skipped' : (isCoding ? 'Submitted code solution' : answer.trim());

    if (mode !== 'skip' && isCoding && !code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    if (!userAnswer) {
      toast.error('Please enter an answer');
      return;
    }

    try {
      await apiMethods.interviews.submitAnswer(sessionId, {
        questionId: currentQuestion.id,
        userAnswer,
        timeTaken,
        code: isCoding ? code : undefined,
        language: isCoding ? language : undefined
      });

      const refreshed = await apiMethods.interviews.getById(sessionId);
      setInterview(refreshed?.data?.data?.interview || null);
    } catch (e) {
      const message = e?.response?.data?.message || e?.message || 'Failed to submit answer';
      toast.error(message);
    }
  };

  const handleSkip = () => submitAnswer('skip');

  return (
    <div className="min-h-screen bg-secondary-50">
      {loading ? (
        <div className="p-6 text-secondary-700">Loading session…</div>
      ) : error ? (
        <div className="p-6">
          <div className="text-error-600 font-medium">{error}</div>
        </div>
      ) : !interview ? (
        <div className="p-6">
          <div className="text-error-600 font-medium">Interview session not found.</div>
        </div>
      ) : !currentQuestion ? (
        <div className="p-6">
          <div className="text-secondary-700">No more questions. You can finish the interview.</div>
          <button onClick={handleFinishInterview} className="btn btn-primary mt-4">Finish Interview</button>
        </div>
      ) : (
      <>
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-secondary-900">
              Interview Session
            </h1>
            <span className="badge badge-primary">
              Question {currentQuestionIndex + 1} of {(interview.questions || []).length}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-secondary-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-error-500'}`}></div>
              <span className="text-secondary-600">{connected ? 'Live' : 'Offline'}</span>
            </div>

            <button
              onClick={handleSkip}
              className="btn btn-ghost text-sm"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip
            </button>

            <button
              onClick={handleFinishInterview}
              className="btn btn-primary text-sm"
            >
              Finish Interview
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Question Panel */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Question Header */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <h2 className="text-2xl font-bold text-secondary-900">
                  {currentQuestion.title}
                </h2>
                <span className={`badge ${
                  currentQuestion.difficulty === 'easy' ? 'badge-success' :
                  currentQuestion.difficulty === 'medium' ? 'badge-warning' :
                  'badge-error'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <p className="text-secondary-700 leading-relaxed">
                {currentQuestion.description}
              </p>
            </div>

            {/* Examples */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                Example:
              </h3>
              {(currentQuestion.examples || []).map((example, index) => (
                <div key={index} className="bg-secondary-100 rounded-lg p-4 mb-3">
                  <div className="space-y-2 font-mono text-sm">
                    <div>
                      <span className="text-secondary-600">Input: </span>
                      <span className="text-secondary-900">{example.input}</span>
                    </div>
                    <div>
                      <span className="text-secondary-600">Output: </span>
                      <span className="text-secondary-900">{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-secondary-600">Explanation: </span>
                        <span className="text-secondary-700">{example.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                Constraints:
              </h3>
              {currentQuestion.constraints ? (
                <div className="bg-secondary-50 rounded-lg p-4 text-secondary-700 whitespace-pre-wrap">
                  {currentQuestion.constraints}
                </div>
              ) : (
                <div className="text-sm text-secondary-500">No constraints provided.</div>
              )}
            </div>

            {!isCodingQuestion && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-secondary-900">Your Answer</h3>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full min-h-[160px] resize-y border border-secondary-300 rounded-lg p-3 focus:outline-none"
                  placeholder="Type your answer here…"
                />
                <button
                  onClick={() => submitAnswer('submit')}
                  className="btn btn-primary"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 border-l border-secondary-200">
          {isCodingQuestion ? (
            <div className="h-full flex flex-col">
              <RealTimeCodeEditor
                sessionId={sessionId}
                questionId={currentQuestion.id}
                question={currentQuestion}
                language={language}
                onLanguageChange={setLanguage}
                onCodeChange={setCode}
                onExecutionResult={setExecutionResults}
              />
              <div className="border-t border-secondary-200 bg-white p-4">
                <button
                  onClick={() => submitAnswer('submit')}
                  className="btn btn-primary w-full"
                >
                  Submit Code Answer
                </button>
                {executionResults?.executionResult?.summary && (
                  <div className="mt-2 text-xs text-secondary-600">
                    Last run: {executionResults.executionResult.summary.passed}/{executionResults.executionResult.summary.total} tests passed
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-secondary-500">
              Answer on the left.
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default InterviewSessionPage;
