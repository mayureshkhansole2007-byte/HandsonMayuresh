import { FiCompass } from 'react-icons/fi';
import './Header.css';

interface HeaderProps {
  onStart: () => void;
  currentPhase: string;
}

export default function Header({ onStart, currentPhase }: HeaderProps) {
  return (
    <header className="navbar">
      <div className="logo">
        <FiCompass size={24} style={{ color: 'var(--primary)' }} />
        <span>CareerCompass AI</span>
      </div>
      <nav>
        <a href="#" className="nav-link" onClick={() => currentPhase !== 'landing' && window.location.reload()}>Home</a>
        <a href="#" className="nav-link">How it Works</a>
        {currentPhase === 'landing' && (
          <button className="btn btn-outline nav-btn" onClick={onStart}>
            Start Assessment
          </button>
        )}
      </nav>
    </header>
  );
}
