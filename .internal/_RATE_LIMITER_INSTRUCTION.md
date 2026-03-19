# 🛡️ V-AFE Rate Limiter — Инструкция

**Для:** `dizel0110.github.io/src/components/VafeChatWidget.tsx`
**Дата:** 19.03.2026
**Лимит:** 1000 запросов/мес (Tavily AI free tier)

---

## 📊 Логика распределения

```
Месячный лимит: 1000 запросов

Дни в месяце: ~30
→ На день: ~33 запроса

На пользователя: до 30/день
→ Если пользователей мало: каждый получает до 30
→ Если пользователей много: каждый получает меньше
```

---

## 💻 Код для виджета

### Шаг 1: Добавь функции rate limiter

В начало файла (после импортов):

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
  WARNING_AT: 800,    // 80% — мягкое предупреждение
  CRITICAL_AT: 950    // 95% — критическое предупреждение
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
  
  // 1. Проверяем, не сменился ли месяц
  const lastCheck = localStorage.getItem(RATE_LIMIT_KEYS.LAST_CHECK)
  if (lastCheck !== monthKey) {
    // Новый месяц — сбрасываем счётчики
    localStorage.setItem(RATE_LIMIT_KEYS.GLOBAL, '0')
    localStorage.setItem(RATE_LIMIT_KEYS.LAST_CHECK, monthKey)
  }
  
  // 2. Считаем глобальные запросы за месяц
  const globalCount = parseInt(localStorage.getItem(RATE_LIMIT_KEYS.GLOBAL) || '0')
  
  // 3. Считаем личные запросы пользователя за сегодня
  const userKey = `${RATE_LIMIT_KEYS.USER}-${dayKey}`
  const userCount = parseInt(localStorage.getItem(userKey) || '0')
  
  // 4. Вычисляем оставшиеся запросы
  const remainingMonthly = LIMITS.MONTHLY - globalCount
  const remainingDaily = LIMITS.DAILY_PER_USER - userCount
  
  // 5. Проверяем месячный лимит
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
  
  // 6. Проверяем дневной лимит пользователя
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
  
  // 7. Проверяем предупреждения
  let warning: string | undefined
  
  if (globalCount >= LIMITS.CRITICAL_AT) {
    warning = `⚠️ Осталось ${remainingMonthly} запросов до конца месяца. Используйте экономно.`
  } else if (globalCount >= LIMITS.WARNING_AT) {
    warning = `ℹ️ Израсходовано ${Math.round((globalCount / LIMITS.MONTHLY) * 100)}% месячного лимита (${globalCount}/${LIMITS.MONTHLY})`
  }
  
  // 8. Увеличиваем счётчики
  localStorage.setItem(RATE_LIMIT_KEYS.GLOBAL, String(globalCount + 1))
  localStorage.setItem(userKey, String(userCount + 1))
  
  return {
    allowed: true,
    remaining: Math.min(remainingDaily - 1, remainingMonthly - 1),
    warning
  }
}

function getRateLimitStats() {
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
  
  const globalCount = parseInt(localStorage.getItem(RATE_LIMIT_KEYS.GLOBAL) || '0')
  
  return {
    month: monthKey,
    totalRequests: globalCount,
    percentageUsed: Math.round((globalCount / LIMITS.MONTHLY) * 100),
    remaining: LIMITS.MONTHLY - globalCount
  }
}
```

---

### Шаг 2: Интегрируй в отправку запроса

Найди функцию `sendMessage` или где отправляется запрос к API:

```typescript
async function sendMessage(message: string, mode: string) {
  // === ПРОВЕРКА ЛИМИТА ===
  const rateLimit = checkRateLimit()
  
  // Показываем предупреждение (даже если разрешено)
  if (rateLimit.warning) {
    const warningMessage: ChatMessage = {
      role: 'system',
      content: rateLimit.warning,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, warningMessage])
    
    // Если не разрешено — останавливаемся
    if (!rateLimit.allowed) {
      setIsLoading(false)
      return
    }
  }
  
  // ... остальной код отправки запроса
}
```

---

### Шаг 3: Добавь отображение статистики (опционально)

В компонент виджета (где-то в углу):

```typescript
// В состоянии добавь:
const [stats, setStats] = useState<{percentageUsed: number, remaining: number} | null>(null)

// В useEffect (после монтирования):
useEffect(() => {
  const s = getRateLimitStats()
  setStats({
    percentageUsed: s.percentageUsed,
    remaining: s.remaining
  })
}, [])

// В JSX (где-то в header виджета):
{stats && (
  <div className="text-xs text-gray-500">
    📊 Лимит: {stats.percentageUsed}% ({stats.remaining} ост.)
  </div>
)}
```

---

## 🎨 Примеры сообщений пользователям

### ✅ Всё хорошо (0-80%):
```
[Запрос отправляется без сообщений]
```

### ⚠️ Предупреждение (80-95%):
```
ℹ️ Израсходовано 85% месячного лимита (850/1000)
```

### 🔴 Критическое (95-100%):
```
⚠️ Осталось 45 запросов до конца месяца. Используйте экономно.
```

### ❌ Лимит исчерпан (100%):
```
🔴 Лимит запросов исчерпан на этот месяц. Следующее обновление: 01.04.2026
```

### ❌ Дневной лимит пользователя:
```
⚠️ Вы исчерпали дневной лимит (30/30). Попробуйте завтра.
```

---

## 📊 Для инвесторов (админка)

Добавь скрытую команду для просмотра статистики:

```typescript
// По двойному клику на header виджета:
function showAdminStats() {
  const stats = getRateLimitStats()
  alert(`
V-AFE Statistics:
━━━━━━━━━━━━━━━━
Month: ${stats.month}
Requests: ${stats.totalRequests}/${LIMITS.MONTHLY}
Used: ${stats.percentageUsed}%
Remaining: ${stats.remaining}

Unique users: (localStorage analysis needed)
  `)
}
```

---

## 🔗 Ссылки

- **Tavily Dashboard:** https://app.tavily.com
- **Vercel Analytics:** https://vercel.com/dizel0110/vafe-api/analytics

---

## ✅ Чек-лист

- [ ] Добавил функции rate limiter
- [ ] Интегрировал проверку в `sendMessage`
- [ ] Предупреждения показываются корректно
- [ ] Статистика видна в UI (опционально)
- [ ] Протестировал все сценарии (0%, 80%, 95%, 100%)

---

**После внедрения — лимит 1000/мес будет распределяться справедливо!** 🎯
