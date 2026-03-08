import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { ArrowRight, Mail, Linkedin, Zap, Calculator, TrendingUp, Users, Clock } from 'lucide-react';

export default function InvestorGateway() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="investors" style={{
      position: 'relative',
    }}>
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ 
            marginBottom: 'clamp(3rem, 5vw, 5rem)',
            textAlign: 'center',
            maxWidth: 'clamp(280px, 80vw, 700px)',
            margin: '0 auto clamp(3rem, 5vw, 5rem)',
          }}
        >
          <span className="mono-text" style={{ 
            color: 'var(--accent-turquoise)',
            display: 'block',
            marginBottom: '0.75rem',
          }}>
            // INVESTOR GATEWAY
          </span>
          <h2 className="display-text" style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: '#f1f5f9',
            marginBottom: '1.5rem',
          }}>
            Scaling <span className="gradient-text">Beyond Code</span>
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: 'clamp(0.9375rem, 1.5vw, 1.125rem)',
            lineHeight: 1.8,
          }}>
            Building AI systems with global impact. Focused on agentic ROI, 
            scalable architecture, and engineering leadership that drives 
            measurable business outcomes.
          </p>
        </motion.div>

        {/* Interactive ROI Calculator */}
        <ROICalculator />

        {/* Value Propositions - Asymmetric Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          marginBottom: 'clamp(3rem, 5vw, 5rem)',
        }}>
          <ValueCard
            index={0}
            title="Agentic ROI"
            description="AI agents that don't just respond — they execute. Measurable productivity gains through autonomous task completion and multi-step reasoning."
            metric="10x"
            metricLabel="Efficiency Gain"
            gridColumn="span 4"
          />
          <ValueCard
            index={1}
            title="Global Scalability"
            description="Architecture designed for worldwide deployment. Multi-region, multi-language, multi-tenant systems built from day one."
            metric="99.9%"
            metricLabel="Uptime Target"
            gridColumn="span 4"
          />
          <ValueCard
            index={2}
            title="Engineering Leadership"
            description="Technical founder with deep ML expertise. Track record of shipping production AI systems and leading high-performance teams."
            metric="5+"
            metricLabel="Years Experience"
            gridColumn="span 4"
          />
        </div>

        {/* Magnetic CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <MagneticButton onClick={() => setIsOpen(true)} />
        </motion.div>
      </div>

      {/* Contact Overlay */}
      <AnimatePresence>
        {isOpen && <ContactOverlay onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}

function ROICalculator() {
  const [employees, setEmployees] = useState(10);
  const [hoursSaved, setHoursSaved] = useState(15); // hours per week per employee
  const [hourlyRate, setHourlyRate] = useState(50); // $ per hour

  const weeklySavings = employees * hoursSaved * hourlyRate;
  const monthlySavings = weeklySavings * 4;
  const yearlySavings = monthlySavings * 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-card"
      style={{
        marginBottom: 'clamp(3rem, 5vw, 5rem)',
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        <Calculator size={24} style={{ color: 'var(--accent-cyan)' }} />
        <h3 className="display-text" style={{
          fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
          color: '#f1f5f9',
        }}>
          Agentic ROI Calculator
        </h3>
      </div>

      <p style={{
        color: '#cbd5e1',
        fontSize: '0.9375rem',
        lineHeight: 1.7,
        marginBottom: '2rem',
      }}>
        Estimate how much time and money AI agents can save your team. 
        Based on automating routine tasks: research, data analysis, report generation, and customer support.
      </p>

      {/* Sliders */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <Users size={16} style={{ color: 'var(--accent-cyan)' }} />
            <label className="mono-text" style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
              Team Size (employees)
            </label>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={employees}
            onChange={(e) => setEmployees(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent-cyan)',
            }}
          />
          <div className="mono-text" style={{ 
            textAlign: 'right', 
            color: 'var(--accent-cyan)',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
          }}>
            {employees} employees
          </div>
        </div>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
            <label className="mono-text" style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
              Hours Saved/Week per Person
            </label>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            value={hoursSaved}
            onChange={(e) => setHoursSaved(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent-cyan)',
            }}
          />
          <div className="mono-text" style={{ 
            textAlign: 'right', 
            color: 'var(--accent-cyan)',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
          }}>
            {hoursSaved} hours/week
          </div>
        </div>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
            <label className="mono-text" style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
              Avg. Hourly Rate ($)
            </label>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent-cyan)',
            }}
          />
          <div className="mono-text" style={{ 
            textAlign: 'right', 
            color: 'var(--accent-cyan)',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
          }}>
            ${hourlyRate}/hour
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="glass-card" style={{
        background: 'rgba(6, 182, 212, 0.1)',
        border: '1px solid var(--accent-cyan)',
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
        borderRadius: '16px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
        }}>
          <div>
            <p className="mono-text" style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
              Weekly Savings
            </p>
            <p className="display-text" style={{ 
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: 'var(--accent-turquoise)',
            }}>
              ${weeklySavings.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="mono-text" style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
              Monthly Savings
            </p>
            <p className="display-text" style={{ 
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: 'var(--accent-cyan)',
            }}>
              ${monthlySavings.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="mono-text" style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
              Yearly Savings
            </p>
            <p className="display-text" style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              background: 'var(--gradient-sea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              ${yearlySavings.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <p className="mono-text" style={{
        color: '#64748b',
        fontSize: '0.75rem',
        marginTop: '1.5rem',
        textAlign: 'center',
      }}>
        * Estimates based on typical AI agent productivity gains. Actual results may vary.
      </p>
    </motion.div>
  );
}

