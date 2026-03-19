# 🔧 V-AFE API — Источники из Интернета (Web Search + Gemini Resume)

**Проект:** `vafe-api`  
**Дата:** 19.03.2026  
**Статус:** ⏳ Требуется выполнение  
**Срочность:** 🔴 Высокая

> ⚠️ **Этот файл синхронизируется между всеми 3 репо V-AFE экосистемы.**  
> Перед коммитом запусти: `python _sync.py`

---

## 📋 Проблема

Сейчас API возвращает только текст ответа:
```json
{
  "answer": "Я — большая языковая модель...",
  "sources": []
}
```

**Нужно:** Возвращать ответ + 3 кликабельных источника из интернета.

---

## ✅ Архитектура решения

```
1. Пользователь спрашивает: "Расскажи о себе"
         ↓
2. DuckDuckGo поиск → 3-5 источников (title, url, snippet)
         ↓
3. Gemini получает: запрос + контекст из источников
         ↓
4. Gemini генерирует: резюме + кликабельные ссылки в тексте
         ↓
5. Возврат: { "answer": "...", "sources": [...] }
```

**Важно:** Gemini использует найденные источники для генерации ответа, а не просто перечисляет их.

---

## 📁 Шаг 1: Обнови `requirements.txt`

**Файл:** `d:\ai\vafe-api\requirements.txt`

**Добавь строку:**
```
duckduckgo-search>=5.0.0
```

**Итоговый файл:**
```txt
fastapi==0.115.0
uvicorn==0.30.0
google-generativeai==0.8.0
pydantic==2.9.0
python-dotenv==1.0.0
duckduckgo-search>=5.0.0  # ← Добавлено
```

---

## 🔧 Шаг 2: Создай `lib/web_search.py`

**Файл:** `d:\ai\vafe-api\lib\web_search.py`

```python
"""
Web Search via DuckDuckGo
Поиск источников для ответов Gemini
"""

from duckduckgo_search import DDGS
from typing import List, Dict


def search_web(query: str, max_results: int = 3) -> List[Dict[str, str]]:
    """
    Поиск в интернете через DuckDuckGo
    
    Args:
        query: Поисковый запрос
        max_results: Максимальное количество результатов (по умолчанию 3)
    
    Returns:
        Список источников: [{"title": "...", "url": "...", "snippet": "..."}]
    """
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        
        sources = []
        for result in results[:max_results]:
            sources.append({
                "title": result.get("title", "No title"),
                "url": result.get("href", ""),
                "snippet": result.get("body", "")
            })
        
        return sources
    
    except Exception as e:
        print(f"Web search error: {e}")
        return []


# Тест
if __name__ == "__main__":
    query = "Google Gemini AI model"
    sources = search_web(query, max_results=3)
    
    print(f"🔍 Search: {query}\n")
    for i, source in enumerate(sources, 1):
        print(f"{i}. {source['title']}")
        print(f"   {source['url']}")
        print(f"   {source['snippet']}\n")
```

---

## 🔧 Шаг 3: Обнови `api/v1/chat.py`

### 3.1 Импортируй web_search

**В начало файла:**
```python
from lib.web_search import search_web
```

### 3.2 Найди где вызывается Gemini

Примерно так:
```python
@app.post("/api/v1/chat")
async def chat_endpoint(body: ChatRequest):
    # ... получение ответа от Gemini ...
    
    return {
        "answer": response,
        "sources": []  # ← ПУСТОЙ СПИСОК
    }
```

### 3.3 Полный код endpoint (обновлённый)

**Замени существующий endpoint на этот:**

