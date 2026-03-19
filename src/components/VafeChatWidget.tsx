import { useState, useRef, useEffect } from 'react';
import './VafeChatWidget.css';
import { generateAIResponse } from '../utils/aiService';

// === ТИПЫ ===
type ChatMode = 'vafe' | 'about' | 'general';
type Language = 'en' | 'ru';
type SearchProvider = 'duckduckgo' | 'tavily' | 'huggingface' | 'none';

// === RATE LIMITER ===
const RATE_LIMIT_KEYS = {
  GLOBAL: 'vafe-global-month',
  USER: 'vafe-user-day',
  LAST_CHECK: 'vafe-last-check',
  TAVILY_PERIOD: 'vafe-tavily-period'  // Период биллинга Tavily
}

const LIMITS = {
  MONTHLY: 1000,
  DAILY_PER_USER: 30,
  WARNING_AT: 800,
  CRITICAL_AT: 950
}

// === ПОИСКОВИКИ ===
const SEARCH_PROVIDERS: Record<SearchProvider, {
  name: string
  icon: string
  limit: number
  description: string
  requiresApiKey: boolean
}> = {
  duckduckgo: {
    name: 'DuckDuckGo',
    icon: '🦆',
    limit: 10000,  // Очень много, почти безлимит
    description: 'Бесплатно, без API ключа',
    requiresApiKey: false
  },
  tavily: {
    name: 'Tavily AI',
    icon: '⚡',
    limit: 1000,  // Free tier
    description: '1000 запросов/мес',
    requiresApiKey: true
  },
  huggingface: {
    name: 'HuggingFace',
    icon: '🤗',
    limit: 10000,
    description: 'Бесплатно, медленно',
    requiresApiKey: false
  },
  none: {
    name: 'Без поиска',
    icon: '🔒',
    limit: 0,
    description: 'Только локальная база',
    requiresApiKey: false
  }
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  warning?: string
  resetDate?: string
}

function getMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getDayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function checkRateLimit(): RateLimitResult {
  const monthKey = getMonthKey()
  const dayKey = getDayKey()

  const lastCheck = localStorage.getItem(RATE_LIMIT_KEYS.LAST_CHECK)
  if (lastCheck !== monthKey) {
    localStorage.setItem(RATE_LIMIT_KEYS.GLOBAL, '0')
    localStorage.setItem(RATE_LIMIT_KEYS.LAST_CHECK, monthKey)
  }

  const globalCount = parseInt(localStorage.getItem(RATE_LIMIT_KEYS.GLOBAL) || '0')
  const userKey = `${RATE_LIMIT_KEYS.USER}-${dayKey}`
  const userCount = parseInt(localStorage.getItem(userKey) || '0')

  const remainingMonthly = LIMITS.MONTHLY - globalCount
  const remainingDaily = LIMITS.DAILY_PER_USER - userCount

  if (globalCount >= LIMITS.MONTHLY) {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(1)

    return {
      allowed: false,
      remaining: 0,
      warning: `🔴 Лимит запросов исчерпан на этот месяц. Следующее обновление: ${nextMonth.toLocaleDateString('ru-RU')}`,
      resetDate: nextMonth.toISOString()
    }
  }

  if (userCount >= LIMITS.DAILY_PER_USER) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return {
      allowed: false,
      remaining: 0,
      warning: `⚠️ Вы исчерпали дневной лимит (${userCount}/${LIMITS.DAILY_PER_USER}). Попробуйте завтра.`,
      resetDate: tomorrow.toISOString()
    }
  }

  let warning: string | undefined

  if (globalCount >= LIMITS.CRITICAL_AT) {
    warning = `⚠️ Осталось ${remainingMonthly} запросов до конца месяца. Используйте экономно.`
  } else if (globalCount >= LIMITS.WARNING_AT) {
    warning = `ℹ️ Израсходовано ${Math.round((globalCount / LIMITS.MONTHLY) * 100)}% месячного лимита (${globalCount}/${LIMITS.MONTHLY})`
  }

  localStorage.setItem(RATE_LIMIT_KEYS.GLOBAL, String(globalCount + 1))
  localStorage.setItem(userKey, String(userCount + 1))

  return {
    allowed: true,
    remaining: Math.min(remainingDaily - 1, remainingMonthly - 1),
    warning
  }
}

async function getRateLimitStats() {
  const monthKey = getMonthKey()
  const lastCheck = localStorage.getItem(RATE_LIMIT_KEYS.LAST_CHECK)

  if (lastCheck !== monthKey) {
    return {
      month: monthKey,
      totalRequests: 0,
      percentageUsed: 0,
      remaining: LIMITS.MONTHLY
    }
  }

  // === ПЫТАЕМСЯ ПОЛУЧИТЬ РЕАЛЬНУЮ СТАТИСТИКУ ИЗ TAVILY API ===
  try {
    const response = await fetch('https://vafe-api.vercel.app/api/v1/usage')

    if (response.ok) {
      const data = await response.json()

      // Сохраняем реальные данные в localStorage
      localStorage.setItem(RATE_LIMIT_KEYS.GLOBAL, String(data.requests_this_month))

      return {
        month: monthKey,
        totalRequests: data.requests_this_month,
        percentageUsed: data.percentage_used,
        remaining: data.remaining
      }
    }
  } catch (error) {
    console.warn('Failed to get Tavily usage, using localStorage:', error)
    // Fallback на localStorage
  }

  // === FALLBACK: localStorage ===
  const globalCount = parseInt(localStorage.getItem(RATE_LIMIT_KEYS.GLOBAL) || '0')

  return {
    month: monthKey,
    totalRequests: globalCount,
    percentageUsed: Math.round((globalCount / LIMITS.MONTHLY) * 100),
    remaining: LIMITS.MONTHLY - globalCount
  }
}

interface Concept {
  id: number;
  tag: string;
  concept: string;
  description?: string;
  physics?: string;
  mechanics?: string;
  details?: string;
  score?: number;
  url?: string; // Ссылка на репозиторий, документ или сайт
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Concept[];
  timestamp: number;
  mode: ChatMode;
}

interface ModeConfig {
  id: ChatMode;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  suggestions: string[];
  knowledgeBase: Concept[];
  sectionId?: string;
}

