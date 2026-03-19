# 🔄 V-AFE Ecosystem — Межрепозиторное Взаимодействие

**Версия:** 1.0
**Дата:** 19.03.2026
**Статус:** Active

> ⚠️ **Этот файл синхронизируется между всеми 3 репо V-AFE экосистемы.**
> Перед коммитом запусти: `python _sync.py`

---

## 🏗️ Архитектура экосистемы

```
┌─────────────────────────────────────────────────────────────┐
│                    V-AFE ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. vortex-afe          ← ML Core (RAG, Physics, Insights) │
│     GitHub: dizel0110/vortex-afe                            │
│     Путь: d:\ai\vortex-afe                                  │
│                                                             │
│  2. vafe-api              ← API Service (Vercel, LLM)      │
│     GitHub: dizel0110/vafe-api                              │
│     Путь: d:\ai\vafe-api                                    │
│                                                             │
│  3. dizel0110.github.io   ← Frontend (Portfolio, Chat)     │
│     GitHub: dizel0110/dizel0110.github.io                   │
│     Путь: d:\ai\dizel0110.github.io                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Структура папок .internal по проектам

```
.internal/
├── _sync.py                      # Скрипт синхронизации общих файлов
├── _ECOSYSTEM_CONTEXT.md         # Общий контекст (синхронизируется)
├── _JOURNAL.md                   # Общий журнал (синхронизируется)
├── _QUICK_START.md               # Быстрый старт (синхронизируется)
│
├── vafe-api/                     # ← Инструкции для vafe-api
│   ├── CORS_FIX_INSTRUCTION.md   # Как добавить CORS
│   └── DEPLOY_CHECKLIST.md       # Чек-лист деплоя
│
├── vortex-afe/                   # ← Инструкции для vortex-afe
│   └── RAG_SETUP.md              # Настройка RAG
│
└── dizel0110.github.io/          # ← Инструкции для сайта
    └── CHAT_WIDGET_GUIDE.md      # Гид по чат-виджету
```

---

## 🎯 Правила межрепозиторного взаимодействия

### Правило 1: Разделение ответственности

| Репозиторий | Отвечает за | Не трогает |
|-------------|-------------|------------|
| **vortex-afe** | ML модели, RAG, embeddings | API, фронтенд |
| **vafe-api** | HTTP API, LLM провайдеры, CORS | ML модели, фронтенд |
| **dizel0110.github.io** | UI, чат-виджет, интеграция | API, ML модели |

### Правило 2: API контракты

**vafe-api** предоставляет:
```
POST /api/v1/chat
Body: { "message": str, "mode": "vafe|about|general", "use_rag": bool }
Response: { "answer": str, "sources": list, "provider": str }
```

**dizel0110.github.io** использует:
- Только документированные эндпоинты
- Только указанные форматы запросов/ответов

### Правило 3: Общие файлы

Файлы с префиксом `_` синхронизируются во все репо:
- `_ECOSYSTEM_CONTEXT.md`
- `_JOURNAL.md`
- `_QUICK_START.md`

**Команда синхронизации:**
```bash
cd d:\ai\vortex-afe\.internal
python _sync.py
```

### Правило 4: Инструкции для других репо

**Формат:** `.internal/<project-name>/<INSTRUCTION>.md`

**Пример:**
- `.internal/vafe-api/CORS_FIX_INSTRUCTION.md` — инструкция для vafe-api
- `.internal/vortex-afe/RAG_SETUP.md` — инструкция для vortex-afe

**Структура инструкции:**
```markdown
# 🔧 <Название задачи>

**Проект:** <имя репозитория>
**Дата:** ДД.ММ.ГГГГ
**Статус:** ⏳ / ✅ / ❌
**Срочность:** 🔴 / 🟡 / 🟢

## 📋 Проблема
...

## ✅ Решение
...

## 📁 Шаг 1: ...
...

## 🧪 Проверка
...

