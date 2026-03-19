# V-AFE Ecosystem — Shared Journal

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

## 📅 19.03.2026 — Интеграция чата с V-AFE API

### Проблема
Чат на сайте не использует V-AFE API для режима "Общий" из-за:
1. Кода, который искал в локальной базе вместо API
2. CORS ограничений браузера

### Что сделано (dizel0110.github.io) ✅
- ✅ Обновлён `VafeChatWidget.tsx` — режим "general" сразу идёт в API
- ✅ Обновлён `aiService.ts` — добавлена функция `callVafeApi()` с логированием
- ✅ Созданы инструкции для vafe-api
- ✅ Создан workflow для межрепозиторной работы: `_CROSS_REPO_WORKFLOW.md`
- ✅ **Rate limiter** — 1000/мес, 30/день на пользователя
- ✅ **Metadata для инвесторов** — статистика в header виджета
- ✅ **Источники из Tavily** — кликабельные ссылки в чате
- ✅ Закоммичено:
  - `Fix: V-AFE chat integration for general mode`
  - `Fix: Remove hardcoded sources from API response`
  - `Fix: Properly handle sources from V-AFE API`
  - `Feat: Complete chat widget with all features`

### Задача для vafe-api ✅
**Файл:** `_VAFE_API_SOURCES_INSTRUCTION.md`
**Задача:** Добавить поиск источников из интернета + возврат в ответе API
**Статус:** ✅ Выполнено (API уже готово!)

**API уже имеет:**
- Tavily web search (1000 req/month)
- CORS для dizel0110.github.io
- Gemini генерирует резюме с источниками
- Metadata в ответе

### Следующий этап: vortex-afe
**Задача:** RAPTOR + ML-ядро (RAG, embeddings, векторный поиск)

---

## 📅 15.03.2026 — Создание V-AFE API

### Цель
Создать отдельный API сервис для V-AFE экосистемы с архитектурой, готовой к масштабированию на несколько платформ и LLM провайдеров.

---

## 🏗️ Архитектура экосистемы

### Репозитории (3):
1. **vortex-afe** — ML Core (RAG, Physics, Insights)
2. **vafe-api** — API Service (Vercel, Multi-Provider LLM)
3. **dizel0110.github.io** — Frontend (Portfolio, Chat Widget)

### Связи:
```
dizel0110.github.io ─HTTPS─► vafe-api (Vercel)
                              │
                              ▼
                         Google Gemini
                              │
                              ▼
vortex-afe ◄────(sync)───────┘
(ML Core, RAG)
```

---

## 🎯 Архитектурные решения

### 1. Микросервисная архитектура ✅
- Каждый сервис отвечает за одну задачу
- Независимый деплой и масштабирование
- Лёгкая замена компонентов

### 2. Provider Router ✅
Абстракция над LLM провайдерами:
```json
{
  "active": "gemini",
  "providers": {
    "gemini": {"enabled": true, "model": "gemini-pro"},
    "openai": {"enabled": false, "model": "gpt-4"},
    "anthropic": {"enabled": false, "model": "claude-3"},
    "local": {"enabled": false, "model": "llama-2"}
  },
  "fallback": {
    "enabled": true,
    "order": ["gemini", "openai", "anthropic"]
  }
}
```

### 3. Версионирование API ✅
- `/api/v1/*` — текущая версия
- `/api/v2/*` — будущее расширение

### 4. Multi-Platform поддержка ✅
- Web (dizel0110.github.io) — сейчас
- Mobile (React Native) — Q2 2026
- Desktop (Electron) — Q3 2026

---

## 📁 Созданные файлы (vafe-api)

Расположены в `vortex-afe/FILES_FOR_VAFE_API/`:

| Файл | Назначение | Статус |
|------|------------|--------|
| `requirements.txt` | Python зависимости | ✅ |
| `vercel.json` | Vercel конфигурация | ✅ |
| `api/v1/chat.py` | POST /api/v1/chat | ✅ |
| `lib/provider_router.py` | Маршрутизация к LLM | ✅ |
| `lib/gemini_client.py` | Gemini клиент | ✅ |
| `config/providers.json` | Конфигурация провайдеров | ✅ |
| `COPY_INSTRUCTIONS.md` | Инструкция по копированию | ✅ |

---

## 📊 Синхронизация журналов

Этот журнал синхронизируется в:
- `vafe-api/.internal/JOURNAL.md` ← ГЛАВНЫЙ
- `vortex-afe/.internal/JOURNAL.md` ← Копия
- `dizel0110.github.io/.internal/JOURNAL.md` ← Копия

---

## 🚀 Следующие шаги

### Этап 1: Деплой vafe-api (сегодня)
- [ ] Скопировать файлы в `d:\ai\vafe-api`
- [ ] Получить Gemini API ключ
- [ ] Создать репо на GitHub
- [ ] Запушить код
- [ ] Подключить Vercel
- [ ] Протестировать API

### Этап 2: Интеграция с сайтом (завтра)
- [ ] Обновить виджет на сайте
- [ ] Настроить CORS
- [ ] Протестировать чат

### Этап 3: Session Logger (Q2)
- [ ] Создать SessionLogger.tsx
- [ ] Экспорт сессий в YAML
- [ ] Insight Engine

---

## 🔗 Ссылки

- **Vercel:** https://vercel.com
- **Gemini API:** https://aistudio.google.com/app/apikey
- **GitHub:** https://github.com/dizel0110/vafe-api (создать)

---

**Следующее обновление:** После деплоя на Vercel
