import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';
import './AssessmentForm.css';

export interface AssessmentState {
  interests: string[];
  skills: string[];
  educationLevel: string;
  academicStrength: string;
}

interface AssessmentFormProps {
  onComplete: (data: AssessmentState) => void;
}

const INTERESTS = ['Technology', 'Art & Design', 'Science & Math', 'Writing & Literature', 'Helping Others', 'Business & Finance', 'Building Things', 'Nature & Animals'];
const SKILLS = ['Coding/Programming', 'Public Speaking', 'Data Analysis', 'Creative Problem Solving', 'Leadership', 'Visual Design', 'Research', 'Organization'];

export default function AssessmentForm({ onComplete }: AssessmentFormProps) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<AssessmentState>({
    interests: [],
    skills: [],
    educationLevel: '',
    academicStrength: ''
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 2));
  const handlePrev = () => setStep(s => Math.max(s - 1, 0));

  const toggleArrayItem = (key: 'interests' | 'skills', value: string) => {
    setState(prev => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(state);
  };

  const progress = ((step + 1) / 3) * 100;

  const slideVariants = {
    initial: { x: 50, opacity: 0 },
    enter: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <motion.div 
      className="glass-panel form-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-header">
        <h2>Your Profile</h2>
        <p>Tell us a bit about yourself so our AI can find your ideal match.</p>
        <div className="progress-bar-container">
          <motion.div 
            className="progress-bar" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step1" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.4 }} className="form-step">
              <h3>What are your primary interests?</h3>
              <p className="step-desc">Select what you enjoy doing the most.</p>
              
              <div className="chip-group">
                {INTERESTS.map(i => (
                  <button 
                    key={i} 
                    type="button" 
                    className={`chip ${state.interests.includes(i) ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('interests', i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
              
              <div className="step-actions">
                <button type="button" className="btn btn-primary" onClick={handleNext}>Next Step</button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step2" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.4 }} className="form-step">
              <h3>What are your strongest skills?</h3>
              <p className="step-desc">Select the areas where you excel.</p>
              
              <div className="chip-group">
                {SKILLS.map(s => (
                  <button 
                    key={s} 
                    type="button" 
                    className={`chip ${state.skills.includes(s) ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('skills', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="step-actions">
                <button type="button" className="btn btn-outline" onClick={handlePrev}>Back</button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>Next Step</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step3" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.4 }} className="form-step">
              <h3>Tell us about your academic record</h3>
              <p className="step-desc">Choose the option that best describes your education style.</p>
              
              <div className="select-group">
                <label htmlFor="educationLevel">Current Education Level</label>
                <select 
                  id="educationLevel" 
                  className="form-select"
                  value={state.educationLevel}
                  onChange={e => setState({ ...state, educationLevel: e.target.value })}
                  required
                >
                  <option value="" disabled>Select level...</option>
                  <option value="high-school">High School</option>
                  <option value="undergraduate">Undergraduate Student</option>
                  <option value="graduate">Graduate Student</option>
                  <option value="bootcamp">Bootcamp/Self-Taught</option>
                </select>
              </div>

              <div className="select-group mt-medium">
                <label htmlFor="academicStrength">Strongest Subject</label>
                <select 
                  id="academicStrength" 
                  className="form-select"
                  value={state.academicStrength}
                  onChange={e => setState({ ...state, academicStrength: e.target.value })}
                  required
                >
                  <option value="" disabled>Select subject...</option>
                  <option value="stem">STEM (Science, Tech, Engineering, Math)</option>
                  <option value="humanities">Humanities & Arts</option>
                  <option value="business">Business & Economics</option>
                  <option value="social-sciences">Social Sciences</option>
                </select>
              </div>

              <div className="step-actions">
                <button type="button" className="btn btn-outline" onClick={handlePrev}>Back</button>
                <motion.button 
                  type="submit" 
                  className="btn btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Analyze with AI <FiCpu />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