// === V-AFE KNOWLEDGE BASE (34 concepts) - ENGLISH ===
const VAFE_KNOWLEDGE: Concept[] = [
  {id:1,tag:"Maneuver",concept:"Nose Over Through",physics:"Turn against true wind line",mechanics:"Sharp board turn nose-to-wind at vertical unloading moment"},
  {id:2,tag:"Maneuver",concept:"Sector Change",physics:"Vector course change",mechanics:"Redirect kite and board through zero point upwind"},
  {id:3,tag:"Safety",concept:"Zenith (12:00)",physics:"Minimum horizontal pull point",mechanics:"Bar away for complete unloading"},
  {id:4,tag:"Kinematics",concept:"Leg Axis Mechanics",physics:"Center of mass preservation",mechanics:"Stepping around axis during weightless phase"},
  {id:5,tag:"Maneuver",concept:"Transition Cheat Code",physics:"Drag elimination through flight",mechanics:"Jump for direction change"},
  {id:6,tag:"Feedback",concept:"Wind in Face",physics:"Acoustic marker",mechanics:"Signal that you're going upwind"},
  {id:7,tag:"Control",concept:"Bar Suspension",physics:"Angle of attack control",mechanics:"Bar at zenith = turn off weight"},
  {id:8,tag:"Environment",concept:"Chop Resource",physics:"Wave energy utilization",mechanics:"Wave is a free trampoline"},
  {id:9,tag:"Aerodynamics",concept:"Apparent Wind",physics:"W_app = W_true + W_board",mechanics:"Board speed creates flow for kite"},
  {id:10,tag:"Error",concept:"Cutting Error",physics:"Flow stall on wing",mechanics:"Too sharp cant angle kills speed"},
  {id:11,tag:"Start",concept:"Start Downwind (-10°)",physics:"Drag minimization",mechanics:"Point nose downwind, let board float up"},
  {id:12,tag:"Kinematics",concept:"Figure 7 Pose",physics:"Lever optimization",mechanics:"Shoulders back, hips forward, front leg straight"},
  {id:13,tag:"Kinematics",concept:"Back Leg Spring",physics:"Shock absorber",mechanics:"Always bent, absorbs chop"},
  {id:14,tag:"Feedback",concept:"Blind Control",physics:"Proprioception",mechanics:"Don't look at kite! Feel through harness"},
  {id:15,tag:"Feedback",concept:"Water Whistle",physics:"Laminar flow",mechanics:"Sound indicator of planing"},
  {id:16,tag:"Control",concept:"Bar Sag",physics:"Vector imbalance",mechanics:"Release bar, equalize tension"},
  {id:17,tag:"Control",concept:"Bar Breathing",physics:"Micro-adjustment",mechanics:"Release on gusts, pull on lulls"},
  {id:18,tag:"Start",concept:"Knee Under",physics:"Center of mass grouping",mechanics:"Back knee to belly - compressed spring"},
  {id:19,tag:"Start",concept:"Charged Harpoon",physics:"Acceleration vector",mechanics:"Front leg points downwind before swing"},
  {id:20,tag:"Aerodynamics",concept:"Sweet Spot (45°)",physics:"Pull balance",mechanics:"Fix kite at 45 degrees"},
  {id:21,tag:"Aerodynamics",concept:"Flat Board",physics:"Friction reduction",mechanics:"Pressure release = speed increases"},
  {id:22,tag:"Kinematics",concept:"Gaze Guide",physics:"Biomechanics",mechanics:"Body follows gaze"},
  {id:23,tag:"Control",concept:"Swing Sync",physics:"Phase coupling",mechanics:"Kite down = board flat, kite up = edge"},
  {id:24,tag:"Control",concept:"Belly Pull",physics:"Force centering",mechanics:"All power through body, arms relaxed"},
  {id:25,tag:"Kinematics",concept:"Straight Front Leg",physics:"Pitch protection",mechanics:"Eliminates nose diving"},
  {id:26,tag:"Aerodynamics",concept:"Feedback Loop",physics:"Regenerative cycle",mechanics:"Speed → W_app growth → pull growth"},
  {id:27,tag:"Maneuver",concept:"Dead Zone Inertia",physics:"Momentum preservation",mechanics:"Pass through point using speed"},
  {id:28,tag:"Maneuver",concept:"Transition Inertia",physics:"Energy conservation",mechanics:"Land on hard edge"},
  {id:29,tag:"Maneuver",concept:"Dynamic Edging",physics:"Height transition",mechanics:"Upwind exit after whistle"},
  {id:30,tag:"Physics",concept:"Push-Pull Balance",physics:"Force equilibrium",mechanics:"Tension = heel pressure"},
  {id:31,tag:"Aerodynamics",concept:"Sine Dumps",physics:"Flow generation",mechanics:"Figure-8 kite in light wind"},
  {id:32,tag:"Maneuver",concept:"Edge Pressure",physics:"Upward vector",mechanics:"Hard heel after speed"},
  {id:33,tag:"Philosophy",concept:"Sensory Zen",physics:"Integration",mechanics:"Merge signals into model"},
  {id:34,tag:"Architecture",concept:"V-AFE",physics:"Systematization",mechanics:"Logging + RAG + physics"}
];

// === ABOUT DMITRY KNOWLEDGE (24 concepts) - ENGLISH ===
const ABOUT_KNOWLEDGE: Concept[] = [
  {id:1,tag:"About",concept:"Main Activity",description:"LLM & ML Engineer specializing in AI agents and RAG systems",details:"Full-scale AI solutions: prototype to production. Turning complex tasks into working products"},
  {id:2,tag:"Skills",concept:"Technical Skills",description:"Python, PyTorch, Transformers, FastAPI, React",details:"Full ML stack: data preparation → training → deployment → monitoring. Confident at all stages"},
  {id:3,tag:"Skills",concept:"LLM & RAG",description:"Fine-tuning (LoRA, QLoRA), RAG architectures, agents",details:"Experience with Llama, Qwen, Gemini. Production RAG pipelines. RAPTOR indexing for complex documents"},
  {id:4,tag:"Skills",concept:"MLOps",description:"MLflow, DVC, Docker, CI/CD, Ray",details:"ML pipeline automation, versioning, monitoring. Know how to deploy models to production"},
  {id:5,tag:"Skills",concept:"Computer Vision",description:"OpenCV, YOLO, Segmentation, Classification",details:"Object detection, segmentation, classification. Medical and industrial use cases"},
  {id:6,tag:"Skills",concept:"Data Engineering",description:"SQL, Pandas, PySpark, ETL pipelines",details:"Building reliable data pipelines. Working with large data volumes"},
  {id:7,tag:"Project",concept:"VORTEX-AFE",description:"VORTEX: APPARENT FLOW ENGINE - AI kitesurfing instructor with RAG architecture",details:"34 concepts, RAPTOR index, GitHub Pages integration. Personal project at hobby-profession intersection",url:"https://github.com/dizel0110/VORTEX-AFE"},
  {id:8,tag:"Project",concept:"AI_PROPHET",description:"Multimodal AI agent (Text + Vision + Voice)",details:"Fallback system: Google Gemini → HuggingFace (Qwen/Llama) for 99.9% uptime. Universal assistant",url:"https://github.com/dizel0110/AI_PROPHET"},
  {id:9,tag:"Project",concept:"news-recommender",description:"Production MLOps pipeline for news recommendations",details:"MLflow, DVC, Ray, LaBSE embeddings. Yandex.Q & ODS.ai supported project",url:"https://github.com/dizel0110/news-recommender"},
  {id:10,tag:"Project",concept:"ITMO",description:"ML Engineering projects at ITMO University",details:"Applied ML tasks in industry. Real cases from university partners",url:"https://github.com/dizel0110/ITMO"},
  {id:11,tag:"Project",concept:"Portfolio",description:"React + TypeScript + Vite portfolio site",details:"Modern stack, Framer Motion animations, RAG chat widget. GitHub Pages deployment",url:"https://github.com/dizel0110/dizel0110.github.io"},
  {id:12,tag:"Education",concept:"HARDML",description:"Hardcore ML course (completed August 2022)",details:"Deep dive into ML/DL theory and practice. Mathematics, algorithms, neural networks"},
  {id:13,tag:"Education",concept:"ITMO University",description:"ML Engineering projects at ITMO",details:"Applied ML tasks in industry. Real cases from university partners"},
  {id:14,tag:"Education",concept:"Self-Education",description:"Continuous learning in ML/AI",details:"Following latest research, reading papers, experimenting with new models"},
  {id:15,tag:"Contact",concept:"Email",description:"dizel0110@gmail.com",details:"Primary contact method. Response within 24 hours",url:"mailto:dizel0110@gmail.com"},
  {id:16,tag:"GitHub",concept:"GitHub Repositories",description:"62+ repositories at github.com/dizel0110",details:"Open source: VORTEX-AFE, AI_PROPHET, news-recommender, ITMO, HardML, TensorTonic-Solutions, CCF and more. https://github.com/dizel0110?tab=repositories",url:"https://github.com/dizel0110?tab=repositories"},
  {id:17,tag:"Contact",concept:"Telegram",description:"@dizel0110",details:"Quick response in messenger. Preferred contact method",url:"https://t.me/dizel0110"},
  {id:18,tag:"Contact",concept:"LinkedIn",description:"https://linkedin.com/in/dizel0110",details:"Professional network. Recommendations and work experience",url:"https://linkedin.com/in/dizel0110"},
  {id:19,tag:"Contact",concept:"Instagram",description:"https://instagram.com/dizel0110",details:"Kitesurfing and life in El Gouna. Lifestyle and hobbies",url:"https://instagram.com/dizel0110"},
  {id:20,tag:"Philosophy",concept:"Work Approach",description:"From tactile experience to digital system",details:"Turning physical experience into engineering solutions (like V-AFE for kiting). Understanding domain from inside"},
  {id:21,tag:"Philosophy",concept:"Location",description:"El Gouna, Egypt — 270+ windy days per year",details:"Perfect place for kiting and remote work. Working from any timezone"},
  {id:22,tag:"Availability",concept:"Job Search",description:"Data Scientist, ML-engineer, AI Agent Dev, Data Analyst",details:"Open to offers in LLM & ML Engineering. Full-time, part-time, contract"},
  {id:23,tag:"Availability",concept:"Work Format",description:"Remote, Hybrid, Relocation",details:"Ready for remote work, hybrid, or relocation. Flexible schedule"},
  {id:24,tag:"Languages",concept:"Languages",description:"Russian (native), English (B1-B2)",details:"Freely read documentation and papers in English. Working in international teams"}
];

