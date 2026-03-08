import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import Hero from './components/Hero';
import TechnicalCore from './components/TechnicalCore';
import Lifestyle from './components/Lifestyle';
import InvestorGateway from './components/InvestorGateway';
import Navigation from './components/Navigation';
import './index.css';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="app">
      <FilmGrain />
      <Navigation />
      <main>
        <Hero />
        <TechnicalCore />
        <Lifestyle />
        <InvestorGateway />
      </main>
      <Footer />
    </div>
  );
}

// Film Grain Component
function FilmGrain() {
  return <div className="film-grain" aria-hidden="true" />;
}

// Footer Component
function Footer() {
  return (
    <footer className="glass-card" style={{
      margin: 'clamp(2rem, 4vw, 4rem)',
      padding: 'clamp(1.5rem, 3vw, 2.5rem)',
      textAlign: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="display-text" style={{ 
          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
          marginBottom: '0.5rem',
        }}>
          <span className="gradient-text">dizel0110</span>
        </p>
        <p className="mono-text" style={{ 
          color: '#94a3b8',
          fontSize: '0.75rem',
        }}>
          © 2026 · Architecting LLMs. Mastering the Wind.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          justifyContent: 'center',
          marginTop: '1.5rem',
        }}>
          <a 
            href="https://github.com/dizel0110" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mono-text"
            style={{ 
              color: '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            GitHub
          </a>
          <a 
            href="https://www.instagram.com/beachmonkeyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="mono-text"
            style={{ 
              color: '#64748b',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            Instagram
          </a>
          <a 
            href="https://linkedin.com/in/dizel0110"
            target="_blank"
            rel="noopener noreferrer"
            className="mono-text"
            style={{ 
              color: '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            LinkedIn
          </a>
          <a 
            href="https://t.me/dizel0110"
            target="_blank"
            rel="noopener noreferrer"
            className="mono-text"
            style={{ 
              color: '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            Telegram
          </a>
        </div>
      </motion.div>
    </footer>
  );
}

export default App;
