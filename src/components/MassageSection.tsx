import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { HeartPulse, Instagram, MessageCircle, Youtube, Send } from 'lucide-react';

const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/massage.zeleninas/', icon: 'fb' },
  { label: 'Instagram', href: 'https://www.instagram.com/massage_zeleninas/', icon: 'ig' },
  { label: 'YouTube', href: 'https://www.youtube.com/@massage_zeleninas', icon: 'yt' },
  { label: 'Telegram', href: 'https://t.me/massage_zeleninas', icon: 'tg' },
];

const iconMap: Record<string, ReactNode> = {
  fb: <Send size={15} />,
  ig: <Instagram size={15} />,
  yt: <Youtube size={15} />,
  tg: <MessageCircle size={15} />,
};

export default function MassageSection() {
  return (
    <section id="massage" style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', position: 'relative' }}>
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
          <HeartPulse size={20} style={{ color: 'var(--accent-cyan)' }} />
          <span className="mono-text" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            ОСНОВНОЙ ПРОЕКТ · СОВМЕСТНЫЙ БЛОГ
          </span>
        </div>

        <h2 className="display-text" style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          lineHeight: 1.15,
          marginBottom: '1rem',
        }}>
          <span style={{ color: '#f1f5f9' }}>Реабилитация организма.</span>{' '}
          <span className="gradient-text">Путь Зелениных</span>
        </h2>

        <p className="mono-text" style={{
          color: '#94a3b8',
          maxWidth: '760px',
          marginBottom: '1.5rem',
        }}>
          Классический и спортивный массаж, МФР, фитнес-нутрициология и биомеханика.
          Восстановление организма сочетанием профессионального массажа, движения,
          питания и индивидуального подхода — на всех площадках.
        </p>

        <p style={{ color: '#cbd5e1', marginBottom: '2rem', maxWidth: '760px' }}>
          Мы пишем и снимаем о том, как вернуть телу свободу движения: разборы техник,
          польза МФР, тренировочные рутины и рекомендации по восстановлению после нагрузок.
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}>
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card glass-card-hover"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                textDecoration: 'none',
                color: '#e2e8f0',
                fontSize: '0.8125rem',
                transition: 'all 0.3s',
              }}
            >
              {iconMap[s.icon]}
              {s.label}
            </a>
          ))}
        </div>

        <a
          href="/massage-zeleninas/"
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
          Открыть страницу проекта →
        </a>
      </motion.div>
    </section>
  );
}
