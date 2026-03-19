# 🔧 CORS Fix для V-AFE API

## Проблема

Браузер блокирует запросы с `localhost:5173` (или `dizel0110.github.io`) к `https://vafe-api.vercel.app` из-за **CORS policy**.

**Ошибка в консоли:**
```
Access to fetch at 'https://vafe-api.vercel.app/api/v1/chat' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

---

## ✅ Решение 1: Добавить CORS в FastAPI (рекомендуется)

Если ваш API на **FastAPI**, добавьте CORS middleware:

### Файл: `api/v1/chat.py` (или `main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# === ДОБАВИТЬ CORS MIDDLEWARE ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Локальная разработка
        "https://dizel0110.github.io", # Production
        "https://*.dizel0110.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (POST, GET, OPTIONS)
    allow_headers=["*"],  # Разрешить все заголовки
)

@app.post("/api/v1/chat")
async def chat_endpoint(body: ChatRequest):
    # ... ваш код ...
    return {"answer": response}
```

### Или для всех routes сразу:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Только для разработки! Для production укажите конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ✅ Решение 2: Vercel Edge Middleware

Если вы используете **Vercel Serverless Functions**, добавьте middleware для CORS:

### Файл: `middleware.py` (в корне проекта vafe-api)

```python
from vercel_kv import get_kv
from fastapi import Response

async def middleware(request, response):
    # Добавляем CORS заголовки ко всем ответам
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    
    # Для OPTIONS запросов (preflight) возвращаем 200
    if request.method == "OPTIONS":
        return Response(status_code=200, headers=response.headers)
    
    return response
```

---

## ✅ Решение 3: Python декоратор для CORS

Если не хотите использовать middleware, добавьте декоратор к каждому endpoint:

### Файл: `api/v1/chat.py`

```python
from fastapi import Response
from fastapi.responses import JSONResponse

def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.post("/api/v1/chat")
async def chat_endpoint(body: ChatRequest):
    # ... ваш код ...
    response = JSONResponse(content={"answer": response})
    return add_cors_headers(response)

@app.options("/api/v1/chat")
async def chat_options():
    # Обработка preflight запросов
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )
```

---

## 🧪 Проверка CORS

### 1. Тест через curl (OPTIONS preflight)

```bash
curl -v -X OPTIONS https://vafe-api.vercel.app/api/v1/chat \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"
```

**Ожидаемый ответ:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: POST, GET, OPTIONS
< Access-Control-Allow-Headers: Content-Type
```

### 2. Тест через curl (POST запрос)

```bash
curl -v -X POST https://vafe-api.vercel.app/api/v1/chat \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "mode": "general"}'
```

**Ожидаемый ответ:**
```
< Access-Control-Allow-Origin: *
{"answer": "Привет!..."}
```

---

## 📦 Деплой изменений в vafe-api

```bash
cd d:\ai\vafe-api

git add .
git commit -m "Add CORS middleware"
git push origin main

# Деплой на Vercel
vercel --prod
```

---

## 🔍 Отладка CORS ошибок

### 1. Откройте DevTools в браузере (F12)

### 2. Вкладка "Console"
Ищите ошибки:
```
Access to fetch at ... has been blocked by CORS policy
```

### 3. Вкладка "Network"
- Найдите запрос к `/api/v1/chat`
- Проверьте Response Headers
- Должны быть:
  - `Access-Control-Allow-Origin: *` (или ваш домен)
  - `Access-Control-Allow-Methods: POST, OPTIONS`

---

## 🚀 Временное решение (для тестирования)

Если нет доступа к `vafe-api`, используйте **CORS-прокси**:

### В файле: `src/utils/aiService.ts`

```typescript
const CORS_PROXY = 'https://corsproxy.io/?';
const proxyUrl = CORS_PROXY + encodeURIComponent(VAFE_API_URL);

const response = await fetch(proxyUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, mode, use_rag: false })
});
```

⚠️ **Внимание:** CORS-прокси могут быть медленными и небезопасными для production.

---

## 📚 Документация

- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [Vercel CORS](https://vercel.com/guides/how-to-enable-cors)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**После добавления CORS в vafe-api**, чат на сайте начнёт работать через V-AFE API! 🎉
