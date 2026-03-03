import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const getSocketBaseUrl = () => {
  // Prefer an explicit socket URL if provided.
  if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;

  // Many environments set API URL like "http://localhost:5000/api".
  // Socket.IO server is hosted on the same origin but NOT under /api.
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl) return String(apiUrl).replace(/\/api\/?$/i, '');

  return 'http://localhost:5000';
};

const useRealtimeInterview = (sessionId) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [realtimeData, setRealtimeData] = useState({
    executionResult: null,
    liveFeedback: null,
    sessionStatus: null,
    typingIndicators: [],
    progressSaved: null
  });
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!sessionId) return;

    const socketUrl = getSocketBaseUrl();
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      reconnectAttempts.current = 0;
      
      // Join interview room
      newSocket.emit('join-interview', sessionId);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      reconnectAttempts.current++;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
      }
    });

    // Real-time events
    newSocket.on('code-execution-result', (data) => {
      if (data.sessionId === sessionId) {
        setRealtimeData(prev => ({
          ...prev,
          executionResult: data
        }));
      }
    });

    newSocket.on('live-feedback', (data) => {
      if (data.sessionId === sessionId) {
        setRealtimeData(prev => ({
          ...prev,
          liveFeedback: data
        }));
      }
    });

    newSocket.on('session-status-update', (data) => {
      if (data.sessionId === sessionId) {
        setRealtimeData(prev => ({
          ...prev,
          sessionStatus: data
        }));
      }
    });

    newSocket.on('typing-indicator', (data) => {
      if (data.sessionId === sessionId) {
        setRealtimeData(prev => ({
          ...prev,
          typingIndicators: prev.typingIndicators.filter(
            t => t.userId !== data.userId
          ).concat(data.isTyping ? [data] : [])
        }));
      }
    });

    newSocket.on('progress-saved', (data) => {
      if (data.sessionId === sessionId) {
        setRealtimeData(prev => ({
          ...prev,
          progressSaved: data
        }));
      }
    });

    newSocket.on('interview-progress', (data) => {
      if (data.sessionId === sessionId) {
        setRealtimeData(prev => ({
          ...prev,
          sessionStatus: {
            ...prev.sessionStatus,
            progress: data.progress
          }
        }));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [sessionId]);

  const emitCodeUpdate = (code, language) => {
    if (socket && connected) {
      socket.emit('code-update', {
        sessionId,
        code,
        language,
        timestamp: new Date()
      });
    }
  };

  const emitTypingIndicator = (isTyping) => {
    if (socket && connected) {
      socket.emit('typing-indicator', {
        sessionId,
        isTyping,
        timestamp: new Date()
      });
    }
  };

  const emitInterviewProgress = (progress) => {
    if (socket && connected) {
      socket.emit('interview-progress', {
        sessionId,
        progress,
        timestamp: new Date()
      });
    }
  };

  const clearRealtimeData = (type) => {
    setRealtimeData(prev => ({
      ...prev,
      [type]: null
    }));
  };

  return {
    socket,
    connected,
    realtimeData,
    emitCodeUpdate,
    emitTypingIndicator,
    emitInterviewProgress,
    clearRealtimeData
  };
};

export default useRealtimeInterview;
