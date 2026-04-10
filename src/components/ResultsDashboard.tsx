import { motion } from 'framer-motion';
import { FiBookOpen, FiTrendingUp } from 'react-icons/fi';
import type { AssessmentState } from './AssessmentForm';
import './ResultsDashboard.css';

interface ResultsDashboardProps {
  data: AssessmentState;
  onRetake: () => void;
}

export default function ResultsDashboard({ data, onRetake }: ResultsDashboardProps) {
  // Simple mock AI logic
  const getCareers = () => {
    let careers = [];

    if (data.interests.includes('Technology') || data.skills.includes('Coding/Programming')) {
      careers.push({
        title: "Machine Learning Engineer",
        match: 98,
        desc: "Design and implement AI models, bridging the gap between data science and software engineering.",
        edu: "BS/MS in Computer Science or related STEM.",
        growth: "+40% (Much faster than average)"
      });
    }

    if (data.interests.includes('Art & Design') || data.skills.includes('Visual Design')) {
        careers.push({
            title: "UX/UI Designer",
            match: 94,
            desc: "Create intuitive, user-centric interfaces for digital products leveraging design psychology.",
            edu: "Bootcamp or Degree in Design/HCI.",
            growth: "+23% (Much faster than average)"
        });
    }
    
    if (data.interests.includes('Data Analysis') || data.skills.includes('Data Analysis') || data.academicStrength === 'stem') {
        careers.push({
            title: "Data Scientist",
            match: 91,
            desc: "Analyze complex datasets to extract actionable insights and inform business strategies.",
            edu: "MS in Data Science, Statistics, or CS.",
            growth: "+36% (Much faster than average)"
        });
    }

    if (careers.length === 0) {
        careers = [
            {
                title: "Product Manager",
                match: 88,
                desc: "Lead cross-functional teams to conceptualize, build, and launch successful products.",
                edu: "Varies, often Business or Tech background.",
                growth: "+10% (Faster than average)"
            },
            {
                title: "Digital Marketer",
                match: 85,
                desc: "Drive brand awareness and lead generation through dynamic digital channels.",
                edu: "Degree in Marketing, Communications or Certification.",
                growth: "+10% (Faster than average)"
            }
        ];
    }
    return careers.slice(0, 3);
  };

  const careers = getCareers();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <motion.section 
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="dashboard-header">
        <h2>Your <span className="gradient-text">Top Career Paths</span></h2>
        <p>Based on our AI analysis, here are the best fits for your unique profile.</p>
        <button className="btn btn-outline btn-small mt-small" onClick={onRetake}>Retake Assessment</button>
      </div>

      <motion.div 
        className="results-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {careers.map((career, i) => (
          <motion.div key={i} className="career-card" variants={cardVariants} whileHover={{ y: -10 }}>
            <div className="match-badge">{career.match}% Match</div>
            <h3 className="career-title">{career.title}</h3>
            <p className="career-desc">{career.desc}</p>
            
            <div className="detail-row">
              <div className="detail-icon"><FiBookOpen size={20} /></div>
              <div className="detail-content">
                  <strong>Required Education</strong>
                  <span>{career.edu}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><FiTrendingUp size={20} /></div>
              <div className="detail-content">
                  <strong>Job Growth (10 yr)</strong>
                  <span>{career.growth}</span>
              </div>
            </div>

            <div className="card-actions">
              <button className="btn btn-outline" style={{width: '100%'}}>Learn More Details</button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