// === RUSSIAN TRANSLATIONS ===
const TRANSLATIONS: Record<Language, Record<string, any>> = {
  en: {
    modes: {
      vafe: 'Kiting',
      about: 'Projects',
      general: 'Assistant'
    },
    titles: {
      vafe: 'V-AFE · Kiting',
      about: 'Portfolio · Projects',
      general: 'AI · Assistant'
    },
    descriptions: {
      vafe: '34 concepts: physics, mechanics, maneuvers',
      about: '24 concepts: projects, skills, contacts',
      general: '58 concepts + internet search'
    },
    suggestions: {
      vafe: ['Apparent wind', 'How to start?', 'Figure 7', 'Upwind', 'Chop', 'Kite at zenith'],
      about: ['Tell about projects', 'What skills?', 'How to contact?', 'Where located?', 'Experience', 'Open to work?', 'Work format', 'Languages'],
      general: ['Hello!', 'What can you do?', 'Help', 'About this site', 'Contacts', 'Kitesurfing', 'LLM', 'RAG']
    },
    welcome: {
      vafe: 'AI kitesurfing instructor with 34 physics-based concepts. Ask about technique, maneuvers, or wind theory.',
      about: 'Explore Dmitry\'s portfolio: 24 concepts covering projects, technical skills, contacts, and availability.',
      general: 'Universal AI assistant with access to full knowledge base (58 concepts) and internet search.'
    },
    inputPlaceholder: {
      vafe: 'Ask about kitesurfing technique...',
      about: 'Ask about projects or skills...',
      general: 'Ask me anything...'
    },
    noResults: {
      vafe: 'kitesurfing technique, physics, maneuvers',
      about: 'projects, skills, experience, contacts',
      general: 'any topic - I\'ll search online'
    }
  },
  ru: {
    modes: {
      vafe: 'Кайтинг',
      about: 'Проекты',
      general: 'Ассистент'
    },
    titles: {
      vafe: 'V-AFE · Кайтинг',
      about: 'Портфолио · Проекты',
      general: 'AI · Ассистент'
    },
    descriptions: {
      vafe: '34 концепта: физика, механика, манёвры',
      about: '24 концепта: проекты, навыки, контакты',
      general: '58 концептов + поиск в интернете'
    },
    suggestions: {
      vafe: ['Вымпельный ветер', 'Как стартовать?', 'Поза 7', 'Апвинд', 'Чоп', 'Кайт в зенит'],
      about: ['Расскажи о проектах', 'Какие навыки?', 'Как связаться?', 'Где находишься?', 'Опыт работы', 'Открыт к работе?', 'Формат работы', 'Языки'],
      general: ['Привет!', 'Что ты умеешь?', 'Помощь', 'О сайте', 'Контакты', 'Кайтбординг', 'LLM', 'RAG']
    },
    welcome: {
      vafe: 'AI инструктор по кайтбордингу с 34 концептами по физике и технике. Спрашивай о манёврах, теории ветра.',
      about: 'Портфолио Дмитрия: 24 концепта о проектах, технических навыках, контактах и доступности к работе.',
      general: 'Универсальный AI ассистент с доступом ко всей базе знаний (58 концептов) и поиском в интернете.'
    },
    inputPlaceholder: {
      vafe: 'Спросите о технике кайтбординга...',
      about: 'Спросите о проектах или навыках...',
      general: 'Спросите о чём угодно...'
    },
    noResults: {
      vafe: 'технике кайтбординга, физике, манёврах',
      about: 'проектах, навыках, опыте, контактах',
      general: 'любой теме — я поищу в интернете'
    }
  }
};

