/**
 * Определение языка запроса
 */
function detectLanguage(query: string): 'en' | 'ru' {
  const enPattern = /[a-zA-Z]/;
  const ruPattern = /[а-яА-ЯёЁ]/;

  // Считаем буквы каждого языка
  const enCount = (query.match(enPattern) || []).length;
  const ruCount = (query.match(ruPattern) || []).length;

  if (ruCount > enCount) return 'ru';
  if (enCount > ruCount) return 'en';
  return 'en'; // По умолчанию английский
}

/**
 * AI-сервис для общего чата
 * Использует V-AFE API (Vercel + Gemini) для режима "general"
 * Режим "О себе" и "Кайтинг" работают ТОЛЬКО по локальной базе
 */

export interface AIResponse {
  text: string;
  sources?: Array<{ id?: number; tag?: string; concept: string; url?: string; details?: string }>;
  searchQuery?: string;
}

// === V-AFE API CONFIGURATION ===
const VAFE_API_URL = 'https://vafe-api.vercel.app/api/v1/chat';

/**
 * Вызов V-AFE API (Gemini через Vercel)
 * Возвращает ответ + источники из Tavily
 */
async function callVafeApi(
  message: string,
  mode: 'vafe' | 'about' | 'general',
  searchProvider: 'duckduckgo' | 'tavily' | 'huggingface' | 'hybrid' | 'concepts' = 'hybrid'
): Promise<{ text: string, sources: Array<{ title: string; url: string; snippet: string }> }> {
  try {
    console.log('[V-AFE API] Вызов API:', { message, mode, searchProvider });

    const response = await fetch(VAFE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        mode,
        search_provider: searchProvider,  // ← Передаём поисковик
        use_rag: mode !== 'general' || searchProvider === 'concepts' || searchProvider === 'hybrid'
      }),
    });

    console.log('[V-AFE API] Status:', response.status);

    if (!response.ok) {
      throw new Error(`V-AFE API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[V-AFE API] Response:', data);

    // Возвращаем ответ + источники
    return {
      text: data.answer || data.response || data.message || 'No response from API',
      sources: data.sources || []
    };
  } catch (error) {
    console.error('[V-AFE API] Error:', error);
    // Пробрасываем ошибку для fallback
    throw error;
  }
}

/**
 * Поиск через DuckDuckGo (HTML парсинг через CORS-прокси)
 */
async function searchDuckDuckGo(query: string): Promise<{ title: string; snippet: string; url: string }[]> {
  try {
    // Используем CORS-прокси для обхода ограничений
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(proxyUrl + encodeURIComponent(ddgUrl));
    
    if (!response.ok) {
      throw new Error('DuckDuckGo fetch error');
    }
    
    const html = await response.text();
    const results: Array<{ title: string; snippet: string; url: string }> = [];
    
    // Парсим результаты из HTML
    const resultRegex = /<a class="result__a" href="([^"]+)">([^<]+)<\/a>[\s\S]*?<a class="result__snippet" href="[^"]*">([^<]*)/gi;
    let match;
    let count = 0;
    
    while ((match = resultRegex.exec(html)) !== null && count < 5) {
      const url = match[1];
      const title = match[2].replace(/<[^>]*>/g, '').trim();
      const snippet = match[3] ? match[3].replace(/<[^>]*>/g, '').trim() : '';
      
      if (url && !url.includes('duckduckgo.com')) {
        results.push({ title, snippet, url });
        count++;
      }
    }
    
    return results;
  } catch (error) {
    console.warn('DuckDuckGo search failed:', error);
    return [];
  }
}

/**
 * Поиск через SearXNG (публичные инстансы)
 */
async function searchSearXNG(query: string): Promise<{ title: string; snippet: string; url: string }[]> {
  try {
    // Публичные SearXNG инстансы
    const instances = [
      'https://searx.be',
      'https://searx.org'
    ];
    
    for (const instance of instances) {
      try {
        const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json`;
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        return (data.results || []).slice(0, 5).map((r: any) => ({
          title: r.title,
          snippet: r.content || r.snippet || '',
          url: r.url
        }));
      } catch {
        continue;
      }
    }
    
    return [];
  } catch (error) {
    console.warn('SearXNG search failed:', error);
    return [];
  }
}

