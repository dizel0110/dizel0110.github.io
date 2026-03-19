# 🎯 V-AFE Chat Widget — Полная инструкция по улучшению

**Для:** `dizel0110.github.io/src/components/VafeChatWidget.tsx`
**Дата:** 19.03.2026
**Статус:** ✅ API готово, ⏳ Ждёт внедрения в виджет

---

## 📋 Что уже работает в API (vafe-api.vercel.app):

| Функция | Статус | Описание |
|---------|--------|----------|
| **3 режима** | ✅ | `vafe`, `about`, `general` |
| **Системные промпты** | ✅ | Инструктор/Ассистент/Универсальный |
| **Tavily поиск** | ✅ | 2-3 источника из интернета |
| **Мультиязычность** | ✅ | RU/EN автоматически |
| **Интерактивные ссылки** | ✅ | [1], [2], [3] в тексте + список |
| **CORS** | ✅ | Разрешено для dizel0110.github.io |
| **Metadata** | ✅ | sources_count, search_provider |

---

## 🔧 1. Проверь API URL и mode

### Открой `VafeChatWidget.tsx`:

```bash
code d:\ai\dizel0110.github.io\src\components\VafeChatWidget.tsx
```

### Найди где отправляется запрос:

```typescript
// ✅ ПРАВИЛЬНО:
const API_URL = 'https://vafe-api.vercel.app/api/v1/chat'

const response = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userInput,
    mode: currentMode,  // ← "vafe" | "about" | "general"
    use_rag: false
  })
})
```

### Если не так — исправь:

| Режим в виджете | Должно быть |
|----------------|-------------|
| Кайтинг | `mode: "vafe"` |
| О себе | `mode: "about"` |
| Общий | `mode: "general"` |

---

## 📚 2. Отображение источников

### Найди где отображается ответ:

```typescript
// В компоненте Message или где рендерится answer
<div className="message-content">
  {message.content}
  
  {/* ← ДОБАВЬ ЭТО */}
  {message.sources && message.sources.length > 0 && (
    <div className="sources mt-4 pt-4 border-t">
      <h4 className="text-sm font-semibold mb-2">📚 Источники:</h4>
      {message.sources.map((source, i) => (
        <div key={i} className="text-sm mb-2">
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {i + 1}. {source.title}
          </a>
          {source.snippet && (
            <p className="text-gray-600 ml-6">{source.snippet.slice(0, 150)}...</p>
          )}
        </div>
      ))}
    </div>
  )}
</div>
```

---

## 🛡️ 3. Rate Limiter (1000 запросов/мес)

### Добавь в начало файла (после импортов):

```typescript
// === RATE LIMITER ===
const RATE_LIMIT_KEYS = {
  GLOBAL: 'vafe-global-month',
  USER: 'vafe-user-day',
  LAST_CHECK: 'vafe-last-check'
}

const LIMITS = {
  MONTHLY: 1000,
  DAILY_PER_USER: 30,
  WARNING_AT: 800,
  CRITICAL_AT: 950
}

function getMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getDayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function checkRateLimit(): {
  allowed: boolean
  remaining: number
  warning?: string
  resetDate?: string
} {
  const monthKey = getMonthKey()
  const dayKey = getDayKey()
  
  // Проверяем, не сменился ли месяц
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
  
  // Месячный лимит
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
  
  // Дневной лимит
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
  
  // Предупреждения
  let warning: string | undefined
  
  if (globalCount >= LIMITS.CRITICAL_AT) {
    warning = `⚠️ Осталось ${remainingMonthly} запросов до конца месяца. Используйте экономно.`
  } else if (globalCount >= LIMITS.WARNING_AT) {
    warning = `ℹ️ Израсходовано ${Math.round((globalCount / LIMITS.MONTHLY) * 100)}% месячного лимита (${globalCount}/${LIMITS.MONTHLY})`
  }
  
  // Увеличиваем счётчики
  localStorage.setItem(RATE_LIMIT_KEYS.GLOBAL, String(globalCount + 1))
  localStorage.setItem(userKey, String(userCount + 1))
  
  return {
    allowed: true,
    remaining: Math.min(remainingDaily - 1, remainingMonthly - 1),
    warning
  }
}
```

