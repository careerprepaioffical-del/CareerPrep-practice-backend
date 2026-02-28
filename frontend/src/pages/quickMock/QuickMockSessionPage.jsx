import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Target,
  Palette,
  Server,
  Code,
  BookOpen,
  Award,
  TrendingUp,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const QuickMockSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // Time remaining for current question

  const autoAdvanceTimeoutRef = useRef(null);

  const clearAutoAdvanceTimeout = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }, []);

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

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiMethods.quickPractice.getSession(sessionId);
      
      if (response.data?.success) {
        const sessionData = response.data.data;
        setSession(sessionData);
        setTimeRemaining(sessionData.timePerQuestion || 60);
      } else {
        toast.error('Failed to load session');
        navigate('/quick-mock');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
      navigate('/quick-mock');
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    // If the user manually submits, cancel any pending auto-advance.
    clearAutoAdvanceTimeout();
    
    setSubmitting(true);
    try {
      const response = await apiMethods.quickPractice.submit(sessionId, {
        answers: answers.map(a => ({
          questionIndex: a.questionIndex,
          selectedIndex: a.selectedIndex
        }))
      });
      
      if (response.data?.success) {
        navigate(`/quick-mock/results/${sessionId}`);
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, answers, submitting, navigate, clearAutoAdvanceTimeout]);

  const handleNext = useCallback(() => {
    // Manual Next should disable auto-next to avoid double-advancing.
    clearAutoAdvanceTimeout();
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeRemaining(session?.timePerQuestion || 60);
    }
  }, [currentQuestionIndex, session, clearAutoAdvanceTimeout]);



  // Removed duplicate handleNext declaration

  useEffect(() => {
    loadSession();
  }, [sessionId, loadSession]);

  // Countdown timer effect
  useEffect(() => {
    if (!session || showExplanation) return;

    // Start countdown from timePerQuestion
    const startTime = Date.now();
    const timeLimit = session.timePerQuestion || 60;
    setTimeRemaining(timeLimit);
    let hasWarnedLowTime = false;

    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeRemaining(remaining);

      // Warn when 10 seconds remaining
      if (remaining === 10 && !hasWarnedLowTime) {
        hasWarnedLowTime = true;
        toast.error('⏰ 10 seconds remaining!', { duration: 2000 });
      }

      // Auto-advance when time runs out
      if (remaining === 0) {
        clearInterval(intervalId);
        
        // If no answer selected, record no answer
        if (selectedAnswer === null) {
          toast.error('⏱️ Time\'s up! Moving to next question...');
          const correctIndex = session.questions[currentQuestionIndex].correctIndex;
          const answerRecord = {
            questionIndex: currentQuestionIndex,
            selectedIndex: -1, // -1 indicates no answer
            isCorrect: false,
            correctAnswer: correctIndex,
            explanation: session.questions[currentQuestionIndex].explanation
          };
          
          setAnswers(prev => {
            const next = Array.isArray(prev) ? [...prev] : [];
            const existingIndex = next.findIndex(a => a.questionIndex === currentQuestionIndex);
            if (existingIndex >= 0) next[existingIndex] = answerRecord;
            else next.push(answerRecord);
            return next;
          });
          
          setShowExplanation(true);
        }
        
        // Auto-advance to next question or submit
        setTimeout(() => {
          if (currentQuestionIndex < session.questions.length - 1) {
            handleNext();
          } else {
            handleSubmit();
          }
        }, 2000);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [session, showExplanation, currentQuestionIndex, selectedAnswer, handleNext, handleSubmit]);

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimeout();
    };
  }, [clearAutoAdvanceTimeout]);

  const handleAnswerSelect = (answerIndex) => {
    if (showExplanation) return;

    // If the user re-enters this handler (or rapid interactions), ensure we don't have a pending advance.
    clearAutoAdvanceTimeout();
    
    setSelectedAnswer(answerIndex);

    const correctIndex = session.questions[currentQuestionIndex].correctIndex;
    const answerRecord = {
      questionIndex: currentQuestionIndex,
      selectedIndex: answerIndex,
      isCorrect: answerIndex === correctIndex,
      correctAnswer: correctIndex,
      explanation: session.questions[currentQuestionIndex].explanation
    };
    
    // Store answer locally (replace existing answer for this question)
    setAnswers(prev => {
      const next = Array.isArray(prev) ? [...prev] : [];
      const existingIndex = next.findIndex(a => a.questionIndex === currentQuestionIndex);
      if (existingIndex >= 0) next[existingIndex] = answerRecord;
      else next.push(answerRecord);
      return next;
    });

    // Show explanation
    setShowExplanation(true);
    
    // Auto-advance after 3 seconds
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      autoAdvanceTimeoutRef.current = null;
      if (currentQuestionIndex < session.questions.length - 1) {
        handleNext();
      } else {
        handleSubmit();
      }
    }, 3000);
  };


  // ...existing code...

  const handlePrevious = () => {
    clearAutoAdvanceTimeout();
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      const previousAnswer = answers.find(a => a.questionIndex === prevIndex);
      setSelectedAnswer(Number.isInteger(previousAnswer?.selectedIndex) ? previousAnswer.selectedIndex : null);
      setShowExplanation(Boolean(previousAnswer));
      setTimeRemaining(session?.timePerQuestion || 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((currentQuestionIndex + (showExplanation ? 1 : 0)) / session.questions.length) * 100;
  };

  const currentQuestion = session?.questions[currentQuestionIndex];
  const Icon = currentQuestion ? topicIcons[currentQuestion.category] : BookOpen;
  const correctIndex = currentQuestion?.correctIndex;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">Session not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border border-slate-200 shadow-card rounded-[20px]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${topicColors[currentQuestion.category]} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Quick Mock Test</h1>
                <p className="text-sm text-slate-600">
                  Question {currentQuestionIndex + 1} of {session.questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Progress */}
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${getProgress()}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {Math.round(getProgress())}%
                </span>
              </div>
              
              {/* Timer - Countdown Timer */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full font-semibold ${
                showExplanation 
                  ? 'bg-slate-100 text-slate-700'
                  : timeRemaining <= 10 
                  ? 'bg-red-100 text-red-700 animate-pulse' 
                  : timeRemaining <= 30
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question Card */}
          <div className="bg-white rounded-[20px] shadow-card p-8 border border-slate-200 mb-6">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 bg-gradient-to-r ${topicColors[currentQuestion.category]} text-white rounded-full text-xs font-semibold capitalize`}>
                  {currentQuestion.category === 'dsa' ? 'DSA' :
                   currentQuestion.category === 'oop' ? 'OOP' :
                   currentQuestion.category === 'dbms' ? 'DBMS' :
                   currentQuestion.category === 'os' ? 'OS' :
                   currentQuestion.category === 'networks' ? 'CN' :
                   currentQuestion.category === 'system-design' ? 'System Design' :
                   currentQuestion.category === 'behavioral' ? 'Behavioral' :
                   currentQuestion.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              
              {!showExplanation && (
                <div className="text-sm text-slate-500">
                  Select an answer to continue
                </div>
              )}
              
              {timeRemaining === 0 && !showExplanation && (
                <div className="text-sm text-red-600 font-semibold">
                  ⏱️ Time's Up!
                </div>
              )}
            </div>

            {/* Time Warning Banner */}
            {timeRemaining > 0 && timeRemaining <= 10 && !showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-700 text-sm font-semibold text-center">
                  ⚠️ Only {timeRemaining} seconds remaining!
                </p>
              </motion.div>
            )}

            {/* Question */}
            <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
              {currentQuestion.prompt}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = showExplanation && index === correctIndex;
                const isWrong = showExplanation && isSelected && index !== correctIndex;
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      showExplanation
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : isWrong
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 bg-slate-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                    }`}
                    whileHover={!showExplanation ? { scale: 1.01 } : {}}
                    whileTap={!showExplanation ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          showExplanation
                            ? isCorrect
                              ? 'border-green-500 bg-green-500'
                              : isWrong
                              ? 'border-red-500 bg-red-500'
                              : 'border-slate-300'
                            : isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-slate-300'
                        }`}>
                          {showExplanation ? (
                            isCorrect ? (
                              <CheckCircle className="w-3 h-3 text-white" />
                            ) : isWrong ? (
                              <XCircle className="w-3 h-3 text-white" />
                            ) : null
                          ) : isSelected ? (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          ) : null}
                        </div>
                        <span className={`font-medium ${
                          showExplanation
                            ? isCorrect
                              ? 'text-green-700'
                              : isWrong
                              ? 'text-red-700'
                              : 'text-slate-600'
                            : 'text-slate-900'
                        }`}>
                          {option}
                        </span>
                      </div>
                      
                      {showExplanation && (
                        <div>
                          {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {isWrong && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && currentQuestion?.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50/70 rounded-xl border border-blue-200"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Explanation</h4>
                    <p className="text-blue-800">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              {showExplanation && (
                <p className="text-sm text-slate-600">
                  Auto-advancing in 3 seconds...
                </p>
              )}
            </div>

            {/* Submit/Next Button */}
            {currentQuestionIndex === session.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !showExplanation}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Test</span>
                  </>
                )}
              </button>
            ) : (
              showExplanation ? (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-32"></div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default QuickMockSessionPage;