// === RUSSIAN KNOWLEDGE BASE (TRANSLATED) ===
const VAFE_KNOWLEDGE_RU: Concept[] = [
  {id:1,tag:"Maneuver",concept:"Оверштаг через нос",physics:"Разворот против линии истинного ветра",mechanics:"Резкий доворот доски носом к ветру в момент вертикальной разгрузки"},
  {id:2,tag:"Maneuver",concept:"Смена сектора",physics:"Векторная смена курса",mechanics:"Перекладывать кайт и доску через точку ноль против ветра"},
  {id:3,tag:"Safety",concept:"Зенит (12:00)",physics:"Точка минимальной горизонтальной тяги",mechanics:"Планка от себя для полной разгрузки"},
  {id:4,tag:"Kinematics",concept:"Осевая механика ног",physics:"Сохранение центра масс",mechanics:"В фазе невесомости переступание ногами вокруг оси"},
  {id:5,tag:"Maneuver",concept:"Транзишн-чит-код",physics:"Исключение сопротивления через полёт",mechanics:"Прыжок для смены направления"},
  {id:6,tag:"Feedback",concept:"Ветер в лицо",physics:"Акустический маркер",mechanics:"Сигнал что ты идёшь в апвинд"},
  {id:7,tag:"Control",concept:"Планка-подвеска",physics:"Управление углом атаки",mechanics:"Отдать планку в зените = выключить вес"},
  {id:8,tag:"Environment",concept:"Чоп-ресурс",physics:"Использование энергии волны",mechanics:"Волна — это бесплатный трамплин"},
  {id:9,tag:"Aerodynamics",concept:"Вымпельный ветер",physics:"W_app = W_true + W_board",mechanics:"Скорость доски создаёт поток для кайта"},
  {id:10,tag:"Error",concept:"Ошибка перерезки",physics:"Срыв потока на крыле",mechanics:"Слишком острый угол канта убивает скорость"},
  {id:11,tag:"Start",concept:"Старт в слив (-10°)",physics:"Минимизация сопротивления",mechanics:"Направь нос по ветру, дай доске всплыть"},
  {id:12,tag:"Kinematics",concept:"Поза Семерки (7)",physics:"Оптимизация рычага",mechanics:"Плечи назад, таз вперёд, передняя нога прямая"},
  {id:13,tag:"Kinematics",concept:"Задняя нога-пружина",physics:"Амортизатор",mechanics:"Всегда согнута, гасит чоп"},
  {id:14,tag:"Feedback",concept:"Слепое управление",physics:"Проприоцепция",mechanics:"Не смотреть на кайт! Чувствовать через трапецию"},
  {id:15,tag:"Feedback",concept:"Свист воды",physics:"Ламинарный поток",mechanics:"Звуковой индикатор глиссирования"},
  {id:16,tag:"Control",concept:"Провис планки",physics:"Дисбаланс векторов",mechanics:"Отдай планку, выровняй натяжение"},
  {id:17,tag:"Control",concept:"Планка-дыхание",physics:"Микро-регулировка",mechanics:"Отдавай на порывах, притягивай на провалах"},
  {id:18,tag:"Start",concept:"Колено под себя",physics:"Группировка центра масс",mechanics:"Заднее колено к животу — сжатая пружина"},
  {id:19,tag:"Start",concept:"Заряженный гарпун",physics:"Вектор разгона",mechanics:"Передняя нога смотрит в слив до маха"},
  {id:20,tag:"Aerodynamics",concept:"Sweet Spot (45°)",physics:"Баланс тяги",mechanics:"Фиксация кайта на 45 градусах"},
  {id:21,tag:"Aerodynamics",concept:"Плоская доска",physics:"Снижение трения",mechanics:"Сброс давления — скорость растёт"},
  {id:22,tag:"Kinematics",concept:"Взгляд-путеводитель",physics:"Биомеханика",mechanics:"Тело следует за взглядом"},
  {id:23,tag:"Control",concept:"Синхронизация маха",physics:"Сопряжение фаз",mechanics:"Кайт вниз — доска плоско, кайт вверх — зарезка"},
  {id:24,tag:"Control",concept:"Тяга в пупке",physics:"Центровка силы",mechanics:"Вся мощь корпусом, руки расслаблены"},
  {id:25,tag:"Kinematics",concept:"Прямая передняя нога",physics:"Защита от тангажа",mechanics:"Исключает зарывание носа"},
  {id:26,tag:"Aerodynamics",concept:"Петля связи",physics:"Регенеративный цикл",mechanics:"Разгон → рост W_app → рост тяги"},
  {id:27,tag:"Maneuver",concept:"Инерция мертвой зоны",physics:"Сохранение импульса",mechanics:"Прохождение через точку за счёт скорости"},
  {id:28,tag:"Maneuver",concept:"Инерция транзишна",physics:"Консервация энергии",mechanics:"Приземление на жёсткий кант"},
  {id:29,tag:"Maneuver",concept:"Динамическая зарезка",physics:"Переход к высоте",mechanics:"Выход на апвинд после свиста"},
  {id:30,tag:"Physics",concept:"Баланс Тяни-Толкай",physics:"Равновесие сил",mechanics:"Натяжение = упор пятки"},
  {id:31,tag:"Aerodynamics",concept:"Дамахи",physics:"Генерация потока",mechanics:"Восьмёрки кайтом при слабом ветре"},
  {id:32,tag:"Maneuver",concept:"Упор в кант",physics:"Вектор вверх",mechanics:"Жёсткая пятка после скорости"},
  {id:33,tag:"Philosophy",concept:"Сенсорный Дзен",physics:"Интеграция",mechanics:"Слияние сигналов в модель"},
  {id:34,tag:"Architecture",concept:"V-AFE",physics:"Систематизация",mechanics:"Логирование + RAG + физика"}
];

const ABOUT_KNOWLEDGE_RU: Concept[] = [
  {id:1,tag:"About",concept:"Основная деятельность",description:"LLM & ML Engineer, специализация на AI-агентах и RAG-системах",details:"Разработка полномасштабных AI-решений: от прототипа до продакшена. Превращаю сложные задачи в работающие продукты"},
  {id:2,tag:"Skills",concept:"Технические навыки",description:"Python, PyTorch, Transformers, FastAPI, React",details:"Полный стек ML: data preparation → training → deployment → monitoring. Уверенно чувствую себя на всех этапах"},
  {id:3,tag:"Skills",concept:"LLM & RAG",description:"Fine-tuning (LoRA, QLoRA), RAG-архитектуры, агенты",details:"Опыт с Llama, Qwen, Gemini. Построение production RAG-пайплайнов. RAPTOR-индексация для сложных документов"},
  {id:4,tag:"Skills",concept:"MLOps",description:"MLflow, DVC, Docker, CI/CD, Ray",details:"Автоматизация ML-пайплайнов, версионирование, мониторинг. Знаю как доставить модель в продакшен"},
  {id:5,tag:"Skills",concept:"Computer Vision",description:"OpenCV, YOLO, Segmentation, Classification",details:"Опыт работы с детекцией объектов, сегментацией, классификацией изображений. Медицинские и промышленные кейсы"},
  {id:6,tag:"Skills",concept:"Data Engineering",description:"SQL, Pandas, PySpark, ETL-пайплайны",details:"Построение надёжных пайплайнов данных. Работа с большими объёмами информации"},
  {id:7,tag:"Project",concept:"VORTEX-AFE",description:"VORTEX: APPARENT FLOW ENGINE - AI инструктор по кайтбордингу с RAG-архитектурой",details:"34 концепта, RAPTOR-индекс, интеграция в GitHub Pages. Личный проект на стыке хобби и профессии",url:"https://github.com/dizel0110/VORTEX-AFE"},
  {id:8,tag:"Project",concept:"AI_PROPHET",description:"Мультимодальный AI-агент (Text + Vision + Voice)",details:"Fallback-система: Google Gemini → HuggingFace (Qwen/Llama) для 99.9% uptime. Универсальный ассистент",url:"https://github.com/dizel0110/AI_PROPHET"},
  {id:9,tag:"Project",concept:"news-recommender",description:"Production MLOps пайплайн для рекомендаций новостей",details:"MLflow, DVC, Ray, LaBSE embeddings. Проект при поддержке Яндекс.Кью и ODS.ai",url:"https://github.com/dizel0110/news-recommender"},
  {id:10,tag:"Project",concept:"ITMO",description:"ML Engineering проекты в ИТМО",details:"Прикладные задачи ML в индустрии. Реальные кейсы от партнёров университета",url:"https://github.com/dizel0110/ITMO"},
  {id:11,tag:"Project",concept:"Portfolio",description:"React + TypeScript + Vite портфолио",details:"Современный стек, анимации Framer Motion, чат-виджет с RAG. Деплой на GitHub Pages",url:"https://github.com/dizel0110/dizel0110.github.io"},
  {id:12,tag:"Education",concept:"HARDML",description:"Хардкорный ML курс (завершён в августе 2022)",details:"Глубокое погружение в ML/DL теорию и практику. Математика, алгоритмы, нейросети"},
  {id:13,tag:"Education",concept:"ITMO University",description:"ML Engineering проекты в ИТМО",details:"Прикладные задачи ML в индустрии. Реальные кейсы от партнёров университета"},
  {id:14,tag:"Education",concept:"Самообразование",description:"Постоянное изучение нового в ML/AI",details:"Слежу за последними исследованиями, читаю papers, экспериментирую с новыми моделями"},
  {id:15,tag:"Contact",concept:"Email",description:"dizel0110@gmail.com",details:"Основной способ связи. Отвечаю в течение 24 часов",url:"mailto:dizel0110@gmail.com"},
  {id:16,tag:"GitHub",concept:"GitHub Repositories",description:"62+ репозиториев на github.com/dizel0110",details:"Открытый код: VORTEX-AFE, AI_PROPHET, news-recommender, ITMO, HardML, TensorTonic-Solutions, CCF и другие. https://github.com/dizel0110?tab=repositories",url:"https://github.com/dizel0110?tab=repositories"},
  {id:17,tag:"Contact",concept:"Telegram",description:"@dizel0110",details:"Быстрый ответ в мессенджере. Предпочтительный способ связи",url:"https://t.me/dizel0110"},
  {id:18,tag:"Contact",concept:"LinkedIn",description:"https://linkedin.com/in/dizel0110",details:"Профессиональная сеть. Рекомендации и опыт работы",url:"https://linkedin.com/in/dizel0110"},
  {id:19,tag:"Contact",concept:"Instagram",description:"https://instagram.com/dizel0110",details:"Кайтинг и жизнь в El Gouna. Лайфстайл и хобби",url:"https://instagram.com/dizel0110"},
  {id:20,tag:"Philosophy",concept:"Подход к работе",description:"От тактильного опыта к цифровой системе",details:"Превращаю физический опыт в инженерные решения (как V-AFE для кайтинга). Понимаю предметную область изнутри"},
  {id:21,tag:"Philosophy",concept:"Локация",description:"El Gouna, Egypt — 270+ ветреных дней в году",details:"Идеальное место для кайтинга и удалённой работы. Работаю из любого часового пояса"},
  {id:22,tag:"Availability",concept:"Поиск работы",description:"Data Scientist, ML-engineer, AI Agent Dev, Data Analyst",details:"Открыт к предложениям в области LLM & ML Engineering. Full-time, part-time, contract"},
  {id:23,tag:"Availability",concept:"Формат работы",description:"Remote, Hybrid, Relocation",details:"Готов к удалённой работе, гибриду или переезду. Гибкий график"},
  {id:24,tag:"Languages",concept:"Языки",description:"Русский (native), English (B1-B2)",details:"Свободно читаю документацию и papers на английском. Работаю в международных командах"}
];

