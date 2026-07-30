import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Concept {
  id: number;
  tag: string;
  concept: string;
  description: string;
  details: string;
}

interface KnowledgeData {
  knowledge_base: Concept[];
}

const tagMeta: Record<string, { color: string; order: number }> = {
  About: { color: '#40e0d0', order: 0 },
  Skills: { color: '#06b6d4', order: 1 },
  Project: { color: '#2dd4bf', order: 2 },
  Education: { color: '#fbbf24', order: 3 },
  Contact: { color: '#a78bfa', order: 4 },
  Philosophy: { color: '#f472b6', order: 5 },
  Availability: { color: '#34d399', order: 6 },
  Languages: { color: '#38bdf8', order: 7 },
};

export default function KnowledgeBase() {
  const [data, setData] = useState<KnowledgeData | null>(null);
  const [activeTag, setActiveTag] = useState('all');

  useEffect(() => {
    fetch('/data/about_dmitry.json')
      .then(res => res.json())
      .then((json: KnowledgeData) => setData(json))
      .catch(err => console.error('Failed to load knowledge base:', err));
  }, []);

  if (!data) return null;

  const tags = ['all', ...new Set(data.knowledge_base.map(item => item.tag))];
  const filtered = activeTag === 'all'
    ? data.knowledge_base
    : data.knowledge_base.filter(item => item.tag === activeTag);

  return (
    <section id="knowledge-base" style={{ position: 'relative' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 'clamp(3rem, 5vw, 5rem)' }}
        >
          <span className="mono-text" style={{
            color: 'var(--accent-turquoise)',
            display: 'block',
            marginBottom: '0.75rem',
          }}>
            // KNOWLEDGE BASE
          </span>
          <h2 className="display-text" style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: '#f1f5f9',
          }}>
            24 Concepts of <span className="gradient-text">Dmitry</span>
          </h2>
        </motion.div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}>
          {tags.map(tag => {
            const meta = tagMeta[tag];
            const isActive = activeTag === tag;
            const color = meta?.color || 'var(--accent-cyan)';
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className="mono-text"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: `1px solid ${isActive ? color : 'var(--glass-border)'}`,
                  background: isActive ? `${color}22` : 'transparent',
                  color: isActive ? color : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.75rem',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.color = color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                {tag === 'all' ? '✨ All' : tag}
              </button>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
        }}>
          {filtered.map((item, index) => {
            const meta = tagMeta[item.tag];
            const color = meta?.color || 'var(--accent-cyan)';
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
                className="glass-card glass-card-hover"
                style={{
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                }} />

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.625rem',
                  background: `${color}15`,
                  color: color,
                  marginBottom: '0.75rem',
                }}>
                  {item.tag}
                </div>

                <h4 className="display-text" style={{
                  fontSize: '1rem',
                  color: '#f1f5f9',
                  marginBottom: '0.5rem',
                }}>
                  {item.concept}
                </h4>

                <p className="mono-text" style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  lineHeight: 1.6,
                }}>
                  {item.description}
                </p>

                <details style={{ marginTop: '0.75rem' }}>
                  <summary className="mono-text" style={{
                    fontSize: '0.6875rem',
                    color: color,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}>
                    More →
                  </summary>
                  <p className="mono-text" style={{
                    fontSize: '0.7rem',
                    color: '#64748b',
                    lineHeight: 1.6,
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--glass-border)',
                  }}>
                    {item.details}
                  </p>
                </details>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
