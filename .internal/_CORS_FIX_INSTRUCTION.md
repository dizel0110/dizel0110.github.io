# 🔧 V-AFE API — CORS Fix Инструкция

**Проект:** `vafe-api`
**Дата:** 19.03.2026
**Статус:** ⏳ Требуется выполнение
**Срочность:** 🔴 Высокая (блокирует работу чата на сайте)

> ⚠️ **Этот файл синхронизируется между всеми 3 репо V-AFE экосистемы.**
> Перед коммитом запусти: `python _sync.py`

---

## 📋 Проблема

Чат на сайте `dizel0110.github.io` **не может подключиться** к API `https://vafe-api.vercel.app` из-за **CORS policy**.

**Симптомы:**
- В консоли браузера ошибка: `Access to fetch blocked by CORS policy`
- Чат отвечает через fallback (медленно, не через Gemini)
- Режим "Общий" не работает как задумано

**Причина:**
API не возвращает CORS заголовки в ответах.

---

## ✅ Решение

Добавить CORS middleware в FastAPI приложение.

---

## 📁 Шаг 1: Перейди в проект vafe-api

```bash
cd d:\ai\vafe-api
```

---

## 📝 Шаг 2: Открой файл api/v1/chat.py

Найди где создаётся `FastAPI()` приложение (обычно в начале файла).

**Примерно так:**
```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/api/v1/chat")
async def chat_endpoint(...):
    # ...
```

---

## 🔧 Шаг 3: Добавь CORS middleware

**Сразу после** `app = FastAPI()` добавь:

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# === CORS MIDDLEWARE ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",       # Локальная разработка
        "https://dizel0110.github.io", # Production
        "https://*.dizel0110.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # POST, GET, OPTIONS
    allow_headers=["*"],  # Content-Type, Authorization
)
```

**Или для всех доменов (только для тестирования!):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Не для production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧪 Шаг 4: Проверь код

Убедись, что файл выглядит так:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # ← Импортировано
from pydantic import BaseModel

app = FastAPI()

# === CORS MIDDLEWARE ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Или конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Дальше твой код...
@app.post("/api/v1/chat")
async def chat_endpoint(...):
    # ...
```

---

## 🚀 Шаг 5: Задеплой на Vercel

```bash
# Проверь статус
git status

# Добавь изменения
git add .

# Закоммить
git commit -m "Add CORS middleware for cross-origin requests"

# Запуш
git push origin main

# Деплой на Vercel (если не настроен авто-деплой)
vercel --prod
```

---

## ✅ Шаг 6: Проверь CORS

### Тест 1: OPTIONS preflight

```bash
curl -v -X OPTIONS https://vafe-api.vercel.app/api/v1/chat \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  2>&1 | findstr /i "access-control HTTP"
```

**Ожидаемый ответ:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: POST, OPTIONS
```

### Тест 2: POST запрос

```bash
curl -v -X POST https://vafe-api.vercel.app/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d "{\"message\": \"Привет!\", \"mode\": \"general\"}" \
  2>&1 | findstr /i "access-control answer"
```

**Ожидаемый ответ:**
```
< Access-Control-Allow-Origin: *
{"answer":"Привет!..."}
```

---

## 🎯 Шаг 7: Протестируй чат на сайте

1. Открой `http://localhost:5173` (или `https://dizel0110.github.io`)
2. Открой консоль (F12 → Console)
3. Нажми на чат в правом нижнем углу
4. Переключись на режим **"Общий" 💬**
5. Напиши: `Привет!`
6. **Ожидаемый результат:** Ответ от Gemini через ~2-4 секунды

**В консоли должно быть:**
```
[V-AFE API] Вызов API: {message: "Привет!", mode: "general"}
[V-AFE API] Status: 200
[V-AFE API] Response: {answer: "Привет! Я AI-ассистент..."}
```

---

## 📊 Чек-лист выполнения

- [ ] Перешёл в `d:\ai\vafe-api`
- [ ] Открыл `api/v1/chat.py` (или `main.py`)
- [ ] Добавил CORS middleware после `app = FastAPI()`
- [ ] Закоммитил изменения
- [ ] Запушил на GitHub
- [ ] Задеплоил на Vercel
- [ ] Проверил CORS через curl
- [ ] Протестировал чат на сайте

---

## 🔗 Ссылки

- **Проект:** `d:\ai\vafe-api`
- **Vercel Dashboard:** https://vercel.com/dizel0110/vafe-api
- **API URL:** https://vafe-api.vercel.app/api/v1/chat
- **Health Check:** https://vafe-api.vercel.app/api/v1/chat/health
- **GitHub:** https://github.com/dizel0110/vafe-api

---

## 📚 Документация

- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [Vercel CORS](https://vercel.com/guides/how-to-enable-cors)

---

**После выполнения — чат на сайте начнёт работать через V-AFE API!** 🎉

---

**Контакт для вопросов:** dizel0110@gmail.com | Telegram: @dizel0110