// === АВАТАРКА С GITHUB ===
const GITHUB_AVATAR_URL = 'https://avatars.githubusercontent.com/u/dizel0110';

// === ПОИСК (улучшенный, с семантикой) ===
const searchKnowledge = (
  query: string,
  knowledgeBase: Concept[],
  topK: number = 5
): Concept[] => {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length >= 2);

  // Синонимы и связанные понятия для семантического поиска
  const synonyms: Record<string, string[]> = {
    'проект': ['проект', 'project', 'разработка', 'продукт', 'сервис', 'приложение', 'система', 'платформа'],
    'навык': ['навык', 'skill', 'умение', 'технология', 'стек', 'инструмент', 'язык', 'фреймворк'],
    'работ': ['работ', 'work', 'ваканси', 'позици', 'должност', 'предложени', 'employment', 'job'],
    'контакт': ['контакт', 'contact', 'связ', 'email', 'telegram', 'linkedin', 'instagram', 'github', 'соцсет'],
    'кайт': ['кайт', 'kite', 'кайтинг', 'кайтбординг', 'kitesurf', 'крыл', 'ветер', 'доск', 'глисс'],
    'ветер': ['ветер', 'wind', 'поток', 'воздух', 'вымпельн', 'apparent', 'истинн', 'true', 'аэродинамик'],
    'старт': ['старт', 'start', 'начал', 'подъем', 'выход', 'запуск', 'вода', 'water'],
    'маневр': ['маневр', 'maneuver', 'поворот', 'turn', 'оверштаг', 'транзишн', 'transition', 'смена', 'курс'],
    'обучени': ['обучени', 'education', 'курс', 'course', 'университет', 'универ', 'образование', 'study', 'learn'],
    'локаци': ['локаци', 'location', 'мест', 'город', 'стран', 'el gouna', 'egypt', 'египет', 'где', 'находиш', 'жив'],
    'язык': ['язык', 'language', 'english', 'русский', 'russian', 'speak'],
    'формат': ['формат', 'format', 'remote', 'удален', 'офис', 'гибрид', 'hybrid', 'relocation'],
    'физик': ['физик', 'physics', 'механик', 'mechanics', 'аэродинамик', 'aerodynamics'],
    'поз': ['поз', 'pose', 'позици', 'position', 'стойк'],
    'где': ['где', 'where', 'location', 'место', 'город', 'страна'],
    'как связ': ['как связ', 'contact', 'связаться', 'написать', 'позвонить'],
    'открыт': ['открыт', 'open', 'available', 'ищу работу', 'job search']
  };

  // Расширяем запрос синонимами
  const expandedWords = new Set<string>(words);
  words.forEach(word => {
    Object.entries(synonyms).forEach(([key, syns]) => {
      if (word.includes(key) || key.includes(word)) {
        syns.forEach(s => expandedWords.add(s));
      }
    });
  });

  const scores = knowledgeBase.map(c => {
    const text = `${c.concept} ${c.description || ''} ${c.physics || ''} ${c.mechanics || ''} ${c.details || ''} ${c.tag}`.toLowerCase();
    let score = 0;

    expandedWords.forEach(word => {
      // Точное совпадение концепта
      if (c.concept.toLowerCase().includes(word)) score += 15;
      
      // Совпадение в описании
      if (text.includes(word)) score += 5;
      
      // Совпадение тега
      if (c.tag.toLowerCase().includes(word)) score += 8;
      
      // Частичное совпадение (для морфологии)
      if (word.length >= 3) {
        Object.keys(synonyms).forEach(key => {
          if (word.startsWith(key) || key.startsWith(word)) {
            score += 3;
          }
        });
      }
    });

    // Бонус за длину запроса — если много слов совпали
    const matchedWords = Array.from(expandedWords).filter(w => text.includes(w)).length;
    if (matchedWords >= 2) score += 10;
    if (matchedWords >= 3) score += 15;

    return {...c, score};
  });

  return scores
    .filter(k => (k.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, topK);
};

// === ГЕНЕРАЦИЯ ОТВЕТА ===
const generateResponse = (
  _query: string,
  results: Concept[],
  mode: ChatMode,
  lang: Language
): { text: string; sources: Concept[] } => {
  const t = TRANSLATIONS[lang];

  if (results.length === 0) {
    const noResultsText = lang === 'en'
      ? `No information found on your request. Try asking about:\n\n• ${t.noResults[mode]}`
      : `Не нашёл информации по вашему запросу. Попробуйте спросить о:\n\n• ${t.noResults[mode]}`;

    return {
      text: noResultsText,
      sources: []
    };
  }

  const foundText = lang === 'en'
    ? `Found **${results.length} records**:\n\n`
    : `Нашёл **${results.length} записей**:\n\n`;

  let response = foundText;

  results.forEach((r, i) => {
    response += `**${i + 1}. ${r.concept}** [${r.tag}]\n`;

    if (r.description) {
      response += `   ${r.description}\n`;
    }
    if (r.physics) {
      const physicsLabel = lang === 'en' ? 'Physics' : 'Физика';
      response += `   **${physicsLabel}:** ${r.physics}\n`;
    }
    if (r.mechanics) {
      const mechanicsLabel = lang === 'en' ? 'Mechanics' : 'Механика';
      response += `   **${mechanicsLabel}:** ${r.mechanics}\n`;
    }
    if (r.details) {
      response += `   ${r.details}\n`;
    }

    response += '\n';
  });

  return { text: response, sources: results };
};