## 🚀 Деплой
...
```

---

## 🔄 Передача задач между репозиториями

### Сценарий 1: Нужны изменения в API (из фронтенда)

**Кто:** `dizel0110.github.io`  
**Кому:** `vafe-api`  
**Действие:**

1. Создай инструкцию: `.internal/vafe-api/<TASK>.md`
2. Опиши проблему и решение
3. Запиши в `_JOURNAL.md`:
   ```markdown
   ## 📅 19.03.2026 — Задача для vafe-api
   
   **Задача:** Добавить CORS middleware
   **Файл:** `.internal/vafe-api/CORS_FIX_INSTRUCTION.md`
   **Статус:** ⏳ Ожидает выполнения
   ```

### Сценарий 2: Нужны изменения в ML (из API)

**Кто:** `vafe-api`  
**Кому:** `vortex-afe`  
**Действие:**

1. Создай инструкцию: `.internal/vortex-afe/<TASK>.md`
2. Опиши требуемую ML функциональность
3. Обнови `_JOURNAL.md`

### Сценарий 3: Синхронизация общих документов

**Кто:** Любой репозиторий  
**Кому:** Все репозитории  
**Действие:**

```bash
# Перед коммитом в любом репо
cd d:\ai\<repo-name>\.internal
python _sync.py

# Проверка
git status
git add .internal
git commit -m "Sync shared docs"
git push
```

---

## 📊 Статусы задач

| Статус | Значение | Когда использовать |
|--------|----------|-------------------|
| ⏳ **Ожидает** | Задача создана, ждёт выполнения | Создал инструкцию |
| 🔄 **В работе** | Задача выполняется | Начал выполнять |
| ✅ **Готово** | Задача выполнена, задеплоено | Завершил и проверил |
| ❌ **Отложено** | Задача отложена на потом | Временно не актуально |
| 🐛 **Проблема** | Есть ошибка, нужна помощь | Что-то пошло не так |

---

## 🎯 Примеры задач

### Пример 1: CORS для API

**Файл:** `.internal/vafe-api/CORS_FIX_INSTRUCTION.md`  
**Инициатор:** `dizel0110.github.io`  
**Статус:** ⏳

**Журнал:**
```markdown
## 📅 19.03.2026 — CORS для vafe-api

**Задача:** Добавить CORS middleware в FastAPI
**Файл:** `.internal/vafe-api/CORS_FIX_INSTRUCTION.md`
**Инициатор:** dizel0110.github.io (чат не работает через API)
**Статус:** ⏳ Ожидает выполнения
```

### Пример 2: Интеграция RAG

**Файл:** `.internal/vafe-api/RAG_INTEGRATION.md`  
**Инициатор:** `vortex-afe`  
**Статус:** ⏳

**Журнал:**
```markdown
## 📅 20.03.2026 — RAG интеграция

**Задача:** Подключить RAG из vortex-afe к API
**Файл:** `.internal/vafe-api/RAG_INTEGRATION.md`
**Инициатор:** vortex-afe (ML готов)
**Статус:** ⏳ Ожидает выполнения
```

---

## 🔗 Ссылки

| Репозиторий | GitHub | Vercel | Локально |
|-------------|--------|--------|----------|
| **vortex-afe** | github.com/dizel0110/vortex-afe | — | `d:\ai\vortex-afe` |
| **vafe-api** | github.com/dizel0110/vafe-api | vercel.app | `d:\ai\vafe-api` |
| **dizel0110.github.io** | github.com/dizel0110/dizel0110.github.io | github.io | `d:\ai\dizel0110.github.io` |

---

## 📚 Дополнительные ресурсы

- [Синхронизация файлов](_sync.py)
- [Общий журнал](_JOURNAL.md)
- [Быстрый старт](_QUICK_START.md)
- [Контекст экосистемы](_ECOSYSTEM_CONTEXT.md)

---

**Последнее обновление:** 19.03.2026  
**Следующее обновление:** После выполнения CORS fix
