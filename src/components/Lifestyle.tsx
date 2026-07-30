import { motion, useScroll, useTransform } from 'framer-motion';
import { Dumbbell, Wind, Heart, TrendingUp, Instagram, Facebook, ExternalLink } from 'lucide-react';
import { useRef } from 'react';

export default function Lifestyle() {
  return (
    <section id="lifestyle" style={{
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 'clamp(3rem, 5vw, 5rem)' }}
        >
          <span className="mono-text" style={{ 
            color: 'var(--accent-seafoam)',
            display: 'block',
            marginBottom: '0.75rem',
          }}>
            // LIFESTYLE
          </span>
          <h2 className="display-text" style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: '#f1f5f9',
          }}>
            The Discipline of <span className="gradient-text">Flow</span>
          </h2>
        </motion.div>

        {/* Non-linear Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridAutoRows: 'minmax(200px, auto)',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
        }}>
          {/* VEnt Gym Card */}
          <VEntGymCard />
          
          {/* PlayKite Card - Larger, Immersive */}
          <PlayKiteCard />
          
          {/* Quote Card */}
          <QuoteCard />
        </div>
      </div>
    </section>
  );
}

function VEntGymCard() {
  // Simulated workout data
  const workoutData = [65, 72, 68, 75, 82, 78, 85, 88, 82, 90, 87, 92];
  const maxVal = Math.max(...workoutData);
  
  const points = workoutData.map((val, i) => {
    const x = (i / (workoutData.length - 1)) * 100;
    const y = 100 - (val / maxVal) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="glass-card"
      style={{
        gridColumn: 'span 5',
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Dumbbell size={22} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h3 className="display-text" style={{
                fontSize: '1.25rem',
                color: '#f1f5f9',
              }}>
                VEnt
              </h3>
              <p className="mono-text" style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}>
                @ventelgouna · El Gouna
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <a href="https://www.instagram.com/ventelgouna/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'inherit' }}>
              <Instagram size={18} style={{ color: '#ef4444' }} />
            </a>
            <a href="https://www.facebook.com/ventelgouna/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'inherit' }}>
              <Facebook size={18} style={{ color: '#ef4444' }} />
            </a>
            <Heart size={20} style={{ color: '#ef4444', fill: '#ef444422' }} />
          </div>
        </div>

        <p style={{
          color: '#cbd5e1',
          fontSize: '0.9375rem',
          lineHeight: 1.7,
          marginBottom: '1.5rem',
        }}>
          Physical resilience is the foundation of mental clarity. 
          Every session builds the grit needed for startup challenges.
        </p>
      </div>

      {/* Pulse Chart */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          <TrendingUp size={14} style={{ color: '#ef4444' }} />
          <span className="mono-text" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Physical Resilience Index
          </span>
        </div>
        
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            width: '100%',
            height: '80px',
          }}
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="workoutGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#workoutGradient)"
          />
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data Points */}
          {workoutData.map((val, i) => {
            const x = (i / (workoutData.length - 1)) * 100;
            const y = 100 - (val / maxVal) * 80;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="#020617"
                stroke="#ef4444"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.75rem',
        }}>
          <span className="mono-text" style={{ fontSize: '0.6875rem', color: '#64748b' }}>
            Week 1
          </span>
          <span className="mono-text" style={{ fontSize: '0.6875rem', color: '#64748b' }}>
            Week 12
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PlayKiteCard() {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.8]);

  return (
    <motion.a
      ref={containerRef}
      href="https://www.playkite.com/"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="glass-card glass-card-hover"
      style={{
        gridColumn: 'span 7',
        gridRow: 'span 2',
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'clamp(350px, 50vh, 500px)',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
      }}
    >
      {/* Animated Background - Water/Wind Effect */}
      <motion.div
        style={{ y: parallaxY, opacity }}
        className="kite-background"
      />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(64, 224, 208, 0.15))',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Wind size={24} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div>
              <h3 className="display-text" style={{
                fontSize: '1.5rem',
                color: '#f1f5f9',
              }}>
                PlayKite Watersports
              </h3>
              <p className="mono-text" style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}>
                El Gouna, Red Sea · playkite.com
              </p>
            </div>
          </div>
          <ExternalLink size={20} style={{ color: 'var(--accent-cyan)' }} />
        </div>

        {/* Keywords */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}>
          {['Analyzing Wind Vectors', 'Extreme Focus', 'Mastering Elements', 'Flow State'].map((keyword) => (
            <span
              key={keyword}
              className="glass-card"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8125rem',
                color: '#e2e8f0',
                border: '1px solid var(--glass-border)',
                background: 'rgba(6, 182, 212, 0.1)',
              }}
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Main Description */}
        <p style={{
          color: '#cbd5e1',
          fontSize: '1rem',
          lineHeight: 1.8,
          marginBottom: 'auto',
        }}>
          The Red Sea's 270+ windy days provide the perfect laboratory for 
          mastering kite dynamics. Reading wind patterns, calculating vectors, 
          and maintaining absolute focus — these skills directly translate to 
          navigating the complexities of AI architecture and startup leadership.
        </p>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--glass-border)',
        }}>
          {[
            { value: '270+', label: 'Windy Days/Year' },
            { value: '40+', label: 'Sessions/Season' },
            { value: '∞', label: 'Flow States' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="display-text" style={{
                fontSize: '1.5rem',
                color: 'var(--accent-cyan)',
                marginBottom: '0.25rem',
              }}>
                {stat.value}
              </p>
              <p className="mono-text" style={{
                fontSize: '0.6875rem',
                color: '#64748b',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(64, 224, 208, 0.3) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '5%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
        filter: 'blur(30px)',
      }} />
    </motion.a>
  );
}

function QuoteCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-card"
      style={{
        gridColumn: 'span 12',
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 'clamp(280px, 70vw, 700px)' }}>
        <Wind size={28} style={{ 
          color: 'var(--accent-turquoise)', 
          margin: '0 auto 1rem',
          display: 'block',
        }} />
        <blockquote className="display-text" style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          color: '#f1f5f9',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
        }}>
          "Training LLMs is like mastering the wind. Both require understanding 
          invisible forces, predicting patterns, and adapting in real-time. 
          270+ windy days in El Gouna taught me what no GPU cluster can: 
          <span className="gradient-text"> true intelligence flows with the chaos</span>."
        </blockquote>
        <cite className="mono-text" style={{
          color: '#64748b',
          fontSize: '0.8125rem',
          fontStyle: 'normal',
          display: 'block',
        }}>
          — dizel0110 · LLM Engineer & Kite Rider
        </cite>
      </div>
    </motion.div>
  );
}
