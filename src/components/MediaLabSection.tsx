import { motion } from 'framer-motion';
import { Clapperboard, Sparkles, Wand2 } from 'lucide-react';

const steps = [
  { icon: <Wand2 size={15} />, text: 'Upload a photo' },
  { icon: <Sparkles size={15} />, text: 'Describe the motion' },
  { icon: <Clapperboard size={15} />, text: 'Get a cinematic clip' },
];

export default function MediaLabSection() {
  return (
    <section id="media-lab" style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="glass-card"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(2rem, 5vw, 4rem)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <Clapperboard size={20} style={{ color: 'var(--accent-cyan)' }} />
          <span className="mono-text" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            INTERACTIVE LAB · GENERATIVE MEDIA
          </span>
        </div>

        <h2 className="display-text" style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          lineHeight: 1.15,
          marginBottom: '1rem',
        }}>
          <span style={{ color: '#f1f5f9' }}>Bring a still to</span>{' '}
          <span className="gradient-text">life</span>.
        </h2>

        <p className="mono-text" style={{
          color: '#94a3b8',
          maxWidth: '760px',
          marginBottom: '1.5rem',
        }}>
          Media Lab is a public playground for generative video: drop in a photo, describe
          the motion, and get a cinematic clip — rendered in the cloud, no signup, no
          watermark. It is the same photo-to-video pipeline I use to move my own stills.
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}>
          {steps.map((s, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                color: '#e2e8f0',
                fontSize: '0.8125rem',
              }}
            >
              <span style={{ color: 'var(--accent-cyan)' }}>{s.icon}</span>
              {s.text}
            </div>
          ))}
        </div>

        <a
          href="/medialab/"
          className="glass-card glass-card-hover"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.75rem',
            textDecoration: 'none',
            color: '#06281b',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'linear-gradient(135deg, var(--accent-turquoise), var(--accent-cyan))',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(6,182,212,0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          🎬 Open Media Lab →
        </a>
      </motion.div>
    </section>
  );
}
