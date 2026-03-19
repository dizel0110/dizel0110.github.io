# 📊 Tavily API — Проверка Статистики

**Дата:** 19.03.2026  
**Лимит:** 1000 запросов/месяц (Free tier)  
**Dashboard:** https://app.tavily.com

---

## 🔍 Как проверить текущее использование

### Шаг 1: Открой Tavily Dashboard

```
https://app.tavily.com
```

### Шаг 2: Войди в аккаунт

Используй GitHub или Email для входа.

### Шаг 3: Проверь Usage

В dashboard найди раздел **"Usage"** или **"API Usage"**.

**Что смотреть:**
- **Requests this month** — сколько запросов сделано в этом месяце
- **Remaining** — сколько осталось до лимита
- **Reset date** — когда сбросится счётчик

---

## 📊 Текущая конфигурация

### API ключ (уже настроен):
```
TAVILY_API_KEY=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
```

### Лимиты:
| Тариф | Лимит | Цена |
|-------|-------|------|
| **Free** | 1000 запросов/мес | $0 |
| **Starter** | 4000 запросов/мес | $30/мес |
| **Pro** | 16000 запросов/мес | $120/мес |

---

## 🛡️ Rate Limiter в виджете

Виджет использует **localStorage** для отслеживания:

```typescript
// Месячный лимит (соответствует Tavily Free tier)
const LIMITS = {
  MONTHLY: 1000,      // 1000 запросов/мес
  DAILY_PER_USER: 30, // 30 запросов/день на пользователя
  WARNING_AT: 800,    // 80% — предупреждение
  CRITICAL_AT: 950    // 95% — критическое предупреждение
}
```

### Ключи localStorage:
- `vafe-global-month` — глобальные запросы за месяц
- `vafe-user-day-YYYY-MM-DD` — запросы пользователя за сегодня
- `vafe-last-check` — последняя проверка месяца

---

## 🧪 Как синхронизировать с реальным использованием

### Проблема:
Rate limiter в виджете считает **локально**, а Tavily API считает **реальные запросы**.

**Решение:**
1. В начале месяца обнули localStorage:
   ```javascript
   localStorage.removeItem('vafe-global-month')
   localStorage.removeItem('vafe-last-check')
   ```

2. Проверяй Tavily Dashboard раз в неделю

3. Если localStorage показывает 800, а Tavily 900 — обнови localStorage:
   ```javascript
   localStorage.setItem('vafe-global-month', '900')
   ```

---

## 📈 Мониторинг для инвесторов

### Метрики:
| Показатель | Где смотреть | Частота |
|------------|--------------|---------|
| **Запросы Tavily** | app.tavily.com | Еженедельно |
| **Уникальные пользователи** | Google Analytics | Ежедневно |
| **Конверсия** | (Запросы / Посетители) | Ежемесячно |

### Формула:
```
Среднее использование = (Запросы Tavily) / (Уникальные пользователи)

Если > 30 запросов/пользователь → Нужно оптимизировать
Если < 5 запросов/пользователь → Низкая вовлечённость
```

---

## 🔗 Ссылки

- **Tavily Dashboard:** https://app.tavily.com
- **Tavily Pricing:** https://tavily.com/pricing
- **Tavily Docs:** https://docs.tavily.com
- **Vercel Analytics:** https://vercel.com/dizel0110/vafe-api/analytics

---

## ✅ Чек-лист проверки

- [ ] Открыл https://app.tavily.com
- [ ] Проверил Usage (requests this month)
- [ ] Сверил с localStorage (`vafe-global-month`)
- [ ] Если > 80% — добавил предупреждение в виджет
- [ ] Если > 95% — планируем апгрейд тарифа

---

**После проверки — обнови `_JOURNAL.md`!** 📊
