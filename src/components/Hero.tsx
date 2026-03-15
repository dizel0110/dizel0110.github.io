import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowDown, Wind } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for organic movement
  const springConfig = { damping: 25, stiffness: 150, mass: 1 };
  
  const parallaxX = useSpring(useTransform(mouseX, [0, 1], [-30, 30]), springConfig);
  const parallaxY = useSpring(useTransform(mouseY, [0, 1], [-20, 20]), springConfig);
  
  const parallaxX2 = useSpring(useTransform(mouseX, [0, 1], [20, -20]), springConfig);
  const parallaxY2 = useSpring(useTransform(mouseY, [0, 1], [15, -15]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section
      id="hero"
      ref={containerRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(2rem, 4vw, 4rem) 0',
      }}
    >
      {/* Animated Background Elements - Kite Motion */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}>
        {/* Flow Line 1 */}
        <motion.div
          style={{
            x: parallaxX,
            y: parallaxY,
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: 'clamp(100px, 20vw, 200px)',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--accent-turquoise), transparent)',
            borderRadius: '2px',
          }}
        />
        
        {/* Flow Line 2 */}
        <motion.div
          style={{
            x: parallaxX2,
            y: parallaxY2,
            position: 'absolute',
            bottom: '25%',
            right: '15%',
            width: 'clamp(150px, 25vw, 300px)',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
            borderRadius: '2px',
          }}
        />

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: `${20 + i * 15}%`,
              left: `${15 + i * 12}%`,
              width: '4px',
              height: '4px',
              background: `linear-gradient(135deg, var(--accent-turquoise), var(--accent-cyan))`,
              borderRadius: '50%',
              opacity: 0.3 + (i % 3) * 0.2,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        maxWidth: 'clamp(280px, 90vw, 900px)',
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontSize: '0.75rem',
          }}
        >
          <Wind size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span className="mono-text" style={{ color: '#94a3b8' }}>
            270+ Windy Days / El Gouna
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="display-text"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            lineHeight: 1.1,
            marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
            fontWeight: 600,
          }}
        >
          <span style={{ color: '#f1f5f9' }}>Architecting</span>{' '}
          <span className="gradient-text">LLMs</span>.{' '}
          <span style={{ color: '#f1f5f9' }}>Mastering the</span>{' '}
          <span className="gradient-text">Wind</span>.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mono-text"
          style={{
            fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
            color: '#94a3b8',
            lineHeight: 1.8,
            maxWidth: 'clamp(280px, 80vw, 650px)',
            margin: '0 auto clamp(2rem, 4vw, 3rem)',
          }}
        >
          LLM & ML Engineer building the next generation of Agentic AI.
          <br />
          Driven by the 270+ windy days of El Gouna.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="#technical-core"
            className="glass-card glass-card-hover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.75rem',
              textDecoration: 'none',
              color: '#f1f5f9',
              fontSize: '0.875rem',
              transition: 'all 0.3s',
            }}
          >
            Explore Work
            <ArrowDown size={16} />
          </a>
          <a
            href="https://github.com/dizel0110"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card glass-card-hover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.75rem',
              textDecoration: 'none',
              color: '#f1f5f9',
              fontSize: '0.875rem',
              transition: 'all 0.3s',
            }}
          >
            GitHub →
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{
          position: 'absolute',
          bottom: 'clamp(2rem, 4vw, 4rem)',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: '#64748b' }}
        >
          <ArrowDown size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
}