/**
 * Поиск через Wikipedia API (бесплатно, без ключа)
 */
async function searchWikipedia(query: string): Promise<{ title: string; snippet: string; url: string }[]> {
  try {
    const lang = /[а-яА-ЯёЁ]/.test(query) ? 'ru' : 'en';
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Wikipedia API error');
    
    const data = await response.json();
    return (data.query?.search || []).slice(0, 3).map((r: any) => ({
      title: r.title,
      snippet: r.snippet.replace(/<[^>]*>/g, ''),
      url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`
    }));
  } catch (error) {
    console.warn('Wikipedia search failed:', error);
    return [];
  }
}

/**
 * Генерация ответа через бесплатную LLM (HuggingFace без ключа)
 */
async function generateWithLLM(prompt: string, context?: string, language?: 'en' | 'ru'): Promise<string> {
  try {
    // Используем модель, доступную без ключа
    const model = 'google/gemma-2b-it';

    const lang = language || detectLanguage(prompt);
    const systemPrompt = lang === 'en'
      ? 'You are a helpful assistant. Answer briefly and informatively in English.'
      : 'Ты полезный ассистент. Отвечай кратко, информативно, на русском языке.';

    const fullPrompt = context
      ? `${systemPrompt}\n\nContext: ${context}\n\nQuestion: ${prompt}\n\nAnswer:`
      : `${systemPrompt}\n\nQuestion: ${prompt}\n\nAnswer:`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 400,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false,
            do_sample: true
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('LLM API error');
    }

    const result = await response.json();
    if (Array.isArray(result) && result[0]?.generated_text) {
      // Очищаем ответ от повторяющегося промпта
      let text = result[0].generated_text;
      const answerMarker = lang === 'en' ? 'Answer:' : 'Ответ:';
      if (text.includes(answerMarker)) {
        text = text.split(answerMarker).pop() || text;
      }
      return text.trim();
    }

    return lang === 'en' ? 'Failed to generate response.' : 'Не удалось сгенерировать ответ.';
  } catch (error) {
    console.warn('LLM generation failed, using fallback:', error);
    return generateFallbackResponse(prompt);
  }
}

/**
 * Умный fallback-ответ с контекстной информацией
 */
function generateFallbackResponse(query: string, searchResults?: Array<{ title: string; snippet: string; url: string }>): string {
  const q = query.toLowerCase();
  const lang = detectLanguage(query);

  // === Базовые приветствия и вопросы ===
  if (q.includes('привет') || q.includes('здравствуй') || q.includes('hello') || q.includes('hi ')) {
    return lang === 'en'
      ? 'Hello! I\'m Dmitry\'s AI assistant. I can tell you about him, his projects, or answer kitesurfing questions. What interests you?'
      : 'Привет! Я AI-ассистент Дмитрия. Могу рассказать о нём, его проектах или ответить на вопросы о кайтбординге. Что вас интересует?';
  }

  if (q.includes('как дела') || q.includes('как ты') || q.includes('how are you') || q.includes('how\'s it')) {
    return lang === 'en'
      ? 'Great, thanks! Working on improving my responses. Ask away — I\'ll try to help!'
      : 'Спасибо, отлично! Работаю над улучшением ответов. Задавайте вопросы — постараюсь помочь!';
  }

  if (q.includes('кто ты') || q.includes('что ты') || q.includes('who are you') || q.includes('what are you')) {
    return lang === 'en'
      ? 'I\'m a chat assistant on Dmitry Zelenin\'s website. I work on a RAG system with access to a knowledge base about projects, skills, and kitesurfing.'
      : 'Я чат-ассистент на сайте Дмитрия Зеленина. Работаю на базе RAG-системы с доступом к базе знаний о проектах, навыках и кайтбординге.';
  }

  // === Время и дата ===
  if (q.includes('время') || q.includes('который час') || q.includes('what time') || q.includes('current time')) {
    const now = new Date();
    return lang === 'en'
      ? `It's ${now.toLocaleTimeString('en-US')}. In El Gouna (Egypt, UTC+2) the time is different from yours.`
      : `Сейчас ${now.toLocaleTimeString('ru-RU')}. В El Gouna (Египет, UTC+2) время отличается от вашего.`;
  }

  if (q.includes('дата') || q.includes('число') || q.includes('what date') || q.includes('today is')) {
    const now = new Date();
    return lang === 'en'
      ? `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`
      : `Сегодня ${now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
  }

  // === Погода и ветер ===
  if (q.includes('погод') || q.includes('ветер') || q.includes('weather') || q.includes('wind')) {
    return lang === 'en'
      ? 'In El Gouna (Egypt), where Dmitry lives, there are about 270 windy days per year — perfect conditions for kitesurfing! 🪁 Average water temperature +25°C, air +30°C.'
      : 'В El Gouna (Египет), где живёт Дмитрий, около 270 ветреных дней в году — идеальные условия для кайтбординга! 🪁 Средняя температура воды +25°C, воздуха +30°C.';
  }

  // === Вопросы о Дмитрии — перенаправляем в режим "О себе" ===
  const aboutKeywords = ['димитр', 'димитрий', 'дмитри', 'зеленин', 'dizel', 'автор', 'владелец', 'создатель', 'dmitry', 'zelenin'];
  if (aboutKeywords.some(k => q.includes(k))) {
    return lang === 'en'
      ? 'For detailed information about me, switch to **"About"** mode (👤 button at top of chat). There you\'ll find projects, skills, contacts, and education.'
      : 'Для подробной информации обо мне переключитесь в режим **"О себе"** (кнопка 👤 вверху чата). Там вы найдёте проекты, навыки, контакты и образование.';
  }

  // === Вопросы о проектах — перенаправляем в режим "О себе" ===
  const projectKeywords = ['твой проект', 'твои проект', 'ваш проект', 'ваши проект', 'что сделал', 'что создал', 'your project', 'your projects', 'what did you build'];
  if (projectKeywords.some(k => q.includes(k))) {
    return lang === 'en'
      ? 'Dmitry has several projects: V-AFE (AI kitesurfing instructor), AI PROPHET (multimodal agent), NEWS-RECOMMENDER, ITMO MedTech. Switch to **"About"** mode for details.'
      : 'У Дмитрия несколько проектов: V-AFE (AI инструктор по кайтбордингу), AI PROPHET (мультимодальный агент), NEWS-RECOMMENDER, ITMO MedTech. Переключитесь в режим **"О себе"** для деталей.';
  }

  // === Если есть результаты поиска — используем их ===
  if (searchResults && searchResults.length > 0) {
    let response = lang === 'en' ? `Here\'s what I found for your query:\n\n` : `Вот что я нашёл по вашему запросу:\n\n`;

    searchResults.slice(0, 3).forEach((r, i) => {
      response += `**${i + 1}. ${r.title}**\n`;
      if (r.snippet) {
        response += `   ${r.snippet}\n`;
      }
      if (r.url) {
        response += `   🔗 ${r.url}\n`;
      }
      response += '\n';
    });

    if (searchResults.length > 3) {
      response += lang === 'en' ? `...and ${searchResults.length - 3} more results.\n` : `...и ещё ${searchResults.length - 3} результатов.\n`;
    }

    return response;
  }

  // === Дефолтный ответ ===
  return lang === 'en'
    ? `Interesting question! 🔍\n\nI can help with:\n\n• **Dmitry and projects** — switch to "About" mode (👤)\n• **Kitesurfing** — switch to "Kiting" mode (🪁)\n• **General questions** — I\'ll search the internet\n\nTry rephrasing your question or choose a specific mode!`
    : `Интересный вопрос! 🔍\n\nЯ могу помочь с:\n\n• **Дмитрий и проекты** — переключитесь в режим "О себе" (👤)\n• **Кайтбординг** — переключитесь в режим "Кайтинг" (🪁)\n• **Общие вопросы** — я поищу в интернете\n\nПопробуйте перефразировать вопрос или выбрать конкретный режим!`;
}

/**
 * Основная функция для генерации AI-ответа в ОБЩЕМ режиме
 * НЕ используется в режимах "vafe" и "about"
 *
 * Приоритет:
 * 1. V-AFE API (Gemini через Vercel) — для общих вопросов
 * 2. Fallback: DuckDuckGo + Wikipedia + HuggingFace
 */
export async function generateAIResponse(
  query: string,
  _knowledgeContext: string,
  mode: 'vafe' | 'about' | 'general' = 'general',
  searchProvider: 'duckduckgo' | 'tavily' | 'huggingface' | 'hybrid' | 'concepts' = 'hybrid'
): Promise<AIResponse> {
  const q = query.toLowerCase();
  const lang = detectLanguage(query);

  console.log('[generateAIResponse] Вызов:', { query, mode, lang });

  // === Для режимов "vafe" и "about" — перенаправляем на локальную базу ===
  // Эти режимы должны обрабатываться в VafeChatWidget.tsx
  if (mode === 'vafe') {
    return {
      text: lang === 'en'
        ? 'For kitesurfing questions, use **"Kiting"** mode (🪁). Local knowledge base with 34 concepts.'
        : 'Для вопросов о кайтбординге используйте режим **"Кайтинг"** (🪁). Локальная база из 34 концептов.',
      sources: [{ id: 0, tag: 'Info', concept: lang === 'en' ? 'Use Kiting Mode' : 'Используйте режим Кайтинг' }]
    };
  }

  if (mode === 'about') {
    return {
      text: lang === 'en'
        ? 'For portfolio questions, use **"Projects"** mode (👤). Local knowledge base with 24 concepts.'
        : 'Для вопросов о портфолио используйте режим **"Проекты"** (👤). Локальная база из 24 концептов.',
      sources: [{ id: 0, tag: 'Info', concept: lang === 'en' ? 'Use Projects Mode' : 'Используйте режим Проекты' }]
    };
  }

  // === Режим "general" — сначала пробуем V-AFE API ===
  try {
    console.log('[generateAIResponse] Вызов V-AFE API...', { searchProvider });
    const apiResponse = await callVafeApi(query, 'general', searchProvider);
    console.log('[generateAIResponse] Получен ответ от API:', apiResponse);

    // Преобразуем источники из API в формат виджета
    const sources = (apiResponse.sources || []).map(s => ({
      id: 0,
      tag: 'Web',
      concept: s.title,
      url: s.url,
      details: s.snippet
    }));

    return {
      text: apiResponse.text,
      sources: sources,
      searchQuery: query
    };
  } catch (error) {
    console.warn('[generateAIResponse] V-AFE API недоступен, используем fallback:', error);
    // Fallback на старый механизм с поиском
  }

  // === "Расскажи о проектах" — возвращаем проекты с описаниями ===
  const projectKeywords = ['расскажи о проект', 'tell about project', 'what project', 'какие проект', 'твои проект', 'your project'];
  if (projectKeywords.some(k => q.includes(k))) {
    return {
      text: lang === 'en'
        ? '**Dmitry\'s Key Projects:**\n\n• **VORTEX-AFE** — AI kitesurfing instructor with RAG (34 concepts)\n• **AI_PROPHET** — Multimodal AI agent (Text + Vision + Voice)\n• **news-recommender** — MLOps pipeline for news (Yandex.Q & ODS.ai)\n• **ITMO** — ML Engineering projects at ITMO University\n• **Portfolio** — React + TypeScript + Vite site\n\nAll projects: github.com/dizel0110'
        : '**Проекты Дмитрия:**\n\n• **VORTEX-AFE** — AI инструктор по кайтбордингу с RAG (34 концепта)\n• **AI_PROPHET** — Мультимодальный AI-агент (Text + Vision + Voice)\n• **news-recommender** — MLOps пайплайн (Яндекс.Кью & ODS.ai)\n• **ITMO** — ML Engineering проекты в ИТМО\n• **Portfolio** — React + TypeScript + Vite сайт\n\nВсе проекты: github.com/dizel0110',
      sources: [
        { id: 1, tag: 'Project', concept: 'VORTEX-AFE', url: 'https://github.com/dizel0110/VORTEX-AFE' },
        { id: 2, tag: 'Project', concept: 'AI_PROPHET', url: 'https://github.com/dizel0110/AI_PROPHET' },
        { id: 3, tag: 'Project', concept: 'news-recommender', url: 'https://github.com/dizel0110/news-recommender' },
        { id: 4, tag: 'Project', concept: 'ITMO', url: 'https://github.com/dizel0110/ITMO' },
        { id: 5, tag: 'Project', concept: 'Portfolio', url: 'https://github.com/dizel0110/dizel0110.github.io' }
      ] as any[]
    };
  }

  // === "Опыт работы" — HARDML, ITMO ===
  const experienceKeywords = ['опыт работ', 'experience', 'education', 'образование', 'hardml', 'itmo'];
  if (experienceKeywords.some(k => q.includes(k))) {
    return {
      text: lang === 'en'
        ? '**Education & Experience:**\n\n• **HARDML** — Hardcore ML course (completed Aug 2022)\n• **ITMO University** — ML Engineering projects\n• **Self-Education** — Continuous learning in ML/AI\n\nSkills: LLM, RAG, MLOps, Computer Vision, Data Engineering'
        : '**Образование и опыт:**\n\n• **HARDML** — Хардкорный ML курс (авг 2022)\n• **ITMO University** — ML Engineering проекты\n• **Самообразование** — Постоянное изучение ML/AI\n\nНавыки: LLM, RAG, MLOps, Computer Vision, Data Engineering',
      sources: [
        { id: 1, tag: 'Education', concept: 'HARDML', url: 'https://github.com/dizel0110/HardML' },
        { id: 2, tag: 'Education', concept: 'ITMO University', url: 'https://github.com/dizel0110/ITMO' }
      ] as any[]
    };
  }

  // === "Открыт к работе?" — Availability ===
  const openToWorkKeywords = ['открыт к работ', 'open to work', 'ищу работ', 'job search', 'ваканси', 'available'];
  if (openToWorkKeywords.some(k => q.includes(k))) {
    return {
      text: lang === 'en'
        ? '**Open to Work:**\n\n• Data Scientist\n• ML Engineer\n• AI Agent Developer\n• Data Analyst\n\nFormats: Full-time, Part-time, Contract\nLocation: Remote, Hybrid, Relocation'
        : '**Открыт к работе:**\n\n• Data Scientist\n• ML Engineer\n• AI Agent Developer\n• Data Analyst\n\nФорматы: Full-time, Part-time, Contract\nЛокация: Remote, Hybrid, Relocation',
      sources: [
        { id: 1, tag: 'Availability', concept: 'Job Search', url: 'https://linkedin.com/in/dizel0110' }
      ] as any[]
    };
  }

  // === "Формат работы" — Remote/Hybrid/Relocation ===
  const formatKeywords = ['формат работ', 'work format', 'remote', 'hybrid', 'relocation', 'удален', 'офис'];
  if (formatKeywords.some(k => q.includes(k))) {
    return {
      text: lang === 'en'
        ? '**Work Format:**\n\n• **Remote** — Working from anywhere\n• **Hybrid** — Mix of remote and office\n• **Relocation** — Ready to relocate\n\nFlexible schedule. Working from any timezone (currently El Gouna, Egypt).'
        : '**Формат работы:**\n\n• **Remote** — Работа из любой точки\n• **Hybrid** — Смесь удалёнки и офиса\n• **Relocation** — Готов к переезду\n\nГибкий график. Работаю из любого часового пояса (сейчас El Gouna, Египет).',
      sources: [
        { id: 1, tag: 'Availability', concept: 'Work Format', url: 'https://linkedin.com/in/dizel0110' }
      ] as any[]
    };
  }

  // === "Языки" — Russian/English ===
  const languageKeywords = ['язык', 'language', 'english', 'русский', 'speak', 'говор'];
  if (languageKeywords.some(k => q.includes(k))) {
    return {
      text: lang === 'en'
        ? '**Languages:**\n\n• **Russian** — Native\n• **English** — B1-B2 (Intermediate)\n\nFreely read documentation and papers in English. Working in international teams.'
        : '**Языки:**\n\n• **Русский** — Native (родной)\n• **English** — B1-B2 (Средний)\n\nСвободно читаю документацию и papers на английском. Работаю в международных командах.',
      sources: [
        { id: 1, tag: 'Languages', concept: 'Language Skills' }
      ] as any[]
    };
  }

  // === Вопросы о контактах — возвращаем контакты ===
  const contactKeywords = ['contact', 'contacts', 'связ', 'контакт', 'email', 'telegram', 'linkedin', 'instagram', 'github', 'phone', 'телефон', 'напиш', 'позвон'];
  if (contactKeywords.some(k => q.includes(k))) {
    return {
      text: lang === 'en'
        ? '**Contact Information:**\n\n• **Email:** dizel0110@gmail.com\n• **Telegram:** @dizel0110 (https://t.me/dizel0110)\n• **LinkedIn:** linkedin.com/in/dizel0110\n• **GitHub:** github.com/dizel0110\n• **Instagram:** instagram.com/dizel0110\n\nSwitch to **"Projects"** mode (👤) for more details.'
        : '**Контактная информация:**\n\n• **Email:** dizel0110@gmail.com\n• **Telegram:** @dizel0110 (https://t.me/dizel0110)\n• **LinkedIn:** linkedin.com/in/dizel0110\n• **GitHub:** github.com/dizel0110\n• **Instagram:** instagram.com/dizel0110\n\nПереключитесь в режим **"Проекты"** (👤) для большей информации.',
      sources: [
        { id: 1, tag: 'Contact', concept: 'Email', url: 'mailto:dizel0110@gmail.com' },
        { id: 2, tag: 'Contact', concept: 'Telegram', url: 'https://t.me/dizel0110' },
        { id: 3, tag: 'Contact', concept: 'LinkedIn', url: 'https://linkedin.com/in/dizel0110' },
        { id: 4, tag: 'Contact', concept: 'Instagram', url: 'https://instagram.com/dizel0110' }
      ] as any[]
    };
  }

  // === Вопросы о Дмитрии — НЕ ищем в интернете, только база ===
  const aboutKeywords = ['димитр', 'димитрий', 'дмитри', 'зеленин', 'dizel', 'дизель',
                         'твой проект', 'твои проект', 'ваш проект', 'ваши проект',
                         'автор', 'владелец', 'создатель', 'портфолио', 'dmitry', 'zelenin'];
  if (aboutKeywords.some(k => q.includes(k))) {
    return {
      text: lang === 'en'
        ? 'For detailed information about me, switch to **"Projects"** mode (👤 button at top of chat). There you\'ll find the full knowledge base: projects, skills, contacts, education.'
        : 'Для подробной информации обо мне переключитесь в режим **"Проекты"** (👤 вверху чата). Там вы найдёте полную базу знаний: проекты, навыки, контакты, образование.',
      sources: [{ id: 0, tag: 'Info', concept: lang === 'en' ? 'Portfolio Knowledge Base' : 'База знаний портфолио' }]
    };
  }

  // === Вопросы о кайтбординге — НЕ ищем в интернете, только V-AFE база ===
  const kiteKeywords = ['кайт', 'кайтинг', 'кайтбординг', 'ветер', 'доск', 'старт',
                        'манёвр', 'апвинд', 'оверштаг', 'зенит', 'планк', 'трапеци',
                        'вымпельн', 'чоп', 'зарезк', 'глиссир', 'kite', 'kitesurf', 'wind'];
  if (kiteKeywords.some(k => q.includes(k))) {
    return {
      text: lang === 'en'
        ? 'For kitesurfing questions, switch to **"Kiting"** mode (🪁 button at top of chat). There\'s a base of 34 concepts on physics, mechanics, and kiting technique.'
        : 'Для вопросов о кайтбординге переключитесь в режим **"Кайтинг"** (кнопка 🪁 вверху чата). Там база из 34 концептов по физике, механике и технике кайтбординга.',
      sources: [{ id: 0, tag: 'V-AFE', concept: lang === 'en' ? 'Kiting Knowledge Base' : 'База знаний кайтбординга' }]
    };
  }

  // === Для остальных вопросов — ищем в интернете ===
  try {
    // Wikipedia ищем только для конкретных тем (не для общих вопросов)
    const isSpecificQuery = q.split(/\s+/).filter(w => w.length > 3).length >= 2;
    const shouldSearchWiki = isSpecificQuery && !q.includes('привет') && !q.includes('hello') && !q.includes('как дела');

    // Параллельный поиск в нескольких источниках
    const [ddgResults, searxResults, wikiResults] = await Promise.all([
      searchDuckDuckGo(query).catch(() => []),
      searchSearXNG(query).catch(() => []),
      shouldSearchWiki ? searchWikipedia(query).catch(() => []) : []
    ]);

    // Объединяем результаты, убираем дубликаты
    const allResults = [...wikiResults, ...ddgResults, ...searxResults];

    // Фильтруем нерелевантные результаты
    const queryWords = q.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
    const relevantResults = allResults.filter(r => {
      const text = `${r.title} ${r.snippet}`.toLowerCase();
      // Результат должен содержать хотя бы одно слово из запроса
      return queryWords.some(w => text.includes(w));
    });

    const uniqueResults = Array.from(
      new Map(relevantResults.map(r => [r.url, r])).values()
    ).slice(0, 5);

    // Если есть результаты поиска — генерируем ответ с ними
    if (uniqueResults.length > 0) {
      const context = uniqueResults
        .map(r => `${r.title}: ${r.snippet}`)
        .join('\n\n');

      // Пытаемся сгенерировать ответ через LLM с указанием языка
      const llmResponse = await generateWithLLM(query, context, lang).catch(() => null);

      if (llmResponse && !llmResponse.includes('Не удалось сгенерировать') && !llmResponse.includes('Failed to generate')) {
        return {
          text: llmResponse,
          sources: uniqueResults.map(r => ({ id: 0, tag: 'Web', concept: r.title, url: r.url, details: r.snippet })),
          searchQuery: query
        };
      }

      // Fallback: показываем результаты поиска
      return {
        text: generateFallbackResponse(query, uniqueResults),
        sources: uniqueResults.map(r => ({ id: 0, tag: 'Web', concept: r.title, url: r.url, details: r.snippet })),
        searchQuery: query
      };
    }

    // Если поиск не дал результатов — fallback
    return {
      text: generateFallbackResponse(query),
      sources: [],
      searchQuery: query
    };

  } catch (error) {
    console.error('AI generation error:', error);
    return {
      text: generateFallbackResponse(query),
      sources: [],
      searchQuery: query
    };
  }
}

/**
 * Проверка доступности AI-сервиса
 */
export async function checkAIAvailability(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://api-inference.huggingface.co/status', {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Проверка доступности поиска в интернете
 */
export async function checkSearchAvailability(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://duckduckgo.com'),
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
