# 📁 vafe-api — Инструкции и Документация

**Статус:** ✅ API задеплоено на Vercel
**URL:** https://vafe-api.vercel.app
**GitHub:** https://github.com/dizel0110/vafe-api

> ⚠️ **Этот файл синхронизируется между всеми 3 репо V-AFE экосистемы.**
> Перед коммитом запусти: `python _sync.py`

---

## 📋 Текущие задачи

| Задача | Статус | Срочность | Файл |
|--------|--------|-----------|------|
| Добавить CORS middleware | ⏳ Ожидает | 🔴 Высокая | [CORS_FIX_INSTRUCTION.md](./CORS_FIX_INSTRUCTION.md) |

---

## 🔧 Инструкции

### 1. CORS Fix (Срочно!)

**Проблема:** Чат на сайте не может подключиться к API из-за CORS policy.

**Решение:** Добавить CORS middleware в FastAPI приложение.

📖 **Полная инструкция:** [CORS_FIX_INSTRUCTION.md](./CORS_FIX_INSTRUCTION.md)

**Кратко:**
```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Или конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Время выполнения:** ~10 минут

---

## 🚀 Быстрый старт

### 1. Перейди в проект

```bash
cd d:\ai\vafe-api
```

### 2. Проверь статус

```bash
git status
git log -n 3
```

### 3. Выполни CORS Fix

Следуй инструкции: [CORS_FIX_INSTRUCTION.md](./CORS_FIX_INSTRUCTION.md)

### 4. Задеплой

```bash
git add .
git commit -m "Add CORS middleware"
git push origin main
vercel --prod
```

---

## 🧪 Тестирование

### Health check

```bash
curl https://vafe-api.vercel.app/api/v1/chat/health
```

### Тест API

```bash
curl -X POST https://vafe-api.vercel.app/api/v1/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Привет!\", \"mode\": \"general\"}"
```

### Проверка CORS

```bash
curl -v -X OPTIONS https://vafe-api.vercel.app/api/v1/chat \
  -H "Origin: http://localhost:5173" \
  2>&1 | findstr /i "access-control"
```

---

## 📁 Структура проекта

```
vafe-api/
├── api/
│   └── v1/
│       └── chat.py          # ← Добавь CORS здесь
├── lib/
│   ├── provider_router.py
│   └── gemini_client.py
├── config/
│   └── providers.json
├── requirements.txt
├── vercel.json
└── README.md
```

---

## 🔗 Ссылки

| Ресурс | URL |
|--------|-----|
| **Vercel Dashboard** | https://vercel.com/dizel0110/vafe-api |
| **API Endpoint** | https://vafe-api.vercel.app/api/v1/chat |
| **Health Check** | https://vafe-api.vercel.app/api/v1/chat/health |
| **GitHub Repo** | https://github.com/dizel0110/vafe-api |
| **Gemini API** | https://aistudio.google.com/app/apikey |

---

## 📚 Общая документация экосистемы

- [Cross-Repo Workflow](../CROSS_REPO_WORKFLOW.md) — Как работать с несколькими репо
- [Quick Start](../_QUICK_START.md) — Быстрый старт для V-AFE экосистемы
- [Ecosystem Context](../_ECOSYSTEM_CONTEXT.md) — Полная картина экосистемы
- [Journal](../_JOURNAL.md) — Журнал изменений

---

## 🎯 Следующие шаги

1. ✅ **Сейчас:** Добавить CORS middleware
2. ⏳ **После CORS:** Протестировать чат на сайте
3. ⏳ **Затем:** Обновить `_JOURNAL.md` о выполнении

---

**Контакт:** dizel0110@gmail.com | Telegram: @dizel0110  
**Последнее обновление:** 19.03.2026