// === КОНФИГУРАЦИЯ РЕЖИМОВ ===
const MODES: Record<ChatMode, ModeConfig> = {
  vafe: {
    id: 'vafe',
    name: 'Kiting',
    icon: '🪁',
    color: '#0077be',
    gradient: 'linear-gradient(135deg, #0077be, #00a8e8)',
    suggestions: ['Apparent wind', 'How to start?', 'Figure 7', 'Upwind', 'Chop', 'Kite at zenith'],
    knowledgeBase: VAFE_KNOWLEDGE,
    sectionId: 'technical-core'
  },
  about: {
    id: 'about',
    name: 'About',
    icon: '👤',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    suggestions: ['Tell about yourself', 'What projects?', 'How to contact?', 'Where are you?', 'Skills', 'Open to work?', 'Work format', 'Languages'],
    knowledgeBase: ABOUT_KNOWLEDGE,
    sectionId: 'about'
  },
  general: {
    id: 'general',
    name: 'General',
    icon: '💬',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    suggestions: ['Hello!', 'What can you do?', 'Help', 'About project', 'Contacts', 'Kiting', 'LLM', 'RAG'],
    knowledgeBase: [...VAFE_KNOWLEDGE, ...ABOUT_KNOWLEDGE],
    sectionId: 'hero'
  }
};

