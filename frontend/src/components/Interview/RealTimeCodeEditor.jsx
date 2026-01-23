import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Save, Zap, CheckCircle, XCircle } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-hot-toast';

const RealTimeCodeEditor = ({ 
  sessionId, 
  questionId, 
  question, 
  language = 'javascript',
  onLanguageChange,
  onCodeChange,
  onExecutionResult 
}) => {
  const [code, setCode] = useState('');
  const [localLanguage, setLocalLanguage] = useState(String(language || 'javascript').toLowerCase());
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [liveFeedback, setLiveFeedback] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const codeByLanguageRef = useRef({});

  const {
    connected,
    executeCode,
    getLiveFeedback,
    saveProgress,
    sendCodeUpdate,
    sendTypingIndicator,
    subscribeToExecutionResults,
    subscribeToLiveFeedback,
    subscribeToTypingIndicators
  } = useSocket();

  useEffect(() => {
    const next = String(language || 'javascript').toLowerCase();
    setLocalLanguage(next);
  }, [language]);

  const effectiveLanguage = useMemo(
    () => String((onLanguageChange ? language : localLanguage) || 'javascript').toLowerCase(),
    [language, localLanguage, onLanguageChange]
  );

  // Handle code changes
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    onCodeChange?.(newCode);

    // Send real-time code updates
    if (connected && sessionId) {
      sendCodeUpdate(sessionId, newCode, effectiveLanguage);
    }

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(sessionId, true);
      
      // Stop typing indicator after 2 seconds
      setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(sessionId, false);
      }, 2000);
    }
  }, [connected, sessionId, effectiveLanguage, sendCodeUpdate, sendTypingIndicator, isTyping, onCodeChange]);

  // Execute code
  const handleExecuteCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsExecuting(true);
    try {
      const result = await executeCode(code, effectiveLanguage, sessionId, question.testCases || []);
      setExecutionResult(result.executionResult);
      onExecutionResult?.(result);
      
      if (result.executionResult.success) {
        toast.success(`Code executed successfully! ${result.executionResult.summary?.passed || 0}/${result.executionResult.summary?.total || 0} tests passed`);
      } else {
        toast.error('Code execution failed');
      }
    } catch (error) {
      toast.error('Failed to execute code');
    } finally {
      setIsExecuting(false);
    }
  };

  // Get AI feedback
  const handleGetFeedback = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    try {
      const result = await getLiveFeedback(code, effectiveLanguage, sessionId, questionId);
      setLiveFeedback(result.feedback);
      toast.success('AI feedback received!');
    } catch (error) {
      toast.error('Failed to get AI feedback');
    }
  };

  // Save progress
  const handleSaveProgress = useCallback(async () => {
    try {
      await saveProgress(sessionId, questionId, code, '');
      setLastSaved(new Date());
      toast.success('Progress saved!');
    } catch (error) {
      toast.error('Failed to save progress');
    }
  }, [saveProgress, sessionId, questionId, code]);

  // Subscribe to real-time events
  useEffect(() => {
    if (!connected) return;

    const unsubscribeExecution = subscribeToExecutionResults((data) => {
      if (data.sessionId === sessionId) {
        setExecutionResult(data.executionResult);
        onExecutionResult?.(data);
      }
    });

    const unsubscribeFeedback = subscribeToLiveFeedback((data) => {
      if (data.sessionId === sessionId && data.questionId === questionId) {
        setLiveFeedback(data.feedback);
      }
    });

    const unsubscribeTyping = subscribeToTypingIndicators((data) => {
      if (data.sessionId === sessionId && data.userId !== sessionId) {
        // Handle typing indicators from other users (for collaborative features)
        console.log(`${data.userName} is ${data.isTyping ? 'typing' : 'not typing'}`);
      }
    });

    return () => {
      unsubscribeExecution?.();
      unsubscribeFeedback?.();
      unsubscribeTyping?.();
    };
  }, [connected, sessionId, questionId, subscribeToExecutionResults, subscribeToLiveFeedback, subscribeToTypingIndicators, onExecutionResult]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!code.trim()) return;

    const autoSaveInterval = setInterval(() => {
      handleSaveProgress();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [code, handleSaveProgress]);

  const getLanguageTemplate = useCallback((lang) => {
    const langKey = String(lang || '').toLowerCase();
    const starter = question?.starterCode && typeof question.starterCode === 'object'
      ? question.starterCode[langKey]
      : '';
    if (starter && String(starter).trim()) return starter;

    const templates = {
      javascript: `function solution(...args) {
  return null;
}`,
      python: `def solution(*args):
    return None`,
      java: `public class Main {
  public static void main(String[] args) {
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  return 0;
}`
    };
    return templates[langKey] || templates.javascript;
  }, [question]);

  const handleLanguageSelectChange = useCallback((nextLang) => {
    const next = String(nextLang || '').toLowerCase();
    if (!next || next === effectiveLanguage) return;

    // Cache current code per language
    codeByLanguageRef.current[effectiveLanguage] = code;

    // Switch language (controlled or uncontrolled)
    setLocalLanguage(next);
    onLanguageChange?.(next);

    // Swap editor content to cached code or a clean template
    const nextCode = codeByLanguageRef.current[next] ?? getLanguageTemplate(next);
    codeByLanguageRef.current[next] = nextCode;
    setCode(nextCode);
    setExecutionResult(null);
    setLiveFeedback(null);
  }, [code, effectiveLanguage, getLanguageTemplate, onLanguageChange]);

  // Initialize once
  useEffect(() => {
    if (String(code || '').trim()) return;
    const initial = getLanguageTemplate(effectiveLanguage);
    codeByLanguageRef.current[effectiveLanguage] = initial;
    setCode(initial);
  }, [code, effectiveLanguage, getLanguageTemplate]);

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-white">
        <div className="flex items-center space-x-4">
          <select 
            value={effectiveLanguage}
            onChange={(e) => handleLanguageSelectChange(e.target.value)}
            className="text-sm border border-secondary-300 rounded px-3 py-1"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          
          <div className="flex items-center space-x-1 text-xs text-secondary-600">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-error-500'}`}></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveProgress}
            className="btn btn-ghost text-sm flex items-center space-x-1"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          
          <button
            onClick={handleGetFeedback}
            className="btn btn-secondary text-sm flex items-center space-x-1"
          >
            <Zap className="w-4 h-4" />
            <span>AI Feedback</span>
          </button>
          
          <button
            onClick={handleExecuteCode}
            disabled={isExecuting}
            className="btn btn-primary text-sm flex items-center space-x-1"
          >
            {isExecuting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="w-full h-full resize-none border-0 p-4 font-mono text-sm focus:outline-none focus:ring-0"
          placeholder="Write your solution here..."
          spellCheck={false}
        />
        
        {lastSaved && (
          <div className="absolute top-2 right-2 text-xs text-success-600 bg-success-50 px-2 py-1 rounded">
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Execution Results */}
      {executionResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-secondary-200 bg-white p-4"
        >
          <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
            {executionResult.success ? (
              <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 text-error-600 mr-2" />
            )}
            Execution Results
          </h4>
          
          {executionResult.success ? (
            <div className="space-y-3">
              {executionResult.summary && (
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-success-600 font-medium">
                    {executionResult.summary.passed}/{executionResult.summary.total} tests passed
                  </span>
                  <span className="text-secondary-600">
                    {executionResult.summary.percentage}% success rate
                  </span>
                </div>
              )}
              
              {Array.isArray(executionResult.testResults) && executionResult.testResults.length > 0 && (
                <div className="space-y-2">
                  {executionResult.testResults.map((test, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {test.passed ? (
                        <CheckCircle className="w-3 h-3 text-success-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-error-600" />
                      )}
                      <span>Test {test.testCase}: {test.passed ? 'Passed' : 'Failed'}</span>
                      {!test.passed && test.error && (
                        <span className="text-error-600">({test.error})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-error-600 text-sm">
              <p className="font-medium">Error:</p>
              <pre className="mt-1 text-xs bg-error-50 p-2 rounded overflow-x-auto">
                {executionResult.error}
              </pre>
            </div>
          )}
        </motion.div>
      )}

      {/* AI Feedback */}
      {liveFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-secondary-200 bg-primary-50 p-4"
        >
          <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
            <Zap className="w-4 h-4 text-primary-600 mr-2" />
            AI Feedback
          </h4>
          
          <div className="space-y-2 text-sm">
            {liveFeedback.strengths && liveFeedback.strengths.length > 0 && (
              <div>
                <span className="font-medium text-success-700">Strengths:</span>
                <ul className="list-disc list-inside text-success-600 ml-2">
                  {liveFeedback.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {liveFeedback.improvements && liveFeedback.improvements.length > 0 && (
              <div>
                <span className="font-medium text-warning-700">Improvements:</span>
                <ul className="list-disc list-inside text-warning-600 ml-2">
                  {liveFeedback.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeCodeEditor;
