# V-AFE Ecosystem — Context for AI Sessions

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

**Версия:** 1.0.0
**Обновлено:** 15.03.2026
**Статус:** Active Development

---

## 🏗️ Архитектура экосистемы (3 репозитория)

```
┌─────────────────────────────────────────────────────────────┐
│                    V-AFE ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. vortex-afe          ← ML Core (RAG, Physics, Insights) │
│     GitHub: dizel0110/vortex-afe                            │
│     Статус: ✅ Запушено в GitHub                            │
│                                                             │
│  2. vafe-api              ← API Service (Vercel, LLM)      │
│     GitHub: dizel0110/vafe-api                              │
│     Статус: ⬜ Локально готов к деплою                      │
│                                                             │
│  3. dizel0110.github.io   ← Frontend (Portfolio, Chat)     │
│     GitHub: dizel0110/dizel0110.github.io                   │
│     Статус: ⬜ Локально готов к деплою                      │
│                                                             │
│  Связи:                                                     │
│  dizel0110.github.io ─HTTPS─► vafe-api (Vercel)            │
│                                │                            │
│                                ▼                            │
│                           Google Gemini                     │
│                                │                            │
│                                ▼                            │
│  vortex-afe ◄────(sync)───────┘                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Расположение репозиториев (локально)

| Репозиторий | Путь | Статус |
|-------------|------|--------|
| **vortex-afe** | `d:\ai\vortex-afe` | ✅ Запушено |
| **vafe-api** | `d:\ai\vafe-api` | ⬜ Локально |
| **dizel0110.github.io** | `d:\ai\dizel0110.github.io` | ⬜ Локально |

---

## 🎯 Назначение каждого репо

### 1. vortex-afe (ML Core)

**Цель:** Ядро ML-системы для кайтбординга

**Ключевые файлы:**
```
vortex-afe/
├── data/v-afe_core.json      # 34 концепта кайтбординга
├── scripts/raptor_rag.py     # RAPTOR RAG движок
├── scripts/api.py            # FastAPI backend (альтернатива)
├── ARCHITECTURE.md           # Документация RAG
└── README.md                 # Основная документация
```

**Что внутри:**
- RAPTOR RAG с древовидным индексом
- 34 концепта (физика + механика кайтбординга)
- Session parser (в разработке)
- Insight engine (в разработке)

**Статус:** ✅ Запушено в GitHub  
**GitHub:** https://github.com/dizel0110/vortex-afe

---

### 2. vafe-api (API Service)

**Цель:** REST API для чата и инсайтов (Vercel + Multi-Provider LLM)

**Ключевые файлы:**
```
vafe-api/
├── api/v1/chat.py            # POST /api/v1/chat
├── lib/provider_router.py    # Маршрутизация к LLM
├── lib/gemini_client.py      # Gemini клиент
├── config/providers.json     # Конфигурация провайдеров
├── requirements.txt          # Python зависимости
├── vercel.json              # Vercel конфиг
└── README.md                # Документация API
```

**Что внутри:**
- Provider Router (Gemini, OpenAI, Anthropic, Local)
- API Versioning (`/api/v1/*`)
- Multi-Platform поддержка (Web, Mobile, Desktop)
- Fallback система провайдеров

**Статус:** ⬜ Локально готов к деплою  
**Следующий шаг:** Деплой на Vercel

---

### 3. dizel0110.github.io (Frontend)

**Цель:** Портфолио сайт с чат-виджетом

**Ключевые файлы:**
```
dizel0110.github.io/
├── src/components/
│   ├── VafeChatWidget.tsx    # Чат с 3 режимами
│   └── SessionLogger.tsx     # Запись сессий (future)
├── public/data/
│   ├── v-afe_core.json       # База кайтинга
│   └── about_dmitry.json     # База о Дмитрии
├── vafe-docs/                # Документация V-AFE
└── .internal/
    └── JOURNAL.md            # Журнал
```

**Что внутри:**
- Chat Widget (3 режима: Кайтинг / О себе / Общий)
- Авто-смена режима при скролле
- Раздельная память для каждого режима
- Аватарка с GitHub

**Статус:** ⬜ Локально готов к деплою  
**Следующий шаг:** Деплой на GitHub Pages

---

## 🚀 Текущий прогресс (Roadmap)

### ✅ Выполнено (15.03.2026)

- [x] vortex-afe запущено и запушено в GitHub
- [x] vafe-api создан локально (структура, файлы)
- [x] dizel0110.github.io имеет рабочий чат-виджет
- [x] JOURNAL.md синхронизирован во все репо
- [x] ECOSYSTEM_CONTEXT.md создан

### ⬜ В работе (следующие 2-3 часа)

- [ ] vafe-api: Инициализация Git и деплой
- [ ] vafe-api: Получение Gemini API ключа
- [ ] vafe-api: Деплой на Vercel
- [ ] dizel0110.github.io: Обновление API URL
- [ ] dizel0110.github.io: Деплой на GitHub Pages

### 📅 Следующие (этап 2)

- [ ] Session Logger (запись диалогов в YAML)
- [ ] Insight Engine (парсинг сессий → инсайты)
- [ ] RAG интеграция (vortex-afe → vafe-api)
- [ ] Analytics API (статистика для инвесторов)

### 🔮 Будущее (Q2-Q3 2026)

- [ ] OpenAI провайдер
- [ ] Anthropic провайдер
- [ ] Local LLM поддержка
- [ ] Mobile App (React Native)
- [ ] Desktop App (Electron)

---

## 🔑 Ключевые команды

### Для vortex-afe

```bash
cd d:\ai\vortex-afe
git status
git add .
git commit -m "Message"
git push
```

### Для vafe-api

```bash
cd d:\ai\vafe-api
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/dizel0110/vafe-api.git
git push -u origin main

# Деплой на Vercel
vercel --prod
```

### Для dizel0110.github.io

```bash
cd d:\ai\dizel0110.github.io
git add .
git commit -m "Update V-AFE chat"
git push
```

---

## 📊 API Endpoints (после деплоя)

### vafe-api (Vercel)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/chat` | Основной чат |
| POST | `/api/v1/insight` | Генерация инсайтов |
| POST | `/api/v1/sync` | Синхронизация RAG |
| GET | `/api/v1/analytics` | Статистика |
| GET | `/api/v1/chat/health` | Health check |

### dizel0110.github.io (GitHub Pages)

| URL | Описание |
|-----|----------|
| `https://dizel0110.github.io/` | Портфолио сайт |
| `https://dizel0110.github.io/vafe-docs/` | Документация V-AFE |

---

## 🔗 Важные ссылки

### Сервисы

| Сервис | URL | Статус |
|--------|-----|--------|
| **Vercel** | https://vercel.com | ⬜ Нужно подключить |
| **Gemini API** | https://aistudio.google.com/app/apikey | ⬜ Нужен ключ |
| **GitHub** | https://github.com/dizel0110 | ✅ Аккаунт есть |

### Репозитории

| Репозиторий | URL | Статус |
|-------------|-----|--------|
| **vortex-afe** | https://github.com/dizel0110/vortex-afe | ✅ Запушено |
| **vafe-api** | https://github.com/dizel0110/vafe-api | ⬜ Создать |
| **dizel0110.github.io** | https://github.com/dizel0110/dizel0110.github.io | ✅ Существует |

---

## 📝 Контекст для новой AI-сессии

Если ты начинаешь новую сессию в любом из проектов:

1. **Прочитай этот файл** — даст полную картину
2. **Проверь .internal/JOURNAL.md** — последние изменения
3. **Сверься с Roadmap** — что делать дальше

### Типичные задачи

**Хочу деплоить API:**
→ Иди в `vafe-api`, читай раздел "Для vafe-api" выше

**Хочу обновить чат на сайте:**
→ Иди в `dizel0110.github.io/src/components/VafeChatWidget.tsx`

**Хочу добавить концепт в базу:**
→ Иди в `vortex-afe/data/v-afe_core.json`

**Хочу понять архитектуру:**
→ Читай этот файл + `vortex-afe/ARCHITECTURE.md`

---

## 🔄 Синхронизация между репо

### Общие файлы (с префиксом _)

Файлы с префиксом **`_`** — **одинаковые** во всех 3 репо:

- `_ECOSYSTEM_CONTEXT.md` ← Этот файл
- `_JOURNAL.md` ← Журнал изменений
- `_QUICK_START.md` ← Шпаргалка для AI

**Источник истины:** `vortex-afe/.internal/`

**Синхронизация (перед коммитом):**

Запусти из **любого репо**:

```bash
cd d:\ai\vortex-afe\.internal
# или
cd d:\ai\vafe-api\.internal
# или
cd d:\ai\dizel0110.github.io\.internal

python _sync.py
```

**Что делает скрипт:**
- Копирует `_*.md` из `vortex-afe/.internal/`
- В `vafe-api/.internal/`
- В `dizel0110.github.io/.internal/`

**Потом коммитишь в каждом репо:**

```bash
# vortex-afe
cd d:\ai\vortex-afe
git add .internal
git commit -m "Sync shared docs"
git push

# vafe-api
cd d:\ai\vafe-api
git add .internal
git commit -m "Sync shared docs"
git push

# dizel0110.github.io
cd d:\ai\dizel0110.github.io
git add .internal
git commit -m "Sync shared docs"
git push
```

**Когда синхронизировать:**
- Перед коммитом общих документов
- После изменения архитектуры
- После обновления Roadmap

**Проверка (dry run):**
```bash
python _sync.py --dry-run
```

---

**Последнее обновление:** 15.03.2026
**Следующее обновление:** После деплоя vafe-api на Vercel
