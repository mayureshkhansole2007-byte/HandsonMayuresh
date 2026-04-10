import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import AssessmentForm from './components/AssessmentForm';
import type { AssessmentState } from './components/AssessmentForm';
import LoadingBrain from './components/LoadingBrain';
import ResultsDashboard from './components/ResultsDashboard';
import ChatBot from './components/ChatBot';

export type Phase = 'landing' | 'assessment' | 'loading' | 'results';

function App() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [assessmentData, setAssessmentData] = useState<AssessmentState | null>(null);

  const startAssessment = () => setPhase('assessment');
  
  const handleAssessmentComplete = (data: AssessmentState) => {
    setAssessmentData(data);
    setPhase('loading');
    
    // Simulate AI loading process
    setTimeout(() => {
      setPhase('results');
    }, 4500);
  };

  const handleRetake = () => {
    setAssessmentData(null);
    setPhase('assessment');
  };

  return (
    <>
      <Header onStart={startAssessment} currentPhase={phase} />
      
      <main className="main-container">
        <AnimatePresence mode="wait">
          {phase === 'landing' && <Hero key="landing" onStart={startAssessment} />}
          {phase === 'assessment' && <AssessmentForm key="assessment" onComplete={handleAssessmentComplete} />}
          {phase === 'loading' && <LoadingBrain key="loading" />}
          {phase === 'results' && assessmentData && (
            <ResultsDashboard key="results" data={assessmentData} onRetake={handleRetake} />
          )}
        </AnimatePresence>
      </main>

      <ChatBot assessmentData={assessmentData} currentPhase={phase} />
    </>
  );
}

export default App;
