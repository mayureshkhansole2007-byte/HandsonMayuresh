import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSend, IoClose, IoLogoWechat } from 'react-icons/io5';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './ChatBot.css';
import type { AssessmentState } from './AssessmentForm';
import type { Phase } from '../App';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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

  const careerGuidancePrompt = `You are a professional career guidance assistant.

Your job is to:
- Ask users about their interests, skills, and education
- Suggest suitable career paths
- Recommend skills and tools to learn
- Provide step-by-step guidance

Always:
- Be clear and beginner-friendly
- Ask follow-up questions before giving final advice
- Give practical and realistic suggestions
- Avoid vague answers like "got it" or generic responses

If user gives little info, ask questions first.
${assessmentData ? `
User Profile:
- Interests: ${assessmentData.interests.join(', ')}
- Skills: ${assessmentData.skills.join(', ')}
- Education Level: ${assessmentData.educationLevel}
- Academic Strength: ${assessmentData.academicStrength}
` : ''}

Respond as a helpful career counselor, not a generic chatbot. Be specific and actionable.`;

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    if (!genAI) {
      return "Sorry, the API is not configured. Please check your environment setup.";
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const chat = model.startChat({
        history: messages
          .filter(m => m.sender !== 'bot' || !m.text.includes('Hello! 👋 I\'m your professional career guidance assistant'))
          .slice(-6) // Keep only last 6 messages to avoid token limits
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.7, // Add some creativity
        },
      });

      const prompt = `${careerGuidancePrompt}\n\nCurrent Phase: ${currentPhase}\n\nUser Message: ${userMessage}\n\nPlease provide specific, actionable career guidance. Avoid generic responses like "got it" or "what would you like to do next".`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response.text();
      return response.trim();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble connecting to the AI service right now. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
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

    try {
      // Get response from Gemini API
      const botResponseText = await generateBotResponse(inputValue);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
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
