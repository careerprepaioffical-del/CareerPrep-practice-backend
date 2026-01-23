import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../utils/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const { user, token } = useAuth();
  const location = useLocation();

  const lastConnectErrorToastAtRef = useRef(0);
  const currentSessionRef = useRef(null);

  const userId = user?._id || null;
  const userName = user?.name || null;

  const authenticated = useMemo(() => !!user && !!token, [user, token]);

  const shouldConnect = useMemo(() => {
    const path = location?.pathname || '';
    // Only connect when real-time features are relevant.
    return path.includes('/interview') || path.includes('/coding') || path.includes('/realtime');
  }, [location?.pathname]);

  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  useEffect(() => {
    if (!authenticated || !userId || !shouldConnect) {
      // If we navigated away from realtime pages, close any existing socket.
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setConnected(false);
      return;
    }

    // Already connected/connecting
    if (socket) return;

    // Initialize socket connection
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: {
        userId,
        userName
      }
    });

    newSocket.on('connect', () => {
      setConnected(true);
      toast.dismiss('socket-connect-error');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      setConnected(false);

      const path = window.location.pathname || '';
      const shouldNotify = !!currentSessionRef.current || path.includes('/interview') || path.includes('/coding') || path.includes('/realtime');

      // Avoid spamming the user on reconnect attempts
      const now = Date.now();
      if (shouldNotify && now - lastConnectErrorToastAtRef.current > 30000) {
        lastConnectErrorToastAtRef.current = now;
        toast.error('Real-time server unavailable. Some live features may not work.', {
          id: 'socket-connect-error'
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [authenticated, userId, userName, shouldConnect, socket]);

  // Join interview session
  const joinInterviewSession = (sessionId) => {
    if (socket && sessionId) {
      socket.emit('join-interview', sessionId);
      setCurrentSession(sessionId);
      console.log(`🎯 Joined interview session: ${sessionId}`);
    }
  };

  // Leave interview session
  const leaveInterviewSession = () => {
    if (socket && currentSession) {
      socket.emit('leave-interview', currentSession);
      setCurrentSession(null);
      console.log(`🎯 Left interview session: ${currentSession}`);
    }
  };

  // Send code update
  const sendCodeUpdate = (sessionId, code, language) => {
    if (socket) {
      socket.emit('code-update', {
        sessionId,
        code,
        language,
        timestamp: new Date()
      });
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (sessionId, isTyping) => {
    if (socket) {
      socket.emit('typing-indicator', {
        sessionId,
        isTyping,
        userId: user?._id,
        userName: user?.name,
        timestamp: new Date()
      });
    }
  };

  // Execute code in real-time
  const executeCode = async (code, language, sessionId, testCases = []) => {
    try {
      const response = await apiMethods.realtime.executeCode({
        code,
        language,
        sessionId,
        testCases
      });

      const result = response?.data;
      if (!result?.success) throw new Error(result?.message || 'Execution failed');

      return result.data;
    } catch (error) {
      console.error('Code execution error:', error);
      toast.error('Failed to execute code');
      throw error;
    }
  };

  // Get live AI feedback
  const getLiveFeedback = async (code, language, sessionId, questionId) => {
    try {
      const response = await apiMethods.realtime.liveFeedback({
        code,
        language,
        sessionId,
        questionId
      });

      const result = response?.data;
      if (!result?.success) throw new Error(result?.message || 'Failed to get feedback');

      return result.data;
    } catch (error) {
      console.error('Live feedback error:', error);
      toast.error('Failed to get AI feedback');
      throw error;
    }
  };

  // Save progress in real-time
  const saveProgress = async (sessionId, questionId, code, notes) => {
    try {
      const response = await apiMethods.realtime.saveProgress({
        sessionId,
        questionId,
        code,
        notes
      });

      const result = response?.data;
      if (!result?.success) throw new Error(result?.message || 'Failed to save progress');

      return result.data;
    } catch (error) {
      console.error('Save progress error:', error);
      toast.error('Failed to save progress');
      throw error;
    }
  };

  // Subscribe to real-time events
  const subscribeToCodeUpdates = (callback) => {
    if (socket) {
      socket.on('code-update', callback);
      return () => socket.off('code-update', callback);
    }
  };

  const subscribeToExecutionResults = (callback) => {
    if (socket) {
      socket.on('code-execution-result', callback);
      return () => socket.off('code-execution-result', callback);
    }
  };

  const subscribeToLiveFeedback = (callback) => {
    if (socket) {
      socket.on('live-feedback', callback);
      return () => socket.off('live-feedback', callback);
    }
  };

  const subscribeToTypingIndicators = (callback) => {
    if (socket) {
      socket.on('typing-indicator', callback);
      return () => socket.off('typing-indicator', callback);
    }
  };

  const subscribeToProgressUpdates = (callback) => {
    if (socket) {
      socket.on('progress-saved', callback);
      return () => socket.off('progress-saved', callback);
    }
  };

  const value = {
    socket,
    connected,
    currentSession,
    
    // Session management
    joinInterviewSession,
    leaveInterviewSession,
    
    // Real-time communication
    sendCodeUpdate,
    sendTypingIndicator,
    
    // API calls with real-time updates
    executeCode,
    getLiveFeedback,
    saveProgress,
    
    // Event subscriptions
    subscribeToCodeUpdates,
    subscribeToExecutionResults,
    subscribeToLiveFeedback,
    subscribeToTypingIndicators,
    subscribeToProgressUpdates
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
