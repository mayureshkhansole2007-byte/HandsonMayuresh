import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import './Hero.css';

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <motion.section 
      className="hero"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1 
        className="hero-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Unlock Your Future with <span className="gradient-text">AI Precision</span>
      </motion.h1>
      
      <motion.p 
        className="hero-subtitle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Discover the perfect career path tailored to your unique skills, interests, and academic background.
      </motion.p>
      
      <motion.button 
        className="btn btn-primary btn-large"
        onClick={onStart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Get Started <FiArrowRight />
      </motion.button>
    </motion.section>
  );
}
