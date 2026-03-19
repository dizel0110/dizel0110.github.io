# V-AFE Ecosystem — Quick Start for New AI Session

> ⚠️ **ВАЖНО: Синхронизация общих файлов**
>
> Этот файл — **общий для всех 3 репо**.
>
> **Перед коммитом:**
> ```bash
> cd d:\ai\vortex-afe\.internal  (или любой другой репо)
> python _sync.py
> ```
>
> **Или попроси AI в новой сессии:**
> > "Синхронизируй общие файлы" или "Запусти _sync.py"

**Если ты новый AI-ассистент и помогаешь с V-AFE проектом — читай это!**

---

## 🎯 Краткая суть (30 секунд)

**V-AFE** — AI-инструктор по кайтбордингу с RAG-архитектурой.

**3 репозитория:**
1. `vortex-afe` — ML ядро (RAG, физика) — **в разработке**
2. `vafe-api` — API сервис (Vercel, Gemini) — **✅ ЗАДЕПЛОЕНО**
3. `dizel0110.github.io` — Сайт с чат-виджетом — **✅ РАБОТАЕТ**

---

## 📁 Где что находится (локально)

```
d:\ai\vortex-afe              ← ML Core (RAG, embeddings)
d:\ai\vafe-api                ← API (Vercel, Gemini) ✅
d:\ai\dizel0110.github.io     ← Сайт (GitHub Pages) ✅
```

---

## 📚 Главные файлы для контекста

| Файл | Где | Зачем |
|------|-----|-------|
| `.internal/ECOSYSTEM_CONTEXT.md` | Во всех 3 репо | **Полная картина экосистемы** |
| `.internal/JOURNAL.md` | Во всех 3 репо | Последние изменения |
| `README.md` | В каждом репо | Документация проекта |

---

## 🚀 Что делать прямо сейчас

### 🔧 vafe-api (API сервис)

**Статус:** ✅ Задеплоено на Vercel

- **URL:** https://vafe-api.vercel.app
- **Health:** https://vafe-api.vercel.app/api/v1/chat/health
- **GitHub:** https://github.com/dizel0110/vafe-api

**Эндпоинты:**
```
POST /api/v1/chat
Body: { "message": "...", "mode": "vafe|about|general", "use_rag": false }
```

**Системные промпты (3 режима):**
| Mode | Описание |
|------|----------|
| `vafe` | Инструктор по кайтбордингу (инженерный стиль) |
| `about` | Ассистент Дмитрия (рассказывает о проекте) |
| `general` | Универсальный ассистент |

**Модель:** `gemini-2.5-flash` (бесплатно, 1500 запросов/день)

**Тесты:**
```powershell
cd d:\ai\vafe-api
.\venv\Scripts\python tests\test_api.py
```

---

### 🎨 dizel0110.github.io (Фронтенд)

**Статус:** ✅ Работает

**Проверка виджета:**
1. Открой `src/components/VafeChatWidget.tsx`
2. Найди `fetch` запрос к API
3. Убедись, что передаётся `mode`:

```typescript
// ✅ ПРАВИЛЬНО:
fetch('https://vafe-api.vercel.app/api/v1/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: userInput,
    mode: currentMode  // "vafe" | "about" | "general"
  })
})
```

**Режимы в виджете:**
- Кайтинг → `mode: "vafe"`
- О себе → `mode: "about"`
- Общий → `mode: "general"`

---

### 🧠 vortex-afe (ML Core)

**Статус:** ⏳ В разработке

**Что внутри:**
- RAG поиск по 34 концептам кайтбординга
- Embeddings, векторный поиск
- Session Parser → Insight Engine

**Будущее:** Деплой на HuggingFace Spaces для HTTP доступа

---

## 🔗 Ссылки

| Сервис | URL |
|--------|-----|
| **Vercel Dashboard** | https://vercel.com/dizel0110/vafe-api |
| **GitHub (vafe-api)** | https://github.com/dizel0110/vafe-api |
| **Gemini API Key** | https://aistudio.google.com/app/apikey |

---

## 📋 Чек-лист для новой сессии

- [ ] Прочитал `.internal/ECOSYSTEM_CONTEXT.md`
- [ ] Проверил `.internal/JOURNAL.md` на последние изменения
- [ ] Запустил `python _sync.py` для синхронизации файлов

---

**Версия:** 1.1.0 | **Обновлено:** 17.03.2026 | **Деплой:** ✅
