import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSend, IoClose, IoLogoWechat } from 'react-icons/io5';
import './ChatBot.css';
import type { AssessmentState } from './AssessmentForm';
import type { Phase } from '../App';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  isOpen?: boolean;
  onClose?: () => void;
  assessmentData?: AssessmentState | null;
  currentPhase?: Phase;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen = true, onClose, assessmentData, currentPhase = 'landing' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 I\'m your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Context-aware responses based on current phase
    if (currentPhase === 'results' && assessmentData) {
      if (lowerMessage.includes('score') || lowerMessage.includes('result')) {
        return `Great! Based on your assessment, I've provided you with personalized career recommendations. Check out your results above! 🎉`;
      }
      if (lowerMessage.includes('improve') || lowerMessage.includes('better')) {
        return `I'd recommend focusing on areas where you had challenges. Would you like to retake the assessment to track your progress?`;
      }
    }

    if (currentPhase === 'assessment') {
      if (lowerMessage.includes('help') || lowerMessage.includes('hint')) {
        return `You're in the middle of an assessment! Focus on answering to the best of your ability. You've got this! 💪`;
      }
    }

    // Greeting responses
    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey')
    ) {
      return "Hi there! 😊 How can I assist you today?";
    }

    // Help responses
    if (
      lowerMessage.includes('help') ||
      lowerMessage.includes('assistance')
    ) {
      return "I'm here to help! 🤝 I can guide you through assessments, answer questions, and help you learn. What do you need?";
    }

    // Assessment/Test responses
    if (
      lowerMessage.includes('assessment') ||
      lowerMessage.includes('test') ||
      lowerMessage.includes('quiz')
    ) {
      return "Great! You can take an assessment to evaluate your knowledge and get personalized insights. Would you like to start one?";
    }

    // How are you responses
    if (
      lowerMessage.includes('how') &&
      lowerMessage.includes('you')
    ) {
      return "I'm doing great, thanks for asking! 🤖 I'm here to help you with any questions.";
    }

    // Thank you responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! 😊 Is there anything else I can help you with?";
    }

    // Goodbye responses
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      return "Goodbye! Have a great day! 👋";
    }

    // Question mark detection
    if (lowerMessage.endsWith('?')) {
      const responses = [
        "That's a great question! 🤔 Tell me more about what you're looking to know.",
        "Good question! 💡 I'm here to help. Can you provide more details?",
        "Interesting! 🧠 I'd love to help. What specifically would you like to know?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // General statement responses
    const generalResponses = [
      "I see what you mean! 💭 Can you tell me more about that?",
      "That sounds interesting! 🎯 How can I help you with this?",
      "Got it! 👍 What would you like to do next?",
      "I understand! 📝 Is there something specific I can help you with?",
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsChatOpen(false);
    onClose?.();
  };

  const handleOpen = () => {
    setIsChatOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="chatbot-container"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-title">
                <IoLogoWechat className="chatbot-icon" />
                <span>AI Assistant</span>
              </div>
              <button
                className="chatbot-close-btn"
                onClick={handleClose}
                aria-label="Close chat"
              >
                <IoClose />
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.sender}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="message-content">{message.text}</div>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  className="message bot loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-area">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="chatbot-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || inputValue.trim() === ''}
                className="chatbot-send-btn"
                aria-label="Send message"
              >
                <IoSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isChatOpen && (
        <motion.button
          className="chatbot-fab"
          onClick={handleOpen}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open chat"
        >
          <IoLogoWechat />
        </motion.button>
      )}
    </>
  );
};

export default ChatBot;
