import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';
import './LoadingBrain.css';

const messages = [
  "Analyzing interests vectors...",
  "Cross-referencing global job markets...",
  "Evaluating skill intersections map...",
  "Matching academic profiles...",
  "Generating personalized trajectories..."
];

export default function LoadingBrain() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="loader-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="ai-brain-loader">
        <div className="pulse-ring"></div>
        <div className="pulse-ring delay"></div>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <FiCpu size={64} className="brain-icon" />
        </motion.div>
      </div>
      <h2 className="loader-text pulse-text">AI is synthesizing your profile...</h2>
      <p className="loader-subtext">{messages[msgIndex]}</p>
    </motion.div>
  );
}
