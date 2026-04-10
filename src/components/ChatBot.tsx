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

  const careerGuidancePrompt = `You are an EXPERT CAREER COUNSELOR. You MUST provide specific, actionable career guidance. NEVER give generic responses.

CRITICAL RULES:
- NEVER say "I understand", "Got it", "What would you like to do next", or similar generic phrases
- ALWAYS provide career-specific advice, recommendations, or questions
- If user asks about careers, give 2-3 specific career suggestions with reasons
- If user asks about skills, recommend specific skills and learning resources
- If user asks about education, suggest specific programs or paths
- Always ask follow-up questions about their interests, skills, or goals
- Be professional, encouraging, and specific

${assessmentData ? `USER ASSESSMENT DATA:
- Interests: ${assessmentData.interests.join(', ')}
- Skills: ${assessmentData.skills.join(', ')}
- Education: ${assessmentData.educationLevel}
- Academic Strength: ${assessmentData.academicStrength}

Use this data to personalize your advice.` : 'No assessment data yet - focus on gathering information.'}

Current App Phase: ${currentPhase}

Respond with career counseling expertise. Be specific and helpful.`;

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    console.log('Gemini API Key available:', !!GEMINI_API_KEY);
    console.log('genAI initialized:', !!genAI);

    if (!genAI) {
      return "⚠️ AI service temporarily unavailable. Please try again later.";
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-pro',
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.7,
        }
      });

      const chat = model.startChat({
        history: messages
          .filter(m => m.sender !== 'bot' || !m.text.includes('Hello! 👋'))
          .slice(-4) // Keep only last 4 messages
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
      });

      const fullPrompt = `${careerGuidancePrompt}\n\nUser's Message: "${userMessage}"\n\nProvide specific career guidance. Do not use generic responses.`;

      console.log('Sending to Gemini:', fullPrompt.substring(0, 200) + '...');

      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response.text();

      console.log('Gemini response:', response.substring(0, 200) + '...');

      // If response is too generic, provide fallback
      if (response.toLowerCase().includes('understand') ||
          response.toLowerCase().includes('got it') ||
          response.toLowerCase().includes('what would you like') ||
          response.length < 50) {
        return `As your career counselor, I'd like to help you specifically. Based on your interests in ${assessmentData?.interests.join(', ') || 'various fields'}, what career goals are you working towards? I can provide detailed guidance on skills, education, and next steps.`;
      }

      return response.trim();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm experiencing technical difficulties. As your career counselor, I recommend taking our assessment first to get personalized career recommendations, or tell me about your interests and I'll guide you through suitable career paths.";
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