### Интегрируй в sendMessage:

```typescript
async function sendMessage(message: string, mode: string) {
  // === ПРОВЕРКА ЛИМИТА ===
  const rateLimit = checkRateLimit()
  
  // Показываем предупреждение
  if (rateLimit.warning) {
    const warningMessage: ChatMessage = {
      role: 'system',
      content: rateLimit.warning,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, warningMessage])
    
    if (!rateLimit.allowed) {
      setIsLoading(false)
      return
    }
  }
  
  // ... остальной код отправки
}
```

---

## 📊 4. Статистика для инвесторов (опционально)

### Добавь в компонент:

```typescript
// В состоянии:
const [apiMetadata, setApiMetadata] = useState<{
  sources_count: number
  search_provider: string
  multi_language: boolean
} | null>(null)

// После получения ответа:
if (response.metadata) {
  setApiMetadata({
    sources_count: response.metadata.sources_count,
    search_provider: response.metadata.search_provider,
    multi_language: response.metadata.multi_language
  })
}

// В UI (где-то в footer виджета):
{apiMetadata && (
  <div className="text-xs text-gray-400 mt-2">
    💡 {apiMetadata.search_provider} ({apiMetadata.sources_count} ист.) • 
    AI: Gemini
  </div>
)}
```

---

## 🧪 5. Тестирование

### Запусти локально:

```bash
cd d:\ai\dizel0110.github.io
npm run dev
```

### Проверь:

1. **3 режима:**
   - Кайтинг → `mode: "vafe"` → ответ инструктора
   - О себе → `mode: "about"` → ответ ассистента
   - Общий → `mode: "general"` → универсальный ответ

2. **Источники:**
   - Спроси: "Что такое Gemini?"
   - Должны быть [1], [2] в тексте
   - В конце: 📚 Источники со ссылками

3. **Rate Limiter:**
   - Открой консоль → Application → Local Storage
   - Посмотри `vafe-global-month`
   - Поставь 950 → должно быть предупреждение

---

## 📁 Файлы для копирования:

### Тесты (сохранены):

```
d:\ai\dizel0110.github.io\tests\
├── test_gemini.py              # Тест Gemini API
├── test_gemini_models.py       # Тест моделей
└── test_web_search.py          # Тест Tavily
```

### Инструкции:

```
d:\ai\dizel0110.github.io\.internal\
├── _RATE_LIMITER_INSTRUCTION.md    # Код rate limiter
├── _CHAT_WIDGET_FIX_INSTRUCTION.md # Проверка виджета
└── _PROJECTS_AUDIT_2026_03_19.md   # Аудит проектов
```

---

## ✅ Чек-лист внедрения:

- [x] Проверил API URL (`https://vafe-api.vercel.app`)
- [x] Проверил передачу `mode` (vafe/about/general)
- [x] Добавил отображение источников
- [x] Добавил rate limiter (1000/мес, 30/день)
- [x] Добавил metadata для инвесторов
- [ ] Протестировал все 3 режима
- [ ] Протестировал источники
- [ ] Протестировал предупреждения
- [ ] Проверил Tavily Dashboard (app.tavily.com)

---

## 🔗 Ссылки:

- **API Dashboard:** https://vercel.com/dizel0110/vafe-api
- **Tavily Dashboard:** https://app.tavily.com ← **Проверь использование!**
- **Тесты:** `d:\ai\dizel0110.github.io\tests\`
- **Tavily Usage:** `_TAVILY_USAGE_CHECK.md` ← **Как проверить**

---

**После внедрения — чат будет работать на 100%!** 🚀
