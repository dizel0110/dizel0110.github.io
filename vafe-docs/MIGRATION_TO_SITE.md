# 🚀 Перенос V-AFE Chat Widget в dizel0110.github.io

## 📋 Что переносим

Весь функционал чата из `vortex-afe` в основной репозиторий сайта:

```
dizel0110.github.io/
├── src/
│   ├── components/
│   │   ├── VafeChatWidget.tsx    ← Готово!
│   │   └── VafeChatWidget.css    ← Готово!
│   └── ...
├── public/
│   └── data/
│       ├── v-afe_core.json       ← Нужно добавить
│       └── about_dmitry.json     ← Нужно добавить
└── ...
```

---

## ✅ Уже выполнено

### 1. Компоненты установлены
- `src/components/VafeChatWidget.tsx` — 500 строк
- `src/components/VafeChatWidget.css` — 400 строк

### 2. Функционал работает
- ✅ 3 режима: Кайтинг 🪁 / О себе 👤 / Общий 💬
- ✅ Авто-смена при скролле
- ✅ Раздельная память для каждого режима
- ✅ Аватарка с GitHub
- ✅ Переключатель режимов
- ✅ Контекстный поиск

---

## 📝 Что нужно сделать

### Шаг 1: Добавить базы знаний в public/data

```bash
# Из vortex-afe скопировать:
cp d:/ai/vortex-afe/data/v-afe_core.json d:/ai/dizel0110.github.io/public/data/
cp d:/ai/vortex-afe/data/about_dmitry.json d:/ai/dizel0110.github.io/public/data/
```

**Или вручную:**
1. Создай папку `public/data/` в `dizel0110.github.io`
2. Скопируй `v-afe_core.json` и `about_dmitry.json`

### Шаг 2: Обновить VafeChatWidget.tsx (опционально)

Сейчас базы знаний встроены в компонент. Для динамической загрузки:

```typescript
// Вместо констант — загрузка из public/data
const [knowledgeBase, setKnowledgeBase] = useState<Concept[]>([]);

useEffect(() => {
  fetch('/data/v-afe_core.json')
    .then(r => r.json())
    .then(data => setKnowledgeBase(data.knowledge_base));
}, []);
```

**Но текущий вариант лучше:**
- ✅ Быстрее (нет fetch)
- ✅ Работает офлайн
- ✅ Меньше запросов к серверу

### Шаг 3: Закоммить изменения

```bash
cd d:\ai\dizel0110.github.io
git add src/components/VafeChatWidget.*
git add public/data/*.json  # Если добавляешь
git commit -m "Add V-AFE Chat Widget v2.1 with auto-mode switching"
git push
```

---

## 🎯 Финальная проверка

### Локально

```bash
cd d:\ai\dizel0110.github.io
npm run dev
```

**Проверить:**
1. Открыть http://localhost:5173
2. Прокрутить сайт — чат должен менять режимы
3. Переключить режимы вручную — история сохраняется
4. Проверить аватарку — должна загрузиться с GitHub

### На сайте

После `git push`:
1. Открыть https://dizel0110.github.io/
2. Проверить чат в правом нижнем углу
3. Прокрутить — проверить авто-смену

---

## 📊 Структура после переноса

```
dizel0110.github.io/
├── .github/
├── public/
│   └── data/
│       ├── v-afe_core.json      # 34 концепта
│       └── about_dmitry.json    # 16 записей
├── src/
│   ├── components/
│   │   ├── VafeChatWidget.tsx   # Чат-виджет
│   │   ├── VafeChatWidget.css   # Стили
│   │   ├── Hero.tsx
│   │   ├── TechnicalCore.tsx
│   │   └── ...
│   └── ...
├── package.json
└── README.md
```

---

## 🔗 Связь с vortex-afe

Для синхронизации обновлений:

```bash
# Скрипт из vortex-afe
python scripts/sync_widget.py

# Копирует обновлённый виджет в dizel0110.github.io
```

Или вручную:
```bash
copy d:\ai\vortex-afe\web\VafeChatWidget.tsx d:\ai\dizel0110.github.io\src\components\
```

---

## 🎉 Готово!

**После переноса:**
- ✅ Чат работает на сайте
- ✅ Авто-смена режимов при скролле
- ✅ Раздельная память
- ✅ Аватарка с GitHub
- ✅ 50+ записей в базе

**Следующий шаг:** Деплой на GitHub Pages!

```bash
cd d:\ai\dizel0110.github.io
git push
```

---

**Время деплоя:** 1-2 минуты  
**URL:** https://dizel0110.github.io/
