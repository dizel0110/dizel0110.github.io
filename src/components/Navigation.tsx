import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Work', href: '#technical-core' },
  { label: 'Lifestyle', href: '#lifestyle' },
  { label: 'Knowledge', href: '#knowledge-base' },
  { label: 'Investors', href: '#investors' },
  { label: 'Pitch Me', href: '#footer' },
];

export default function Navigation() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: 'clamp(1rem, 2vw, 1.5rem) clamp(1.5rem, 4vw, 3rem)',
        }}
      >
        <div className="glass-card" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          {/* Logo */}
          <a
            href="#"
            className="display-text"
            style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
              color: '#f1f5f9',
              textDecoration: 'none',
            }}
          >
            <span className="gradient-text">dizel</span>
            <span style={{ color: '#64748b' }}>0110</span>
          </a>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="mono-text"
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  fontSize: '0.8125rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-cyan)';
                  e.currentTarget.style.background = 'var(--glass-highlight)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#f1f5f9',
            }}
            className="mobile-menu-button"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 'clamp(4rem, 8vw, 5rem)',
              left: 'clamp(1rem, 2vw, 1.5rem)',
              right: 'clamp(1rem, 2vw, 1.5rem)',
              zIndex: 999,
            }}
          >
            <div className="glass-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="mono-text"
                  style={{
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    padding: '1rem',
                    borderRadius: '8px',
                    transition: 'all 0.3s',
                    fontSize: '0.9375rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--glass-highlight)';
                    e.currentTarget.style.color = 'var(--accent-cyan)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#e2e8f0';
                  }}
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
