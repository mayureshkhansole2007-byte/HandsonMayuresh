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

  const careerGuidancePrompt = `You are a smart and friendly voice-based career guidance assistant.

Your goal is to help students and users choose the right career path based on their interests, skills, and education.

Voice Behavior:
- Speak in a natural, conversational tone (like a real human assistant)
- Keep responses short, clear, and easy to understand
- Avoid long paragraphs
- Use simple words and examples
- Ask one or two questions at a time (not too many)

Conversation Flow:
1. Start by greeting the user politely
2. Ask about: education level, interests (subjects or activities they enjoy), skills or strengths
3. Based on answers: suggest 2-4 suitable career options, explain each in simple terms, recommend skills to learn, suggest next steps

Rules:
- If user is confused, guide them step-by-step
- If user gives less information, ask follow-up questions
- Never give vague answers like "do what you like"
- Always give practical and actionable advice
- Be supportive and motivating but realistic

Voice Style:
- Friendly and slightly enthusiastic
- Use phrases like: "That's interesting!", "Let me help you with that", "Based on what you said..."

${assessmentData ? `USER ASSESSMENT DATA:
- Interests: ${assessmentData.interests.join(', ')}
- Skills: ${assessmentData.skills.join(', ')}
- Education: ${assessmentData.educationLevel}
- Academic Strength: ${assessmentData.academicStrength}

Use this data to personalize your advice.` : 'No assessment data yet - focus on gathering information.'}

Current App Phase: ${currentPhase}

Respond conversationally, like you're speaking to the user. Keep it short and engaging.`;

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    console.log('Gemini API Key available:', !!GEMINI_API_KEY);
    console.log('genAI initialized:', !!genAI);

    if (!genAI) {
      return "⚠️ AI service temporarily unavailable. Please try again later.";
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash', // Updated to more recent and reliable model
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

      // Format response with simple markdown support
      const formattedResponse = response
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/\n/g, '<br>'); // Line breaks

      // If response is too generic or not career-focused, provide fallback
      if (formattedResponse.toLowerCase().includes('i understand') ||
          formattedResponse.toLowerCase().includes('got it') ||
          formattedResponse.toLowerCase().includes('what would you like') ||
          formattedResponse.length < 30 ||
          !formattedResponse.toLowerCase().includes('career') && !formattedResponse.toLowerCase().includes('skill') &&
          !formattedResponse.toLowerCase().includes('education') && !formattedResponse.toLowerCase().includes('interest') &&
          !formattedResponse.includes('?')) {
        const fallbacks = [
          `That's interesting! Based on your interests in ${assessmentData?.interests.slice(0, 2).join(' and ') || 'various fields'}, have you thought about what education level you're aiming for? That helps me suggest the best career paths.`,
          `Great to hear! What skills do you enjoy using most? For example, are you good at problem-solving, creative work, or helping others? This will help me recommend suitable careers.`,
          `I love helping with career choices! Tell me about your interests - do you prefer working with technology, people, data, or creative projects? That gives me a great starting point.`,
          `Awesome! What's your current education level or what are you planning to study? This helps me suggest careers that match your background and goals.`
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      return formattedResponse;
    } catch (error) {
      console.error('Gemini API error:', error);
      return "Oops, I'm having a little technical hiccup! 😅 Let's try again. What interests you most - technology, creative work, helping others, or something else?";
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
