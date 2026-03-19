# 🔧 V-AFE Chat Widget — Fix Инструкция

**Проект:** `dizel0110.github.io`
**Дата:** 19.03.2026
**Статус:** 🔴 Требуется выполнение
**Срочность:** Высокая (чат не работает)

> ⚠️ **Этот файл синхронизируется между всеми 3 репо V-AFE экосистемы.**
> Перед коммитом запусти: `python _sync.py`

---

## 📋 Проблема

Чат на сайте **не подключается** к V-AFE API на Vercel.

**Симптомы:**
- ❌ Чат не отвечает в режиме "Кайтинг" / "Общий"
- ❌ Ошибки CORS в консоли
- ❌ Или запросы уходят не на тот URL

**Причина:**
Виджет настроен неправильно (не тот API URL или не передаётся `mode`).

---

## ✅ Решение

Проверить и исправить `VafeChatWidget.tsx`.

---

## 📁 Шаг 1: Открой файл виджета

```
d:\ai\dizel0110.github.io\src\components\VafeChatWidget.tsx
```

---

## 🔍 Шаг 2: Найди API URL

Ищи в коде строку с `fetch` или `API_URL`.

### ❌ НЕПРАВИЛЬНО:

```typescript
// Локальный адрес (не работает в продакшене!)
const API_URL = 'http://localhost:8000/api/v1/chat'

// Или старый URL
const API_URL = 'https://old-api.vercel.app/api/v1/chat'
```

### ✅ ПРАВИЛЬНО:

```typescript
const API_URL = 'https://vafe-api.vercel.app/api/v1/chat'
```

---

## 🎯 Шаг 3: Проверь передачу mode

Найди где отправляется POST запрос:

### ❌ НЕПРАВИЛЬНО:

```typescript
// Нет mode!
fetch(API_URL, {
  method: 'POST',
  body: JSON.stringify({
    message: userInput
    // ❌ mode отсутствует!
  })
})
```

### ✅ ПРАВИЛЬНО:

```typescript
fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userInput,
    mode: currentMode,      // ✅ "vafe" | "about" | "general"
    use_rag: false
  })
})
```

---

## 🔄 Шаг 4: Проверь названия режимов

Убедись, что режимы в виджете совпадают с API:

| Режим в виджете | Должно быть | API принимает |
|----------------|-------------|---------------|
| Кайтинг        | `vafe`      | ✅ `vafe`     |
| О себе         | `about`     | ✅ `about`    |
| Общий          | `general`   | ✅ `general`  |

### Если у тебя другие названия:

**Вариант A: Исправь в виджете**

```typescript
// Было:
const modes = ['kite', 'me', 'chat']

// Стало:
const modes = ['vafe', 'about', 'general']
```

**Вариант B: Добавь маппинг**

```typescript
const modeMap = {
  'kite': 'vafe',
  'me': 'about',
  'chat': 'general'
}

// При отправке:
mode: modeMap[currentMode]
```

---

## 🧪 Шаг 5: Тест локально

1. **Запусти сайт локально:**
   ```bash
   cd d:\ai\dizel0110.github.io
   npm run dev
   ```

2. **Открой:** `http://localhost:5173`

3. **Открой консоль:** F12 → Console

4. **Переключись на режим "Общий" 💬**

5. **Напиши:** `Привет!`

6. **Смотри консоль:**

### ✅ Успех:
```
[V-AFE] Calling API: {message: "Привет!", mode: "general"}
[V-AFE] Status: 200
[V-AFE] Response: {answer: "Привет! Я AI-ассистент..."}
```

### ❌ Ошибка CORS:
```
Access to fetch at 'https://vafe-api.vercel.app' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Решение:** CORS уже добавлен в vafe-api. Подожди 1-2 минуты пока Vercel пересоберёт.

### ❌ Ошибка 404:
```
POST https://vafe-api.vercel.app/api/v1/chat 404
```

**Решение:** Неправильный URL. Проверь Шаг 2.

### ❌ Ошибка 500:
```
POST https://vafe-api.vercel.app/api/v1/chat 500
```

**Решение:** Проблема на стороне API. Проверь логи Vercel.

---

## 📊 Чек-лист выполнения

- [ ] Открыл `src/components/VafeChatWidget.tsx`
- [ ] Проверил API URL: `https://vafe-api.vercel.app/api/v1/chat`
- [ ] Проверил передачу `mode` в запросе
- [ ] Проверил названия режимов (vafe/about/general)
- [ ] Запустил локально (`npm run dev`)
- [ ] Протестировал в консоли
- [ ] Нет ошибок CORS
- [ ] Чат отвечает через Gemini

---

## 🔗 Ссылки

- **Проект:** `d:\ai\dizel0110.github.io`
- **Виджет:** `src/components/VafeChatWidget.tsx`
- **V-AFE API:** https://vafe-api.vercel.app
- **Health Check:** https://vafe-api.vercel.app/api/v1/chat/health
- **Vercel Dashboard:** https://vercel.com/dizel0110/vafe-api

---

## 📝 Пример правильного кода

Вот как должен выглядеть запрос:

```typescript
// VafeChatWidget.tsx

const API_URL = 'https://vafe-api.vercel.app/api/v1/chat'

async function sendMessage(message: string, mode: string) {
  console.log('[V-AFE] Calling API:', { message, mode })
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        mode: mode,        // "vafe" | "about" | "general"
        use_rag: false
      })
    })
    
    console.log('[V-AFE] Status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('[V-AFE] Response:', data)
    
    return data.answer
    
  } catch (error) {
    console.error('[V-AFE] Error:', error)
    throw error
  }
}
```

---

## 🎯 После исправления

1. **Закоммить изменения:**
   ```bash
   git add src/components/VafeChatWidget.tsx
   git commit -m "Fix V-AFE chat widget: correct API URL and mode"
   git push
   ```

2. **GitHub Pages обновится** автоматически (1-2 минуты)

3. **Проверь на продакшене:**
   - Открой https://dizel0110.github.io
   - Протестируй все 3 режима

---

## 📚 Документация

- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [Vercel CORS](https://vercel.com/guides/how-to-enable-cors)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**После выполнения — чат начнёт работать через V-AFE API!** 🎉

---

**Контакт для вопросов:** dizel0110@gmail.com | Telegram: @dizel0110
