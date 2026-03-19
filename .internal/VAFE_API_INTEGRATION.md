# 🚀 V-AFE API Integration — Готово!

## ✅ Что сделано

Ваш чат на сайте теперь использует **V-AFE API** (Gemini через Vercel) для режима "Общий".

---

## 📊 Как работает чат теперь

| Режим | Источник ответов | База знаний |
|-------|-----------------|-------------|
| **Кайтинг** 🪁 | Локальная база (34 концепта) | `VafeChatWidget.tsx` |
| **Проекты** 👤 | Локальная база (24 концепта) | `VafeChatWidget.tsx` |
| **Общий** 💬 | **V-AFE API (Gemini)** → Fallback: DuckDuckGo + Wikipedia | `vafe-api.vercel.app` |

---

## 🔧 Изменения в коде

### 1. `src/utils/aiService.ts`

**Добавлено:**
- Функция `callVafeApi()` — вызов вашего API
- Обновлена `generateAIResponse()` — сначала пробует V-AFE API, потом fallback
- Режимы "vafe" и "about" теперь перенаправляют на локальную базу

**Код:**
```typescript
async function callVafeApi(message: string, mode: 'vafe' | 'about' | 'general'): Promise<string> {
  const response = await fetch('https://vafe-api.vercel.app/api/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, mode, use_rag: mode !== 'general' })
  });
  const data = await response.json();
  return data.answer || data.response || data.message;
}
```

### 2. `src/components/VafeChatWidget.tsx`

**Изменено:**
- Режим "general" теперь **сразу** идёт в API (без локального поиска)
- Режимы "vafe" и "about" используют локальную базу
- Вызов `generateAIResponse()` теперь передаёт режим:
```typescript
// Для general — сразу в API
if (mode === 'general') {
  const aiResponse = await generateAIResponse(query, '', 'general');
  // ...
}
```

---

## 🧪 Тестирование

### 1. Локально

```bash
cd d:\ai\dizel0110.github.io
npm run dev
```

Откройте http://localhost:5173, нажмите на чат в правом нижнем углу.

**Проверьте режимы:**

| Режим | Вопрос | Ожидаемый ответ |
|-------|--------|-----------------|
| **Кайтинг** 🪁 | "Что такое вымпельный ветер?" | Ответ из 34 концептов (локально) |
| **Проекты** 👤 | "Расскажи о проектах" | Ответ из 24 концептов (локально) |
| **Общий** 💬 | "Привет! Как дела?" | **Gemini через V-AFE API** |
| **Общий** 💬 | "Что такое RAG?" | **Gemini через V-AFE API** |

### 2. Проверка API

```bash
curl -X POST https://vafe-api.vercel.app/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет!", "mode": "general", "use_rag": false}'
```

**Ожидаемый ответ:**
```json
{
  "response": "Привет! Я AI-ассистент Дмитрия..."
}
```

### 3. Health check

```bash
curl https://vafe-api.vercel.app/api/v1/chat/health
```

---

## 📦 Деплой

### 1. Закоммитьте изменения

```bash
cd d:\ai\dizel0110.github.io
git add .
git commit -m "Integrate V-AFE API for general mode"
git push origin main
```

### 2. GitHub Pages автоматически обновится

- Проверьте: https://github.com/dizel0110/dizel0110.github.io/actions
- Через 1-2 минуты сайт обновится на https://dizel0110.github.io/

---

## 🎯 Поведение чата по режимам

### Режим "Кайтинг" 🪁

**Что происходит:**
1. Поиск по локальной базе (34 концепта)
2. Если найдено совпадение (score ≥ 8) → ответ из базы
3. Если нет → перенаправление: "Используйте режим Кайтинг"

**Примеры вопросов:**
- "Что такое вымпельный ветер?"
- "Как правильно стартовать?"
- "Поза семёрки — как делать?"

---

### Режим "Проекты" 👤

**Что происходит:**
1. Поиск по локальной базе (24 концепта о Дмитрии)
2. Если найдено совпадение → ответ из базы
3. Если нет → перенаправление: "Используйте режим Проекты"

**Примеры вопросов:**
- "Расскажи о проектах"
- "Какие навыки?"
- "Открыт к работе?"
- "Как связаться?"

---

### Режим "Общий" 💬

**Что происходит:**
1. **Попытка №1:** Вызов V-AFE API (`/api/v1/chat`)
2. **Попытка №2 (fallback):** DuckDuckGo + Wikipedia + HuggingFace

**Примеры вопросов:**
- "Привет! Как дела?"
- "Что такое RAG?"
- "Расскажи про AI агентов"
- "Какая погода в Египте?"

---

## ⚠️ Возможные проблемы

### 1. V-AFE API недоступен

**Симптомы:**
- В консоли: `V-AFE API call failed, falling back to search`
- Ответы идут через DuckDuckGo + HuggingFace

**Решение:**
- Проверьте API: `curl https://vafe-api.vercel.app/api/v1/chat/health`
- Проверьте Vercel Dashboard: https://vercel.com/dizel0110/vafe-api

---

### 2. CORS ошибки

**Симптомы:**
- В консоли: `Access to fetch blocked by CORS policy`

**Решение:**
Добавьте в `vafe-api` CORS заголовки:

```python
# api/v1/chat.py
@app.post("/api/v1/chat")
async def chat_endpoint(request: Request, body: ChatRequest):
    # ... ваш код ...
    
    return JSONResponse(
        content={"response": response},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )
```

---

### 3. API возвращает ошибку

**Симптомы:**
- `V-AFE API error: 401` → Неверный API ключ Gemini
- `V-AFE API error: 500` → Ошибка на сервере

**Решение:**
1. Проверьте `.env` в `vafe-api`:
   ```
   GEMINI_API_KEY=ваш_ключ
   ```
2. Проверьте лимиты Gemini API: https://aistudio.google.com/app/apikey

---

## 📊 Метрики

| Показатель | Значение |
|------------|----------|
| V-AFE API URL | `https://vafe-api.vercel.app/api/v1/chat` |
| Модель | Gemini 2.5 Flash |
| Лимит | 1500 запросов/день (бесплатно) |
| Fallback | DuckDuckGo + Wikipedia + HuggingFace |
| Время ответа | ~1-3 сек (API) / ~3-5 сек (fallback) |

---

## 🔗 Ссылки

- **Vercel Dashboard:** https://vercel.com/dizel0110/vafe-api
- **GitHub (vafe-api):** https://github.com/dizel0110/vafe-api
- **GitHub (сайт):** https://github.com/dizel0110/dizel0110.github.io
- **Сайт:** https://dizel0110.github.io/
- **Gemini API Key:** https://aistudio.google.com/app/apikey

---

## 📝 Changelog

### 17.03.2026 — Интеграция V-AFE API

✅ **Добавлено:**
- Функция `callVafeApi()` в `aiService.ts`
- Поддержка режима в `generateAIResponse()`
- Переключение на V-AFE API для режима "general"

✅ **Обновлено:**
- `VafeChatWidget.tsx` — передача режима в AI-сервис
- Сборка проходит без ошибок

🔄 **Следующие шаги:**
- Протестировать на реальном сайте
- Проверить CORS
- Мониторинг лимитов Gemini API

---

**Готово!** 🎉 Ваш чат теперь использует V-AFE API для умных ответов в режиме "Общий".