// === КОМПОНЕНТ ===
export default function VafeChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('general');
  const [language, setLanguage] = useState<Language>('en');
  const [searchProvider, setSearchProvider] = useState<SearchProvider>('duckduckgo');  // ← Переключатель поисковика
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());

  // РАЗДЕЛЬНАЯ ПАМЯТЬ ДЛЯ КАЖДОГО РЕЖИМА И ЯЗЫКА
  const [messagesByModeAndLang, setMessagesByModeAndLang] = useState<Record<ChatMode, Record<Language, Message[]>>>({
    vafe: { en: [], ru: [] },
    about: { en: [], ru: [] },
    general: { en: [], ru: [] }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Определяем базу знаний и подсказки на основе языка
  const currentMode = MODES[mode];
  const currentKnowledgeBase = language === 'en'
    ? (mode === 'vafe' ? VAFE_KNOWLEDGE : mode === 'about' ? ABOUT_KNOWLEDGE : [...VAFE_KNOWLEDGE, ...ABOUT_KNOWLEDGE])
    : (mode === 'vafe' ? VAFE_KNOWLEDGE_RU : mode === 'about' ? ABOUT_KNOWLEDGE_RU : [...VAFE_KNOWLEDGE_RU, ...ABOUT_KNOWLEDGE_RU]);

  const currentSuggestions = TRANSLATIONS[language].suggestions[mode];
  const currentMessages = messagesByModeAndLang[mode][language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, mode, isOpen, language]);

  // === АВТО-СМЕНА РЕЖИМА ПРИ СКРОЛЛЕ ===
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'technical-core', 'lifestyle', 'investors', 'footer'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const documentHeight = document.documentElement.scrollHeight;

      // Определяем, что мы в нижней части страницы (footer)
      const footerThreshold = documentHeight - window.innerHeight - 200;
      const isInFooter = scrollPosition >= footerThreshold;

      let visibleSection = 'hero';

      // Если почти в конце — показываем footer
      if (isInFooter) {
        visibleSection = 'footer';
      } else {
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              visibleSection = sectionId;
              break;
            }
          }
        }
      }

      // Авто-смена режима на основе секции
      const modeMapping: Record<string, ChatMode> = {
        'hero': 'general',
        'technical-core': 'about',
        'lifestyle': 'vafe',
        'investors': 'general',
        'footer': 'about',
        'about': 'about'
      };

      const newMode = modeMapping[visibleSection] || 'general';

      // Используем функциональное обновление для избежания конфликта
      setMode(currentMode => {
        if (newMode !== currentMode) {
          return newMode;
        }
        return currentMode;
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Вызываем сразу при монтировании
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // ← ПУСТОЙ МАССИВ — не пересоздавать при смене mode!

  const handleSend = async () => {
    if (!input.trim()) return;

    // === ПРОВЕРКА ЛИМИТА ===
    const rateLimit = checkRateLimit()

    // Показываем предупреждение (даже если разрешено)
    if (rateLimit.warning) {
      const warningMessage: Message = {
        role: 'assistant',
        content: rateLimit.warning,
        timestamp: Date.now(),
        mode
      }
      setMessagesByModeAndLang(prev => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          [language]: [...prev[mode][language], warningMessage]
        }
      }))

      // Если не разрешено — останавливаемся
      if (!rateLimit.allowed) {
        setIsTyping(false)
        return
      }
    }

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
      mode
    };

    setMessagesByModeAndLang(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [language]: [...prev[mode][language], userMsg]
      }
    }));

    const query = input;
    setInput('');
    setIsTyping(true);

    try {
      const q = query.toLowerCase();

      // === РЕЖИМ "GENERAL" — СРАЗУ ИДЁМ В V-AFE API ===
      if (mode === 'general') {
        const aiResponse = await generateAIResponse(query, '', 'general');

        const assistantMsg: Message = {
          role: 'assistant',
          content: aiResponse.text,
          sources: (aiResponse.sources || []) as Concept[],
          timestamp: Date.now(),
          mode
        };

        setMessagesByModeAndLang(prev => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            [language]: [...prev[mode][language], assistantMsg]
          }
        }));
        setIsTyping(false);
        return;
      }

      // === РЕЖИМЫ "VAFE" и "ABOUT" — ЛОКАЛЬНАЯ БАЗА ===
      // Сначала ищем в локальной базе
      const localResults = searchKnowledge(query, currentKnowledgeBase);

      // Специальные кейсы для шаблонных вопросов в режиме about

      // "Где находишься?" → Локация / Location
      if ((q.includes('где') || q.includes('находиш') || q.includes('жив') || q.includes('location') || q.includes('where')) && mode === 'about') {
        const locationResult = currentKnowledgeBase.find(c => c.concept.includes('Локац') || c.concept.includes('Location'));
        if (locationResult) {
          const response = generateResponse(query, [locationResult], mode, language);
          const assistantMsg: Message = {
            role: 'assistant',
            content: response.text,
            sources: response.sources,
            timestamp: Date.now(),
            mode
          };
          setMessagesByModeAndLang(prev => ({
            ...prev,
            [mode]: {
              ...prev[mode],
              [language]: [...prev[mode][language], assistantMsg]
            }
          }));
          setIsTyping(false);
          return;
        }
      }

      // "Расскажи о проектах" → проекты с ссылками
      if ((q.includes('расскажи о проект') || q.includes('какие проект') || q.includes('tell about project')) && mode === 'about') {
        const projects = currentKnowledgeBase.filter(c => c.tag === 'Project' && c.url);
        if (projects.length > 0) {
          const response = generateResponse(query, projects.slice(0, 5), mode, language);
          const assistantMsg: Message = {
            role: 'assistant',
            content: response.text,
            sources: response.sources, // URL уже есть в projects
            timestamp: Date.now(),
            mode
          };
          setMessagesByModeAndLang(prev => ({
            ...prev,
            [mode]: {
              ...prev[mode],
              [language]: [...prev[mode][language], assistantMsg]
            }
          }));
          setIsTyping(false);
          return;
        }
      }

      // "Опыт работы" → HARDML, ITMO
      if ((q.includes('опыт работ') || q.includes('experience') || q.includes('hardml') || q.includes('itmo')) && mode === 'about') {
        const education = currentKnowledgeBase.filter(c => c.tag === 'Education' || c.concept.includes('HARDML') || c.concept.includes('ITMO'));
        if (education.length > 0) {
          const response = generateResponse(query, education, mode, language);
          const assistantMsg: Message = {
            role: 'assistant',
            content: response.text,
            sources: education.map(e => ({ ...e, url: e.url || 'https://github.com/dizel0110' })),
            timestamp: Date.now(),
            mode
          };
          setMessagesByModeAndLang(prev => ({
            ...prev,
            [mode]: {
              ...prev[mode],
              [language]: [...prev[mode][language], assistantMsg]
            }
          }));
          setIsTyping(false);
          return;
        }
      }

      // "Открыт к работе?" → Availability
      if ((q.includes('открыт к работ') || q.includes('open to work') || q.includes('ищу работ')) && mode === 'about') {
        const availability = currentKnowledgeBase.filter(c => c.tag === 'Availability');
        if (availability.length > 0) {
          const response = generateResponse(query, availability, mode, language);
          const assistantMsg: Message = {
            role: 'assistant',
            content: response.text,
            sources: availability.map(a => ({ ...a, url: 'https://linkedin.com/in/dizel0110' })),
            timestamp: Date.now(),
            mode
          };
          setMessagesByModeAndLang(prev => ({
            ...prev,
            [mode]: {
              ...prev[mode],
              [language]: [...prev[mode][language], assistantMsg]
            }
          }));
          setIsTyping(false);
          return;
        }
      }

      // "Формат работы" → Remote/Hybrid/Relocation
      if ((q.includes('формат работ') || q.includes('work format') || q.includes('remote') || q.includes('hybrid') || q.includes('relocation')) && mode === 'about') {
        let format = currentKnowledgeBase.filter(c => c.tag === 'Availability' && (c.concept.includes('Формат') || c.concept.includes('Work Format')));
        if (format.length === 0) {
          // Если не нашли точно, берём все Availability
          format = currentKnowledgeBase.filter(c => c.tag === 'Availability');
        }
        if (format.length > 0) {
          const response = generateResponse(query, format, mode, language);
          const assistantMsg: Message = {
            role: 'assistant',
            content: response.text,
            sources: format.map(f => ({ ...f, url: 'https://linkedin.com/in/dizel0110' })),
            timestamp: Date.now(),
            mode
          };
          setMessagesByModeAndLang(prev => ({
            ...prev,
            [mode]: {
              ...prev[mode],
              [language]: [...prev[mode][language], assistantMsg]
            }
          }));
          setIsTyping(false);
          return;
        }
      }

      // "Языки" → Language Skills
      if ((q.includes('язык') || q.includes('language') || q.includes('english') || q.includes('русский') || q.includes('speak')) && mode === 'about') {
        const languages = currentKnowledgeBase.filter(c => c.tag === 'Languages' || c.concept.includes('Язык') || c.concept.includes('Language'));
        if (languages.length > 0) {
          const response = generateResponse(query, languages, mode, language);
          const assistantMsg: Message = {
            role: 'assistant',
            content: response.text,
            sources: [{ id: 1, tag: 'Profile', concept: language === 'en' ? 'LinkedIn Profile' : 'Профиль LinkedIn', url: 'https://linkedin.com/in/dizel0110' }],
            timestamp: Date.now(),
            mode
          };
          setMessagesByModeAndLang(prev => ({
            ...prev,
            [mode]: {
              ...prev[mode],
              [language]: [...prev[mode][language], assistantMsg]
            }
          }));
          setIsTyping(false);
          return;
        }
      }

      // "Как связаться?" → Контакты
      if ((q.includes('как связ') || q.includes('contact') || q.includes('email') || q.includes('telegram') || q.includes('linkedin') || q.includes('instagram')) && mode === 'about') {
        const contacts = currentKnowledgeBase.filter(c => c.tag === 'Contact' || c.concept.includes('GitHub'));
        if (contacts.length > 0) {
          const response = generateResponse(query, contacts, mode, language);
          const assistantMsg: Message = {
            role: 'assistant',
            content: response.text,
            sources: contacts.map(c => ({ ...c, url: c.url || 'https://github.com/dizel0110' })),
            timestamp: Date.now(),
            mode
          };
          setMessagesByModeAndLang(prev => ({
            ...prev,
            [mode]: {
              ...prev[mode],
              [language]: [...prev[mode][language], assistantMsg]
            }
          }));
          setIsTyping(false);
          return;
        }
      }

      // "Какие навыки?" → Skills
      if ((q.includes('какие навык') || q.includes('what skill') || q.includes('skills')) && mode === 'about') {
        const skills = currentKnowledgeBase.filter(c => c.tag === 'Skills');
        if (skills.length > 0) {
          const response = generateResponse(query, skills, mode, language);
          const assistantMsg: Message = {
            role: 'assistant',
            content: response.text,
            sources: [{ id: 1, tag: 'Profile', concept: language === 'en' ? 'LinkedIn Profile' : 'Профиль LinkedIn', url: 'https://linkedin.com/in/dizel0110' }],
            timestamp: Date.now(),
            mode
          };
          setMessagesByModeAndLang(prev => ({
            ...prev,
            [mode]: {
              ...prev[mode],
              [language]: [...prev[mode][language], assistantMsg]
            }
          }));
          setIsTyping(false);
          return;
        }
      }

      // Если есть хорошие совпадения — используем локальную базу (порог 8 вместо 10)
      if (localResults.length > 0 && (localResults[0].score ?? 0) >= 8) {
        // Для vafe и about используем локальную базу
        const response = generateResponse(query, localResults, mode, language);

        const assistantMsg: Message = {
          role: 'assistant',
          content: response.text,
          sources: response.sources,
          timestamp: Date.now(),
          mode
        };

        setMessagesByModeAndLang(prev => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            [language]: [...prev[mode][language], assistantMsg]
          }
        }));
      } else {
        // Иначе используем AI с интернетом (для всех режимов)
        const knowledgeContext = localResults
          .map(r => `${r.concept}: ${r.description || r.physics || r.mechanics || ''}`)
          .join('\n');

        // Передаём режим в generateAIResponse для правильного роутинга
        const aiResponse = await generateAIResponse(query, knowledgeContext, mode);

        const assistantMsg: Message = {
          role: 'assistant',
          content: aiResponse.text,
          sources: (aiResponse.sources || []) as Concept[],
          timestamp: Date.now(),
          mode
        };

        setMessagesByModeAndLang(prev => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            [language]: [...prev[mode][language], assistantMsg]
          }
        }));
      }
    } catch (error) {
      console.error('Error generating response:', error);

      const errorMessages = {
        en: {
          vafe: 'Error generating kiting response. Try asking about technique, maneuvers, or wind physics.',
          about: 'Error generating portfolio response. Try asking about projects, skills, or contacts.',
          general: 'Error generating response. Please rephrase your question or try another topic.'
        },
        ru: {
          vafe: 'Ошибка генерации ответа о кайтбординге. Спросите о технике, манёврах или физике ветра.',
          about: 'Ошибка генерации ответа о портфолио. Спросите о проектах, навыках или контактах.',
          general: 'Ошибка генерации ответа. Перефразируйте вопрос или попробуйте другую тему.'
        }
      };

      const errorMsg: Message = {
        role: 'assistant',
        content: errorMessages[language][mode],
        timestamp: Date.now(),
        mode,
        sources: []
      };

      setMessagesByModeAndLang(prev => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          [language]: [...prev[mode][language], errorMsg]
        }
      }));
    }

    setIsTyping(false);
  };

  const handleSuggestion = (suggestion: string) => {
    setUsedSuggestions(prev => new Set(prev).add(suggestion));
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  const clearHistory = () => {
    setMessagesByModeAndLang(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [language]: []
      }
    }));
    setUsedSuggestions(new Set()); // Сбрасываем использованные подсказки
  };

  const avatarUrl = GITHUB_AVATAR_URL;
  const t = TRANSLATIONS[language];

  // Статистика для инвесторов (обновляется при открытии чата)
  const [rateLimitStats, setRateLimitStats] = useState<{
    percentageUsed: number
    remaining: number
  } | null>(null)

  // Загружаем статистику при монтировании и при открытии чата
  useEffect(() => {
    if (isOpen) {
      getRateLimitStats().then(setRateLimitStats)
    }
  }, [isOpen])

  return (
    <>
      {/* Кнопка открытия */}
      <button
        className="vafe-chat-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat"
        title="Open chat"
        style={{ background: currentMode.gradient }}
      >
        {currentMode.icon}
      </button>

      {/* Окно чата */}
      {isOpen && (
        <div className="vafe-chat-window" ref={chatContainerRef}>
          <div
            className="vafe-chat-header"
            style={{ background: currentMode.gradient }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '2px solid white',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=D+Z&background=7c3aed&color=fff';
                }}
              />
              <div>
                <h3>{t.titles[mode]}</h3>
                <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  {t.descriptions[mode]}
                </p>
                {/* Metadata для инвесторов */}
                {rateLimitStats && (
                  <p style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px' }}>
                    📊 {rateLimitStats.percentageUsed}% ({rateLimitStats.remaining} ост.) • Tavily AI
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {currentMessages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="vafe-clear"
                  title="Clear history"
                >
                  🗑️
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="vafe-close">×</button>
            </div>
          </div>

          {/* Переключатель режимов */}
          <div className="vafe-mode-switcher">
            {(['vafe', 'about', 'general'] as ChatMode[]).map(m => (
              <button
                key={m}
                className={`vafe-mode-btn ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
                title={t.modes[m]}
              >
                {MODES[m].icon}
              </button>
            ))}
            {/* Переключатель языка */}
            <button
              className="vafe-lang-btn"
              onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              title={`Switch to ${language === 'en' ? 'Russian' : 'English'}`}
            >
              {language === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}
            </button>
          </div>

          {/* Переключатель поисковика */}
          <div className="vafe-search-switcher" style={{
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              gap: '6px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {(Object.keys(SEARCH_PROVIDERS) as SearchProvider[]).map(provider => {
                const config = SEARCH_PROVIDERS[provider];
                const isActive = searchProvider === provider;
                return (
                  <button
                    key={provider}
                    onClick={() => setSearchProvider(provider)}
                    title={`${config.name} — ${config.description}`}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      background: isActive ? config.icon === '⚡' ? '#e11d48' : '#0ea5e9' : 'transparent',
                      color: isActive ? 'white' : '#94a3b8',
                      border: `1px solid ${isActive ? 'transparent' : '#475569'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{config.icon}</span>
                    <span style={{ display: window.innerWidth < 768 ? 'none' : 'inline' }}>{config.name}</span>
                  </button>
                );
              })}
            </div>
            <p style={{
              fontSize: '10px',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '4px'
            }}>
              {SEARCH_PROVIDERS[searchProvider].description}
              {searchProvider === 'tavily' && (
                <span> • 📊 {rateLimitStats ? `${rateLimitStats.percentageUsed}% использовано` : 'Загрузка...'}</span>
              )}
            </p>
          </div>

          <div className="vafe-chat-messages">
            {currentMessages.length === 0 && (
              <div className="vafe-welcome">
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{currentMode.icon}</div>
                <h4>{language === 'en' ? 'Welcome!' : 'Добро пожаловать!'}</h4>
                <p>{t.welcome[mode]}</p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '10px' }}>
                  📊 {language === 'en' ? 'Knowledge base' : 'База знаний'}: {currentKnowledgeBase.length} {language === 'en' ? 'records' : 'записей'}
                </p>
              </div>
            )}

            {currentMessages.map((msg, i) => (
              <div key={`${msg.timestamp}-${i}`} className={`vafe-message ${msg.role}`}>
                <div className="vafe-avatar" style={{
                  background: msg.role === 'assistant' ? currentMode.gradient : '#666'
                }}>
                  {msg.role === 'user' ? (
                    <img
                      src={avatarUrl}
                      alt="User"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User&background=666&color=fff';
                      }}
                    />
                  ) : (
                    currentMode.icon
                  )}
                </div>
                <div className="vafe-message-content">
                  <div
                    className="vafe-message-text"
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="vafe-sources">
                      <div className="vafe-sources-title" style={{ color: currentMode.color }}>
                        {language === 'en' ? '📚 Sources:' : '📚 Источники:'}
                      </div>
                      {msg.sources.map((s, j) => {
                        // Если источник — URL из интернета или локальной базы
                        const sourceUrl = s.url || (s.details && s.details.startsWith('http') ? s.details : null);

                        if (sourceUrl) {
                          return (
                            <a
                              key={j}
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="vafe-source-link"
                              style={{ color: currentMode.color }}
                            >
                              🔗 {s.concept}
                            </a>
                          );
                        }
                        // Если источника нет — показываем как тег
                        return (
                          <span key={j} className="vafe-tag" style={{ background: currentMode.color }}>{s.concept}</span>
                        );
                      })}
                    </div>
                  )}
                  <div className="vafe-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="vafe-message assistant">
                <div className="vafe-avatar" style={{ background: currentMode.gradient }}>
                  {currentMode.icon}
                </div>
                <div className="vafe-message-content">
                  <div className="vafe-typing">
                    <span className="vafe-dot"></span>
                    <span className="vafe-dot"></span>
                    <span className="vafe-dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Подсказки - видны всегда */}
          <div className="vafe-suggestions-container">
            <div className="vafe-suggestions">
              {currentSuggestions.map((s: string) => {
                const isUsed = usedSuggestions.has(s);
                return (
                  <button
                    key={s}
                    className={`vafe-chip ${isUsed ? 'used' : ''}`}
                    onClick={() => handleSuggestion(s)}
                    style={{
                      borderColor: isUsed ? '#94a3b8' : currentMode.color,
                      color: isUsed ? '#94a3b8' : currentMode.color,
                      background: isUsed ? 'rgba(148, 163, 184, 0.1)' : 'transparent',
                      cursor: isUsed ? 'default' : 'pointer'
                    }}
                  >
                    {isUsed ? '✓ ' : ''}{s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="vafe-input-area">
            <input
              type="text"
              className="vafe-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.inputPlaceholder[mode]}
            />
            <button
              className="vafe-send"
              onClick={handleSend}
              style={{ background: currentMode.gradient }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
