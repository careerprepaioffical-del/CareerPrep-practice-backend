import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Send, 
  Brain, 
  Clock, 
  MessageCircle,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const AIInterviewPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { connected, joinInterviewSession, leaveInterviewSession } = useSocket();
  
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState('Dynamic');
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(new Date());

  // Speech recognition setup
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setResponse(prev => prev + finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition error. Please try again.');
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Load interview session data
  const loadInterviewSession = useCallback(async () => {
    try {
      const res = await apiMethods.aiInterview.getSession(sessionId);
      const data = res?.data?.data;

      if (data) {
        setQuestionNumber(data.currentQuestion + 1);
        setIsComplete(data.status === 'completed');

        // Ensure we show the current question on initial load/refresh
        setCurrentQuestion(prev => prev || (data.question || data.config?.currentQuestion || data.config?.openingQuestion || ''));

        if (data.status === 'completed') {
          navigate(`/interview/results/${sessionId}`);
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error(error?.response?.data?.message || 'Failed to load interview session');
    }
  }, [sessionId, navigate]);

  // Join interview session
  useEffect(() => {
    if (sessionId) {
      joinInterviewSession(sessionId);
      loadInterviewSession();
    }
    
    return () => {
      leaveInterviewSession();
    };
  }, [sessionId, joinInterviewSession, leaveInterviewSession, loadInterviewSession]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((new Date() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime]);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Submit response to AI interviewer
  const submitResponse = async () => {
    if (!response.trim()) {
      toast.error('Please provide a response');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await apiMethods.aiInterview.respond({
        sessionId,
        response: response.trim()
      });
      const data = res?.data?.data;

      if (data) {
        // Update state
        setCurrentQuestion(data.followUp?.question || '');
        setQuestionNumber(data.questionNumber);
        setAnalysis(data.analysis);
        setIsComplete(data.isComplete);
        setResponse('');
        
        if (data.isComplete) {
          // Complete the interview
          await completeInterview();
        }
        
        toast.success('Response submitted successfully!');
      } else {
        toast.error('Failed to submit response');
      }
    } catch (error) {
      console.error('Submit response error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete interview
  const completeInterview = async () => {
    try {
      const res = await apiMethods.aiInterview.complete({ sessionId });
      if (res?.data?.success) {
        toast.success('Interview completed!');
        setTimeout(() => {
          navigate(`/interview/results/${sessionId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Complete interview error:', error);
      toast.error(error?.response?.data?.message || 'Failed to complete interview');
    }
  };

  // Get hint
  const getHint = async () => {
    try {
      const res = await apiMethods.aiInterview.hint({ sessionId });
      const hint = res?.data?.data?.hint;
      if (hint) {
        toast.success(hint, { duration: 6000 });
      }
    } catch (error) {
      console.error('Get hint error:', error);
      toast.error(error?.response?.data?.message || 'Failed to get hint');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success-50 to-primary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Interview Complete!</h1>
          <p className="text-secondary-600 mb-6">Generating your results...</p>
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-secondary-900">AI Interview</h1>
              <p className="text-sm text-secondary-600">
                Question {questionNumber} of {totalQuestions}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-secondary-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(timeElapsed)}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-error-500'}`}></div>
              <span className="text-secondary-600">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Current Question */}
        <motion.div
          key={questionNumber}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-secondary-900 mb-2">AI Interviewer</h3>
              <p className="text-secondary-700 leading-relaxed">
                {currentQuestion || 'Loading question...'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Response Input */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Your Response</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={getHint}
                className="btn btn-ghost text-sm flex items-center space-x-1"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Hint</span>
              </button>
              
              <button
                onClick={toggleListening}
                className={`btn text-sm flex items-center space-x-1 ${
                  isListening ? 'btn-error' : 'btn-secondary'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Stop' : 'Speak'}</span>
              </button>
            </div>
          </div>
          
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response here or use the microphone to speak..."
            className="w-full h-32 resize-none border border-secondary-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-secondary-600">
              {response.length} characters
            </div>
            
            <button
              onClick={submitResponse}
              disabled={isSubmitting || !response.trim()}
              className="btn btn-primary flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Submitting...' : 'Submit Response'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Analysis */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-6 mb-6"
            >
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 text-primary-600 mr-2" />
                AI Analysis
              </h3>
              
              {analysis.scores && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {analysis.scores.communication}/10
                    </div>
                    <div className="text-sm text-secondary-600">Communication</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {analysis.scores.technical}/10
                    </div>
                    <div className="text-sm text-secondary-600">Technical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {analysis.scores.behavioral}/10
                    </div>
                    <div className="text-sm text-secondary-600">Behavioral</div>
                  </div>
                </div>
              )}
              
              {analysis.feedback && (
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-sm text-primary-800">{analysis.feedback}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary-700">Interview Progress</span>
            <span className="text-sm text-secondary-600">
              {questionNumber}/{totalQuestions} questions
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewPage;