```python
@app.post("/api/v1/chat")
async def chat_endpoint(body: ChatRequest):
    """
    POST /api/v1/chat
    Body: { "message": str, "mode": str, "use_rag": bool }
    Response: { "answer": str, "sources": list, "provider": str }
    """
    
    # 1. Для режима "general" — ищем источники в интернете
    sources = []
    if body.mode == "general":
        sources = search_web(body.message, max_results=3)
    
    # 2. Формируем промпт для Gemini
    system_prompt = """Ты полезный ассистент. Отвечай кратко и информативно.

Если предоставлены источники, используй их для генерации ответа.
В конце ответа укажи источники в формате:

📚 Источники:
1. [Название источника](URL)
2. [Название источника](URL)
3. [Название источника](URL)
"""
    
    if sources:
        # Добавляем контекст из найденных источников
        context = "\n\n".join([
            f"Источник {i}: {s['title']}\n{s['snippet']}\nURL: {s['url']}"
            for i, s in enumerate(sources, 1)
        ])
        
        user_prompt = f"""
Контекст из интернета:
{context}

Вопрос пользователя: {body.message}

Используй контекст для ответа. В конце ответа укажи источники в формате:

📚 Источники:
1. [Название](URL)
2. [Название](URL)
3. [Название](URL)
"""
    else:
        user_prompt = body.message
    
    # 3. Вызываем Gemini
    try:
        from lib.gemini_client import get_gemini_response
        response = await get_gemini_response(
            message=user_prompt,
            system_prompt=system_prompt
        )
    except Exception as e:
        print(f"Gemini error: {e}")
        response = "Извините, произошла ошибка при генерации ответа."
    
    # 4. Возвращаем ответ с источниками
    return {
        "answer": response,
        "sources": sources,  # ← ТЕПЕРЬ ИСТОЧНИКИ ЗДЕСЬ
        "provider": "gemini",
        "model": "gemini-2.5-flash"
    }
```

---

## 🧪 Шаг 4: Тест локально

### 4.1 Установи зависимости

```bash
cd d:\ai\vafe-api
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 4.2 Запусти API

```bash
.\venv\Scripts\python -m uvicorn api.v1.chat:app --reload --port 8000
```

### 4.3 Тест через curl

```bash
curl -X POST http://localhost:8000/api/v1/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\": \"Расскажи о себе\", \"mode\": \"general\"}"
```

### 4.4 Ожидаемый ответ

```json
{
  "answer": "Я — большая языковая модель, разработанная Google. Gemini использует передовые архитектуры трансформеров...\n\n📚 Источники:\n1. [Google Gemini](https://ai.google.dev/)\n2. [Wikipedia — Gemini](https://en.wikipedia.org/wiki/Gemini_(LLM))\n3. [Vercel AI SDK](https://vercel.com/ai)",
  "sources": [
    {
      "title": "Google Gemini - AI Model",
      "url": "https://ai.google.dev/",
      "snippet": "Gemini is a large language model developed by Google..."
    },
    {
      "title": "Gemini (LLM) - Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Gemini_(LLM)",
      "snippet": "Gemini is a family of large language models..."
    },
    {
      "title": "Vercel AI SDK",
      "url": "https://vercel.com/ai",
      "snippet": "Build AI-powered applications with Vercel..."
    }
  ],
  "provider": "gemini",
  "model": "gemini-2.5-flash"
}
```

---

## 🚀 Шаг 5: Деплой на Vercel

### 5.1 Закоммить изменения

```bash
cd d:\ai\vafe-api
git add requirements.txt
git add lib/web_search.py
git add api/v1/chat.py
git commit -m "Add web search for sources in general mode

