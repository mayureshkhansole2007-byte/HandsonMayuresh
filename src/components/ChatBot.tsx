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
      text: 'Hello! 👋 I\'m your professional career guidance assistant. I\'m here to help you explore career paths, suggest skills to learn, and provide step-by-step guidance. What would you like to know about your career?',
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

    // Career guidance prompt-based logic
    // If user has assessment data, provide personalized guidance
    if (currentPhase === 'results' && assessmentData) {
      if (lowerMessage.includes('career') || lowerMessage.includes('suggest') || lowerMessage.includes('recommend')) {
        return `Based on your interests (${assessmentData.interests.join(', ')}) and skills (${assessmentData.skills.join(', ')}), I can recommend relevant career paths. Check your results dashboard above for detailed recommendations! 🎯`;
      }
      if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
        return `Great question! Based on your profile, I recommend learning skills aligned with your interests. Here are practical next steps: 1) Choose a career path from your results, 2) Research the required skills, 3) Find free online courses (Coursera, Udemy), 4) Build a portfolio project. What specific skill would you like to start with? 💡`;
      }
      if (lowerMessage.includes('path') || lowerMessage.includes('direction')) {
        return `Let me guide you step-by-step! First, which career from your results interests you most? Once you choose, I can provide: specific job responsibilities, required skills, recommended learning resources, and salary insights. 🚀`;
      }
    }

    // Before assessment
    if (currentPhase === 'landing' || currentPhase === 'assessment') {
      if (lowerMessage.includes('career') || lowerMessage.includes('path') || lowerMessage.includes('job')) {
        return `Excellent! To give you personalized career guidance, I recommend taking our assessment first. It will help me understand your interests, skills, and education level. Once complete, I can suggest suitable career paths and learning steps. Ready to start? 🎯`;
      }
    }

    // Limited information - ask follow-up questions
    if (userMessage.length < 10) {
      const followUps = [
        "I'd love to help! Can you tell me more? For example: What are your main interests? What skills do you have? What's your education level? 📋",
        "That's a start! 👀 To give you better guidance, could you share: What industries interest you? What are your strengths? What's your current education? 🎓",
      ];
      return followUps[Math.floor(Math.random() * followUps.length)];
    }

    // Career-related keywords
    if (lowerMessage.includes('salary') || lowerMessage.includes('income')) {
      return `Great practical question! Salaries vary by location, experience, and company. From your results, the recommended careers have solid growth prospects. I can provide more specific salary info once you choose a career path. Which one interests you? 💰`;
    }

    if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('bootcamp')) {
      return `Smart thinking! Education requirements vary by career. Some need a degree, others accept bootcamp certification or self-learning. From your results, I can detail the education path for each recommended career. Which career would you like to explore? 🎓`;
    }

    if (lowerMessage.includes('step') || lowerMessage.includes('beginner')) {
      return `Perfect! Here's my beginner-friendly roadmap: 1️⃣ Take the assessment, 2️⃣ Review career recommendations, 3️⃣ Pick one career, 4️⃣ Learn foundational skills, 5️⃣ Build projects, 6️⃣ Apply for jobs. Which step are you on? Let's break it down! 🚀`;
    }

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hi there! 👋 I'm here to help guide your career journey. What aspect of career planning would you like to explore today?";
    }

    // Thank you responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! 😊 Any other career guidance questions I can help with?";
    }

    // Goodbye responses
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      return "Goodbye! Best of luck with your career journey! 👋";
    }

    // Question mark detection - general career guidance
    if (lowerMessage.endsWith('?')) {
      const responses = [
        "Great question! 💭 Tell me more context so I can give you practical advice.",
        "That's important! 💡 To guide you better, can you share additional details?",
        "Good thinking! 🧠 Help me understand your situation better—what's your background and goal?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // General statement responses
    const generalResponses = [
      "I understand! 💭 How can I help you turn that into action? Any specific career guidance you need?",
      "That's valuable context! 🎯 Based on this, what would you like to focus on next?",
      "Got it! 👍 Do you want to explore specific career paths or learn about required skills?",
      "I hear you! 📝 Would an assessment help identify the best career path for you?",
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
