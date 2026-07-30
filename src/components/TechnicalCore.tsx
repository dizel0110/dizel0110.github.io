import { motion } from 'framer-motion';
import { Code2, Cpu, Network, Database, Terminal, Github, ExternalLink } from 'lucide-react';

export default function TechnicalCore() {
  return (
    <section id="technical-core" style={{
      position: 'relative',
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
            color: 'var(--accent-cyan)',
            display: 'block',
            marginBottom: '0.75rem',
          }}>
            // TECHNICAL CORE
          </span>
          <h2 className="display-text" style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: '#f1f5f9',
          }}>
            Beyond Data — <span className="gradient-text">AI Architecture</span>
          </h2>
        </motion.div>

        {/* Bento Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'auto auto auto',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
        }}>
          {/* AI Prophet Golden Card - Large */}
          <AIProphetCard />
          
          {/* Expertise Modules - Side Column */}
          <ExpertiseModules />
          
          {/* GitHub Pulse - Full Width Bottom */}
          <GitHubPulse />
        </div>
      </div>

      {/* Achievements */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--glass-border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          <span className="mono-text" style={{ fontSize: '0.6875rem', color: '#64748b' }}>
            ACHIEVEMENTS
          </span>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          {[
            { label: '📄 SSPP 2026 Paper Submitted', href: 'https://github.com/dizel0110/Text-HRM-RAG' },
            { label: '🏆 YSDA Security — 300/300', href: 'https://contest.yandex.com/contest/95444/' },
            { label: '📊 Kaggle VibeCoding Capstone', href: 'https://www.kaggle.com/competitions/vibecoding-agents-capstone-project/writeups/ai-prophet-multi-agent-massage-therapy-consultan' },
            { label: '⚡ GitHub Quickdraw', href: 'https://github.com/dizel0110?tab=achievements' },
            { label: '❄️ Arctic Code Vault', href: 'https://github.com/dizel0110?tab=achievements' },
          ].map((badge) => (
            <a
              key={badge.label}
              href={badge.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-text"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.6875rem',
                color: '#94a3b8',
                border: '1px solid var(--glass-border)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                e.currentTarget.style.color = 'var(--accent-cyan)';
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {badge.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIProphetCard() {
  const codeSnippet = `async def generate_response(
    message: str,
    photo: PhotoSize = None,
    voice: Voice = None
) -> AIResponse:
    """Multimodal agent with Fallback Engine."""
    # Adaptive Context: Time-aware + user mood
    context = build_context(user_id, time_of_day)
    
    # Vision: Analyze image if provided
    if photo:
        vision_result = await gemini_vision.analyze(photo)
        context.append(vision_result)
    
    # Audio: Transcribe voice via Whisper
    if voice:
        transcript = await whisper.transcribe(voice.file_id)
        message = transcript.text
    
    # Fallback: Google → HuggingFace
    response = await fallback_engine.generate(
        message, context,
        primary="gemini-2.5-flash",
        fallbacks=["qwen-2.5", "llama-3.1"]
    )
    return response`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="glass-card glass-card-hover ai-prophet-card"
      style={{
        gridColumn: 'span 8',
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Golden Accent Border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fbbf24, transparent)',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {/* Header */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Cpu size={20} style={{ color: '#020617' }} />
            </div>
            <div>
              <h3 className="display-text" style={{
                fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                color: '#f1f5f9',
              }}>
                AI Prophet 🔮
              </h3>
              <p className="mono-text" style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}>
                Multimodal AI Agent · Telegram Mini App
              </p>
            </div>
          </div>
          <p style={{
            color: '#cbd5e1',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            maxWidth: '600px',
          }}>
            Next-generation multimodal AI agent with a three-level fallback system. 
            Unifies <strong>text, images, and voice</strong> in a single Telegram interface. 
            Automatic switching between Google Gemini and HuggingFace (Qwen/Llama) 
            guarantees 99.9% uptime.
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          {['Python', 'Aiogram 3.x', 'Gemini 2.5', 'Whisper', 'HuggingFace', 'Docker', 'CI/CD'].map((tech) => (
            <span
              key={tech}
              className="glass-card"
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                color: '#e2e8f0',
                border: '1px solid var(--glass-border)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Live Code Snippet */}
        <div className="glass-card" style={{
          background: 'rgba(2, 6, 23, 0.8)',
          border: '1px solid rgba(64, 224, 208, 0.1)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid rgba(64, 224, 208, 0.1)',
          }}>
            <Terminal size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span className="mono-text" style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              core/fallback_engine.py
            </span>
          </div>
          <pre style={{
            padding: '1rem',
            overflow: 'auto',
            fontSize: '0.75rem',
            lineHeight: 1.7,
          }}>
            <code className="mono-text" style={{
              color: '#a5b4fc',
            }}>
              {codeSnippet}
            </code>
          </pre>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginTop: '1rem',
        }}>
          {[
            { icon: '🧠', label: 'Adaptive Context' },
            { icon: '👁', label: 'Vision Analysis' },
            { icon: '🎤', label: 'Voice Messages' },
            { icon: '🔄', label: 'Fallback Engine' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="glass-card"
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: '#e2e8f0',
              }}
            >
              <span style={{ display: 'block', marginBottom: '0.25rem' }}>{feature.icon}</span>
              {feature.label}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ExpertiseModules() {
  const modules = [
    {
      icon: Network,
      title: 'LLM Fine-tuning',
      description: 'Custom LLM adaptation with LoRA/QLoRA. AI Prophet uses Gemini 2.5 + HuggingFace fallback (Qwen/Llama).',
      color: '#40e0d0',
      repo: 'ai_prophet',
    },
    {
      icon: Code2,
      title: 'Computer Vision',
      description: 'VLM systems + image processing. ITMO MedTech: FastAPI + rembg background removal + Telegram bot.',
      color: '#06b6d4',
      repo: 'ITMO',
    },
    {
      icon: Database,
      title: 'Scalable ML Ops',
      description: 'Production pipelines: NEWS-RECOMMENDER (MLflow, DVC, Ray, Docker CI/CD). HARDML MLOps module.',
      color: '#2dd4bf',
      repo: 'NEWS-RECOMMENDER',
    },
  ];

  return (
    <div style={{
      gridColumn: 'span 4',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(1rem, 2vw, 1.5rem)',
    }} className="expertise-modules"
    >
      {modules.map((module, index) => (
        <motion.a
          key={module.title}
          href={`https://github.com/dizel0110/${module.repo}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass-card glass-card-hover"
          style={{
            flex: 1,
            padding: 'clamp(1.25rem, 2vw, 1.75rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textDecoration: 'none',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${module.color}22, ${module.color}11)`,
              border: `1px solid ${module.color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <module.icon size={18} style={{ color: module.color }} />
            </div>
            <ExternalLink size={14} style={{ color: '#64748b' }} />
          </div>
          <h4 className="display-text" style={{
            fontSize: '1rem',
            color: '#f1f5f9',
          }}>
            {module.title}
          </h4>
          <p className="mono-text" style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            lineHeight: 1.6,
          }}>
            {module.description}
          </p>
        </motion.a>
      ))}
    </div>
  );
}

function GitHubPulse() {
  // Simulated contribution data
  const weeks = 52;
  const days = 7;
  
  const generateHeat = () => {
    const rand = Math.random();
    if (rand > 0.95) return '#40e0d0';
    if (rand > 0.85) return '#2dd4bf';
    if (rand > 0.7) return '#06b6d4';
    if (rand > 0.5) return '#0891b2';
    return 'rgba(6, 182, 212, 0.15)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-card"
      style={{
        gridColumn: 'span 12',
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Github size={20} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <h4 className="display-text" style={{
              fontSize: '1.125rem',
              color: '#f1f5f9',
            }}>
              Development Activity
            </h4>
            <p className="mono-text" style={{
              fontSize: '0.75rem',
              color: '#64748b',
            }}>
              github.com/dizel0110
            </p>
          </div>
        </div>
        <a
          href="https://github.com/dizel0110"
          target="_blank"
          rel="noopener noreferrer"
          className="mono-text"
          style={{
            color: 'var(--accent-cyan)',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--glass-highlight)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          View Profile →
        </a>
      </div>

      {/* Contribution Graph */}
      <div style={{
        display: 'flex',
        gap: '4px',
        overflow: 'auto',
        paddingBottom: '0.5rem',
      }}>
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div
            key={weekIndex}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            {Array.from({ length: days }).map((_, dayIndex) => (
              <div
                key={dayIndex}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: generateHeat(),
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '1rem',
        justifyContent: 'flex-end',
      }}>
        <span className="mono-text" style={{ fontSize: '0.6875rem', color: '#64748b' }}>
          Less
        </span>
        {[0.15, 0.5, 0.7, 0.85, 0.95].map((level, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              background: level < 0.3 
                ? 'rgba(6, 182, 212, 0.15)' 
                : level < 0.6 
                  ? '#0891b2' 
                  : level < 0.8 
                    ? '#06b6d4' 
                    : level < 0.95 
                      ? '#2dd4bf' 
                      : '#40e0d0',
            }}
          />
        ))}
        <span className="mono-text" style={{ fontSize: '0.6875rem', color: '#64748b' }}>
          More
        </span>
      </div>
    </motion.div>
  );
}