- DuckDuckGo search for 3 sources
- Gemini generates resume with clickable links
- Sources returned in API response"
git push origin main
```

### 5.2 Деплой

```bash
vercel --prod
```

### 5.3 Проверь логи

Открой: https://vercel.com/dizel0110/vafe-api → **Logs**

Убедись, что нет ошибок импорта `duckduckgo-search`.

---

## 📊 Чек-лист выполнения

- [ ] Обновил `requirements.txt` (добавил `duckduckgo-search`)
- [ ] Установил зависимости: `pip install -r requirements.txt`
- [ ] Создал `lib/web_search.py`
- [ ] Обновил `api/v1/chat.py` (полный код endpoint)
- [ ] Протестировал локально (`uvicorn --reload`)
- [ ] Проверил через curl (ответ с sources)
- [ ] Закоммитил изменения
- [ ] Задеплоил на Vercel
- [ ] Проверил логи Vercel (нет ошибок)
- [ ] Протестировал на сайте (dizel0110.github.io)

---

## 🔗 Ссылки

- **Проект:** `d:\ai\vafe-api`
- **DuckDuckGo Search:** https://pypi.org/project/duckduckgo-search/
- **Vercel Dashboard:** https://vercel.com/dizel0110/vafe-api
- **API Test:** `curl -X POST https://vafe-api.vercel.app/api/v1/chat -H "Content-Type: application/json" -d "{\"message\": \"Расскажи о себе\", \"mode\": \"general\"}"`

---

## 📚 Примеры запросов

### Запрос 1: "Расскажи о себе"

**Источники (из DuckDuckGo):**
1. Google Gemini documentation
2. Wikipedia — Gemini (LLM)
3. AI news articles

**Gemini генерирует:**
> "Я — большая языковая модель, разработанная Google. Gemini использует передовые архитектуры трансформеров для генерации текста, кода и анализа данных...
>
> 📚 Источники:
> 1. [Google Gemini](https://ai.google.dev/)
> 2. [Wikipedia — Gemini](https://en.wikipedia.org/wiki/Gemini_(LLM))
> 3. [The Verge — Google Gemini](https://www.theverge.com/google-gemini)"

### Запрос 2: "Что такое RAG?"

**Источники:**
1. Retrieval-Augmented Generation (RAG) — Wikipedia
2. LangChain RAG documentation
3. Medium article about RAG

**Gemini генерирует:**
> "RAG (Retrieval-Augmented Generation) — это подход, который улучшает ответы LLM...
>
> 📚 Источники:
> 1. [RAG — Wikipedia](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)
> 2. [LangChain RAG](https://python.langchain.com/docs/use_cases/qa_with_sources/)
> 3. [Towards Data Science — RAG](https://towardsdatascience.com/rag)"

---

## 🐛 Возможные проблемы

### 1. Ошибка импорта `duckduckgo-search`

**Решение:**
```bash
pip install duckduckgo-search
# Или проверь requirements.txt
```

### 2. Vercel не устанавливает зависимости

**Решение:** Проверь `requirements.txt` — должен быть в корне проекта.

### 3. Пустые источники

**Решение:** DuckDuckGo может блокировать запросы. Добавь User-Agent:
```python
from duckduckgo_search import DDGS

with DDGS(headers={"User-Agent": "Mozilla/5.0"}) as ddgs:
    results = list(ddgs.text(query, max_results=max_results))
```

### 4. Gemini не указывает источники в ответе

**Решение:** Проверь промпт — должна быть явная инструкция:
```
В конце ответа укажи источники в формате:

📚 Источники:
1. [Название](URL)
2. [Название](URL)
```

---

## ✅ После выполнения

1. **Проверь на сайте:**
   - Открой https://dizel0110.github.io
   - Режим "Общий" 💬
   - Спроси: "Расскажи о себе"
   - **Ожидаемый результат:** Ответ Gemini + 3 кликабельных источника

2. **Обнови `_JOURNAL.md`:**
   ```markdown
   ## 📅 19.03.2026 — Источники из интернета ✅
   
   **Задача:** Добавить поиск источников в vafe-api
   **Статус:** ✅ Выполнено
   **Файлы:** `lib/web_search.py`, `api/v1/chat.py`, `requirements.txt`
   ```

---

**После выполнения — чат будет показывать реальные источники из интернета с резюме от Gemini!** 🎉

---

**Контакт:** dizel0110@gmail.com | Telegram: @dizel0110  
**Следующий этап:** `vortex-afe` — RAPTOR + ML-ядро
