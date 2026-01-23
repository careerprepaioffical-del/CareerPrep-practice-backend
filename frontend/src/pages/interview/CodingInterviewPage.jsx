import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Save, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Code,
  Send,
  Zap,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';
import useRealtimeInterview from '../../hooks/useRealtimeInterview';

const CodingInterviewPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [code, setCode] = useState('');
  const DEFAULT_COMPILER_LANGUAGE = 'cpp';
  const [language, setLanguage] = useState(DEFAULT_COMPILER_LANGUAGE);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(new Date());
  const [testsPassed, setTestsPassed] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [realtimeScore, setRealtimeScore] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    codeQuality: 0,
    efficiency: 0,
    correctness: 0
  });
  const [isConnected, setIsConnected] = useState(false);

  const codeByLanguageRef = useRef({});
  const saveTimeoutRef = useRef(null);
  
  // Real-time interview hook
  const {
    connected: socketConnected,
    realtimeData,
    emitCodeUpdate,
    emitTypingIndicator,
    emitInterviewProgress,
    clearRealtimeData
  } = useRealtimeInterview(sessionId);

  const question = currentQuestion;

  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const getTemplateForLanguage = useCallback((lang) => {
    const templates = {
      javascript: `// Read input from stdin
const input = require('fs').readFileSync(0, 'utf-8').trim().split('\\n');

// Parse input based on problem requirements
// Example: If input is numbers separated by space: const nums = input[0].split(' ').map(Number);
// Example: If input is JSON array: const nums = JSON.parse(input[0]);
// Example: If input is single number: const num = parseInt(input[0]);

// Write your solution here
// IMPORTANT: This is scratch format - read from stdin, write to stdout
// DO NOT use function definitions like function solution(...args)
// Instead, process the input directly and console.log the result

// Your code here:


// Output result
console.log(JSON.stringify(result));`,
      python: `import sys
import json

# Read input from stdin
data = sys.stdin.read().strip().split('\\n')

# Parse input based on problem requirements
# Example: If input is numbers separated by space: nums = list(map(int, data[0].split()))
# Example: If input is JSON array: nums = json.loads(data[0])
# Example: If input is single number: num = int(data[0])

# Write your solution here
# IMPORTANT: This is scratch format - read from stdin, write to stdout
# DO NOT use function definitions like def solution(*args):
# Instead, process the input directly and print the result

# Your code here:


# Output result
print(json.dumps(result))`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        // Read input
        String line = br.readLine();
        
        // Parse input based on problem requirements
        // Example: If input is numbers separated by space: String[] nums = line.split(" ");
        // Example: If input is JSON array: Use JSON parser
        // Example: If input is single number: int num = Integer.parseInt(line.trim());
        
        // Write your solution here
        // IMPORTANT: This is scratch format - read from stdin, write to stdout
        // DO NOT use function definitions like public static int solution(...)
        // Instead, process the input directly and System.out.println the result
        
        // Your code here:
        
        
        // Output result
        System.out.println(result);
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Read input
    string line;
    getline(cin, line);
    
    // Parse input based on problem requirements
    // Example: If input is numbers separated by space: use stringstream
    // Example: If input is JSON array: parse manually
    // Example: If input is single number: int num = stoi(line);
    
    // Write your solution here
    // IMPORTANT: This is scratch format - read from stdin, write to stdout
    // DO NOT use function definitions like int solution(...)
    // Instead, process the input directly and cout the result
    
    // Your code here:
    
    
    // Output result
    cout << result;
    return 0;
}`
    };
    return templates[String(lang || '').toLowerCase()] || templates.cpp;
  }, []);

  const getStarterCode = useCallback((lang) => {
    const langKey = String(lang || '').toLowerCase();
    const starter = question?.starterCode && typeof question.starterCode === 'object'
      ? question.starterCode[langKey]
      : '';
    return (starter && String(starter).trim()) ? starter : getTemplateForLanguage(langKey);
  }, [question, getTemplateForLanguage]);

  // Load coding session
  useEffect(() => {
    const load = async () => {
      if (!sessionId) return;
      setLoading(true);
      setLoadError('');

      try {
        const resp = await apiMethods.coding.getSession(sessionId);
        const data = resp?.data?.data;
        const q = data?.question;
        if (!q) throw new Error('No coding question found for this session');

        setCurrentQuestion(q);
        // App default: start in C++ unless the user has saved progress in another language.
        setLanguage(DEFAULT_COMPILER_LANGUAGE);

        const getStarterCodeForQuestion = (questionData, lang) => {
          const langKey = String(lang || '').toLowerCase();
          const starter = questionData?.starterCode && typeof questionData.starterCode === 'object'
            ? questionData.starterCode[langKey]
            : '';
          return (starter && String(starter).trim()) ? starter : getTemplateForLanguage(langKey);
        };

        // Load any saved progress
        const progressResp = await apiMethods.coding.getProgress(sessionId, { questionId: q.id });
        const progress = progressResp?.data?.data?.progress;

        if (progress?.code && progress?.language) {
          const progressLang = String(progress.language).toLowerCase();
          codeByLanguageRef.current[progressLang] = progress.code;
          setLanguage(progressLang);
          setCode(progress.code);
        } else {
          const initial = getStarterCodeForQuestion(q, DEFAULT_COMPILER_LANGUAGE);
          codeByLanguageRef.current[DEFAULT_COMPILER_LANGUAGE] = initial;
          setCode(initial);
        }
        if (typeof progress?.score === 'number') setRealtimeScore(progress.score);
        if (typeof progress?.testsPassed === 'number') setTestsPassed(progress.testsPassed);
        if (typeof progress?.totalTests === 'number') setTotalTests(progress.totalTests);
        if (typeof progress?.timeElapsed === 'number') setTimeElapsed(progress.timeElapsed);
      } catch (error) {
        const isNetwork = !error?.response;
        const message = isNetwork
          ? 'Network error. Please check your connection.'
          : (error?.response?.data?.message || error?.message || 'Failed to load coding session');
        setLoadError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId, getTemplateForLanguage]);

  // Handle real-time updates
  useEffect(() => {
    setIsConnected(socketConnected);
  }, [socketConnected]);

  useEffect(() => {
    if (realtimeData.executionResult) {
      const result = realtimeData.executionResult;
      setExecutionResult(result.executionResult);
      
      if (result.executionResult?.success) {
        const passed = result.executionResult.testResults?.filter(test => test.passed).length || 0;
        const total = result.executionResult.testResults?.length || 0;
        const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        setTestsPassed(passed);
        setTotalTests(total);
        setRealtimeScore(percentage);
        
        // Update performance metrics
        setPerformanceMetrics(prev => ({
          ...prev,
          correctness: percentage,
          efficiency: result.executionResult.executionTimeMs ? Math.max(0, 100 - (result.executionResult.executionTimeMs / 100)) : 0,
          codeQuality: result.complexityAnalysis ? Math.max(0, 100 - (result.complexityAnalysis.complexity * 10)) : 0
        }));
        
        if (passed === total && total > 0) {
          toast.success(`All tests passed! Score: ${percentage}%`, {
            icon: '🎉',
            duration: 3000
          });
        } else {
          toast(`${passed}/${total} tests passed. Score: ${percentage}%`, {
            icon: passed > 0 ? '⚡' : '❌',
            duration: 2000
          });
        }
      }
      
      clearRealtimeData('executionResult');
    }
  }, [realtimeData.executionResult, clearRealtimeData]);

  useEffect(() => {
    if (realtimeData.liveFeedback) {
      const feedback = realtimeData.liveFeedback.feedback;
      if (feedback?.score) {
        setRealtimeScore(feedback.score);
        setPerformanceMetrics(prev => ({
          ...prev,
          codeQuality: feedback.codeQuality || prev.codeQuality,
          efficiency: feedback.efficiency || prev.efficiency
        }));
      }
      clearRealtimeData('liveFeedback');
    }
  }, [realtimeData.liveFeedback, clearRealtimeData]);

  useEffect(() => {
    if (realtimeData.progressSaved) {
      toast.success('Progress auto-saved', {
        icon: '💾',
        duration: 1500
      });
      clearRealtimeData('progressSaved');
    }
  }, [realtimeData.progressSaved, clearRealtimeData]);

  // Auto-save progress
  const autoSaveProgress = useCallback(() => {
    if (!question || !code.trim()) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      apiMethods.coding.saveProgress({
        sessionId,
        questionId: question.id,
        code,
        language,
        score: realtimeScore,
        testsPassed,
        totalTests,
        timeElapsed
      }).catch(error => {
        console.error('Auto-save failed:', error);
      });
    }, 2000); // Save after 2 seconds of inactivity
  }, [sessionId, question, code, language, realtimeScore, testsPassed, totalTests, timeElapsed]);

  // Emit code updates for real-time collaboration
  useEffect(() => {
    if (socketConnected && code) {
      emitCodeUpdate(code, language);
      autoSaveProgress();
    }
  }, [code, language, socketConnected, emitCodeUpdate, autoSaveProgress]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((new Date() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime]);

  // Reset per-question editor cache
  useEffect(() => {
    if (!question?.id) return;
    codeByLanguageRef.current = {};

    const initialLang = String(languageRef.current || DEFAULT_COMPILER_LANGUAGE).toLowerCase();
    const initialCode = getStarterCode(initialLang);
    codeByLanguageRef.current[initialLang] = initialCode;
    setCode(initialCode);
    setExecutionResult(null);
    setRealtimeScore(0);
    setTestsPassed(0);
    setTotalTests(0);
  }, [question?.id, getStarterCode]);

  const handleLanguageChange = useCallback((nextLanguage) => {
    const next = String(nextLanguage || '').toLowerCase();
    const current = String(language || '').toLowerCase();
    if (!next || next === current) return;

    codeByLanguageRef.current[current] = code;
    const nextCode = codeByLanguageRef.current[next] ?? getStarterCode(next);
    codeByLanguageRef.current[next] = nextCode;
    setLanguage(next);
    setCode(nextCode);

    // Clear previous run results (they're language-specific)
    setExecutionResult(null);
    setRealtimeScore(0);
    setTestsPassed(0);
    setTotalTests(0);
  }, [code, language, getStarterCode]);

  // Execute code with real test cases
  const executeCode = async () => {
    if (!question) return;
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsExecuting(true);
    emitTypingIndicator(false);
    
    try {
      const response = await apiMethods.coding.execute(
        {
          sessionId,
          code,
          language,
          questionId: question.id,
          testCases: question.testCases
        }
      );

      const result = response?.data;
      
      if (result.success) {
        // Update UI immediately from HTTP response
        const data = result?.data || {};
        setExecutionResult(data);

        if (Array.isArray(data.testResults)) {
          const passed = data.testResults.filter((t) => t && t.passed).length;
          const total = data.testResults.length;
          const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

          setTestsPassed(passed);
          setTotalTests(total);
          setRealtimeScore(percentage);

          setPerformanceMetrics((prev) => ({
            ...prev,
            correctness: percentage,
            efficiency: data.executionTimeMs ? Math.max(0, 100 - (data.executionTimeMs / 100)) : 0,
            codeQuality: data.complexityAnalysis ? Math.max(0, 100 - (Number(data.complexityAnalysis.complexity || 0) * 10)) : 0
          }));
        }

        emitInterviewProgress({
          currentQuestion: question.id,
          code,
          language,
          timestamp: new Date()
        });
      } else {
        toast.error(result.message || 'Execution failed');
        setExecutionResult({ success: false, error: result.message });
      }
    } catch (error) {
      console.error('Execution error:', error);
      const isNetwork = !error?.response;
      if (!isNetwork) {
        toast.error(error?.response?.data?.message || 'Failed to execute code');
      }
      setExecutionResult({ success: false, error: isNetwork ? 'Network error. Please check your connection.' : 'Execution failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  // Save progress
  const saveProgress = async () => {
    setIsSaving(true);
    
    try {
      if (!question) return;
      const response = await apiMethods.coding.saveProgress({
        sessionId,
        questionId: question.id,
        code,
        language,
        score: realtimeScore,
        testsPassed,
        totalTests,
        timeElapsed
      });

      const result = response?.data;
      
      if (result.success) {
        toast.success('Progress saved successfully!', {
          icon: '💾'
        });
      } else {
        toast.error('Failed to save progress');
      }
    } catch (error) {
      console.error('Save error:', error);
      const isNetwork = !error?.response;
      if (!isNetwork) {
        toast.error(error?.response?.data?.message || 'Failed to save progress');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Submit solution
  const submitSolution = async () => {
    if (realtimeScore === 0) {
      toast.error('Please run your code and pass some tests before submitting');
      return;
    }

    try {
      if (!question) return;
      const response = await apiMethods.coding.submit({
        sessionId,
        questionId: question.id,
        code,
        language,
        finalScore: realtimeScore,
        testsPassed,
        totalTests,
        timeElapsed
      });

      const result = response?.data;
      
      if (result.success) {
        toast.success('Solution submitted successfully!', {
          icon: '🎯'
        });
        navigate(`/interview/results/${sessionId}`);
      } else {
        toast.error('Failed to submit solution');
      }
    } catch (error) {
      console.error('Submit error:', error);
      const isNetwork = !error?.response;
      if (!isNetwork) {
        toast.error(error?.response?.data?.message || 'Failed to submit solution');
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading coding session…</p>
          </div>
        </div>
      ) : loadError ? (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700 font-medium">{loadError}</div>
          </div>
        </div>
      ) : !question ? (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700 font-medium">No coding question found.</div>
          </div>
        </div>
      ) : (
      <>
      {/* Enhanced Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Code className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Coding Interview</h1>
              <p className="text-sm text-slate-600">{question.title} - {String(question.difficulty || '').toLowerCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-xs text-slate-600">{isConnected ? 'Connected' : 'Offline'}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-slate-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-sm font-semibold">{formatTime(timeElapsed)}</span>
            </div>
            
            <div className="text-sm bg-slate-100 px-3 py-1 rounded-full">
              <span className="text-slate-600">Score: </span>
              <span className={`font-bold ${
                realtimeScore >= 80 ? 'text-green-600' : 
                realtimeScore >= 60 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {realtimeScore}%
              </span>
            </div>
            
            <div className="text-sm bg-slate-100 px-3 py-1 rounded-full">
              <span className="text-slate-600">Tests: </span>
              <span className="font-bold text-slate-900">{testsPassed}/{totalTests}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-600">Correctness:</span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${performanceMetrics.correctness}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-slate-700">{performanceMetrics.correctness}%</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-slate-600">Efficiency:</span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-600 transition-all duration-300"
                  style={{ width: `${performanceMetrics.efficiency}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-slate-700">{performanceMetrics.efficiency}%</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-sm text-slate-600">Code Quality:</span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${performanceMetrics.codeQuality}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-slate-700">{performanceMetrics.codeQuality}%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">Live Mode</span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Enhanced Question Panel */}
        <div className="w-1/2 p-6 overflow-y-auto bg-white border-r border-slate-200">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Question Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {question.title}
              </h2>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  String(question.difficulty || '').toLowerCase() === 'easy' ? 'bg-green-100 text-green-700' :
                  String(question.difficulty || '').toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {String(question.difficulty || '').toLowerCase()}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {question.type}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  {question.timeLimit || 30} min
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Problem Description
              </h3>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {question.description}
                </p>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Examples
              </h3>
              <div className="space-y-4">
                {(question.examples || []).map((example, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="grid grid-cols-1 gap-3 font-mono text-sm">
                      <div className="flex items-start space-x-3">
                        <span className="text-slate-600 font-semibold min-w-20">Input:</span>
                        <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded flex-1">{example.input}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-slate-600 font-semibold min-w-20">Output:</span>
                        <span className="text-slate-900 bg-green-100 px-2 py-1 rounded flex-1">{example.output}</span>
                      </div>
                      {example.explanation && (
                        <div className="flex items-start space-x-3">
                          <span className="text-slate-600 font-semibold min-w-20">Explanation:</span>
                          <span className="text-slate-700 flex-1">{example.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Constraints
              </h3>
              <ul className="space-y-2">
                {Array.isArray(question.constraints)
                  ? question.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700">{constraint}</span>
                      </li>
                    ))
                  : question.constraints
                    ? <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700">{question.constraints}</span>
                      </li>
                    : <li className="text-slate-500 italic">No constraints provided.</li>
                }
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Code Editor Panel */}
        <div className="w-1/2 flex flex-col bg-slate-900">
          {/* Editor Header */}
          <div className="bg-slate-800 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-xs text-slate-400">{isConnected ? 'Live' : 'Offline'}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={saveProgress}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save</span>
                </button>
                
                <button
                  onClick={executeCode}
                  disabled={isExecuting}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
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
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                emitTypingIndicator(true);
              }}
              onBlur={() => emitTypingIndicator(false)}
              className="w-full h-full resize-none bg-slate-900 text-slate-100 font-mono text-sm py-4 pr-4 pl-12 focus:outline-none leading-relaxed"
              placeholder="Write your solution here..."
              spellCheck={false}
              style={{
                tabSize: 2,
                minHeight: '400px'
              }}
            />
            
            {/* Line numbers overlay */}
            <div className="absolute left-0 top-0 w-8 h-full bg-slate-800 border-r border-slate-700 pointer-events-none overflow-hidden">
              <div className="font-mono text-xs text-slate-500 leading-relaxed pl-2">
                {code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Results Panel */}
          {executionResult && (
            <div className="bg-slate-800 border-t border-slate-700 p-4 max-h-80 overflow-y-auto">
              <h4 className="font-semibold text-slate-200 mb-3 flex items-center">
                {executionResult.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-green-500">Test Results</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-500">Execution Error</span>
                  </>
                )}
              </h4>
              
              {executionResult.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-slate-700 rounded-lg p-3 text-center">
                      <div className={`text-2xl font-bold ${
                        testsPassed === totalTests ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {testsPassed}/{totalTests}
                      </div>
                      <div className="text-slate-400 text-xs">Tests Passed</div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3 text-center">
                      <div className={`text-2xl font-bold ${
                        realtimeScore >= 80 ? 'text-green-500' : 
                        realtimeScore >= 60 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}>
                        {realtimeScore}%
                      </div>
                      <div className="text-slate-400 text-xs">Score</div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {executionResult.executionTimeMs || 0}ms
                      </div>
                      <div className="text-slate-400 text-xs">Runtime</div>
                    </div>
                  </div>
                  
                  {Array.isArray(executionResult.testResults) && (
                    <div className="space-y-2">
                      {executionResult.testResults.map((test, index) => (
                        <div key={index} className="bg-slate-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {test.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-slate-200 font-medium">Test {index + 1}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              test.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {test.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          {!test.passed && (
                            <div className="text-xs space-y-1 text-slate-400">
                              <div><strong>Expected:</strong> <span className="text-green-400">{JSON.stringify(test.expected)}</span></div>
                              <div><strong>Actual:</strong> <span className="text-red-400">{JSON.stringify(test.actual)}</span></div>
                              {test.error && <div className="text-red-400"><strong>Error:</strong> {test.error}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-400 text-sm">
                  <p className="font-medium mb-2">Execution Error:</p>
                  <pre className="bg-red-900 bg-opacity-30 p-3 rounded overflow-x-auto text-red-300">
                    {executionResult.error}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Submit Button */}
          <div className="bg-slate-800 border-t border-slate-700 p-4">
            <button
              onClick={submitSolution}
              disabled={realtimeScore === 0}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>Submit Solution</span>
              {realtimeScore > 0 && (
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                  {realtimeScore}%
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default CodingInterviewPage;
