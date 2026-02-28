
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ChevronDown, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';


const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  // Fetch chat history from backend when chat is opened and user is authenticated
  useEffect(() => {
    if (isOpen && user) {
      (async () => {
        try {
          const res = await api.get('/chat/history');
          if (res.data.success && Array.isArray(res.data.history)) {
            const formatted = res.data.history.map((msg) => ({
              id: msg._id,
              type: msg.role === 'user' ? 'user' : 'bot',
              content: msg.message,
              timestamp: msg.timestamp || new Date()
            }));
            // If no history, show welcome message
            setMessages(
              formatted.length > 0
                ? formatted
                : [{
                    id: 1,
                    type: 'bot',
                    content: "Hi! I'm your CareerPrep AI assistant. Ask me anything about interview prep, coding challenges, or career advice.",
                    timestamp: new Date()
                  }]
            );
          }
        } catch (err) {
          setMessages([
            {
              id: 1,
              type: 'bot',
              content: "Hi! I'm your CareerPrep AI assistant. Ask me anything about interview prep, coding challenges, or career advice.",
              timestamp: new Date()
            }
          ]);
        }
      })();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send message to backend
      const res = await api.post('/chat/send', { message: inputMessage });
      if (res.data && res.data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'bot',
            content: (() => {
              let reply = Array.isArray(res.data.reply)
                ? res.data.reply.join(' ')
                : typeof res.data.reply === 'object'
                ? JSON.stringify(res.data.reply, null, 2)
                : res.data.reply;
              if (typeof reply === 'string') {
                reply = reply.replace(/\\n/g, '\n').replace(/\\"/g, '"');
              }
              return reply;
            })(),
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'bot',
            content: 'Sorry, I could not process your request.',
            timestamp: new Date()
          }
        ]);
      }
      setIsTyping(false);
    } catch (error) {
      setIsTyping(false);
      toast.error('Failed to send message');
    }
  };

  // Removed generateBotResponse, now handled by backend

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Floating toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl shadow-blue-300 flex items-center justify-center transition-all"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-200 overflow-hidden flex flex-col"
            style={{ height: isMinimized ? 'auto' : '480px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">CareerPrep AI</p>
                  <p className="text-xs text-blue-100 mt-0.5 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 inline-block" />
                    Online — ready to help
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-line">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex-shrink-0 border-t border-slate-200 bg-white p-3">
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask CareerPrep AI..."
                      className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                      disabled={isTyping}
                      autoComplete="off"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;