interface ValueCardProps {
  index: number;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  gridColumn: string;
}

function ValueCard({ index, title, description, metric, metricLabel, gridColumn }: ValueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="glass-card glass-card-hover value-card"
      style={{
        gridColumn,
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        <h3 className="display-text" style={{
          fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
          color: '#f1f5f9',
          marginBottom: '0.75rem',
        }}>
          {title}
        </h3>
        <p style={{
          color: '#cbd5e1',
          fontSize: '0.9375rem',
          lineHeight: 1.7,
          marginBottom: 'auto',
        }}>
          {description}
        </p>
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--glass-border)',
        }}>
          <p className="display-text metric-text" style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            marginBottom: '0.25rem',
          }}>
            {metric}
          </p>
          <p className="mono-text" style={{
            fontSize: '0.75rem',
            color: '#64748b',
          }}>
            {metricLabel}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function MagneticButton({ onClick }: { onClick: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x,
        y,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: 'clamp(1rem, 2vw, 1.25rem) clamp(2rem, 3vw, 3rem)',
        border: '1px solid var(--accent-cyan)',
        background: 'rgba(6, 182, 212, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className="glass-card"
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="display-text" style={{
        fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
        color: '#f1f5f9',
      }}>
        Pitch to Me
      </span>
      <motion.div
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
      >
        <ArrowRight size={20} style={{ color: 'var(--accent-cyan)' }} />
      </motion.div>
    </motion.button>
  );
}

function ContactOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const contactLinks = [
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:dizel0110@gmail.com',
      value: 'dizel0110@gmail.com',
      color: '#40e0d0',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/dizel0110',
      value: 'linkedin.com/in/dizel0110',
      color: '#06b6d4',
    },
    {
      icon: Zap,
      label: 'Telegram',
      href: 'https://t.me/dizel0110',
      value: '@dizel0110',
      color: '#2dd4bf',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="contact-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card"
        style={{
          padding: 'clamp(2rem, 4vw, 4rem)',
          maxWidth: 'clamp(280px, 90vw, 500px)',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 className="display-text" style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: '#f1f5f9',
            marginBottom: '0.75rem',
          }}>
            Let's Build the <span className="gradient-text">Future</span>
          </h3>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}>
            Interested in partnering or investing? Reach out to discuss 
            agentic AI opportunities and engineering leadership.
          </p>

          {/* Contact Links */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card glass-card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${link.color}22, ${link.color}11)`,
                  border: `1px solid ${link.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <link.icon size={18} style={{ color: link.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="mono-text" style={{
                    fontSize: '0.6875rem',
                    color: '#64748b',
                    marginBottom: '0.125rem',
                  }}>
                    {link.label}
                  </p>
                  <p style={{
                    color: '#e2e8f0',
                    fontSize: '0.9375rem',
                  }}>
                    {link.value}
                  </p>
                </div>
                <ArrowRight size={16} style={{ color: '#64748b' }} />
              </a>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mono-text"
            style={{
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              color: '#94a3b8',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '0.8125rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
