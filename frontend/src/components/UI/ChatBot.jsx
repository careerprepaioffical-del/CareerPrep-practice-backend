import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I\'m your CareerPrep Ai assistant. I can help you with interview preparation, coding questions, and career advice. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      // Simulate AI response
      setTimeout(() => {
        const botResponse = generateBotResponse(inputMessage);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          content: botResponse,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      toast.error('Failed to send message');
    }
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('interview') || input.includes('prepare')) {
      return 'Great! I can help you prepare for interviews. Here are some ways I can assist:\n\n• Practice coding questions\n• Review technical concepts\n• Explain time and space complexity\n• Suggest a study plan\n\nWhat role are you preparing for?';
    }
    
    if (input.includes('coding') || input.includes('algorithm')) {
      return 'Perfect! For coding interview preparation, I recommend:\n\n• Start with easy problems on arrays and strings\n• Practice data structures (linked lists, trees, graphs)\n• Focus on time and space complexity\n• Use our coding interview simulator\n\nWould you like me to suggest some specific problems to practice?';
    }
    
    if (input.includes('behavioral') || input.includes('star')) {
      return 'Behavioral interviews are crucial! Here\'s how to excel:\n\n• Use the STAR method (Situation, Task, Action, Result)\n• Prepare 5-7 strong examples from your experience\n• Practice common questions like "Tell me about a challenge"\n• Be specific with metrics and outcomes\n\nWant to practice a behavioral question right now?';
    }
    
    if (input.includes('help') || input.includes('what can you do')) {
      return 'I\'m here to help with your interview preparation! I can:\n\n• Answer questions about interview processes\n• Provide coding problem suggestions\n• Help with behavioral interview prep\n• Explain technical concepts\n• Review your practice session results\n\nJust ask me anything about interviews or career preparation!';
    }
    
    if (input.includes('score') || input.includes('result') || input.includes('feedback')) {
      return 'I can help you understand your interview performance:\n\n• Review your coding solution efficiency\n• Analyze your behavioral responses\n• Suggest areas for improvement\n• Provide personalized study plans\n• Track your progress over time\n\nWould you like me to review your recent practice session?';
    }
    
    // Default responses
    const defaultResponses = [
      'That\'s an interesting question! Could you provide more details about what specific aspect of interview preparation you\'d like help with?',
      'I\'d be happy to help! Are you looking for coding practice, behavioral interview tips, or system design guidance?',
      'Great question! Let me know if you\'re preparing for technical interviews, behavioral rounds, or system design discussions.',
      'I\'m here to help with your interview preparation. What specific area would you like to focus on today?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

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
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${isOpen ? 'hidden' : 'block'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 60 : 500
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-secondary-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">CareerPrep Ai Assistant</h3>
                  <p className="text-xs text-primary-100">Always here to help</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-secondary-200 text-secondary-600'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Bot className="w-3 h-3" />
                          )}
                        </div>
                        
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-secondary-100 text-secondary-900'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-primary-100' : 'text-secondary-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 max-w-xs">
                        <div className="w-6 h-6 bg-secondary-200 text-secondary-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3" />
                        </div>
                        <div className="bg-secondary-100 rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-secondary-200 p-4">
                  <div className="flex space-x-2">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about interviews..."
                      className="flex-1 resize-none border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={1}
                      disabled={isTyping}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
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
