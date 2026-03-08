# Разработка и Деплой

## 📁 Структура папок

```
d:\ai\github\
├── dizel0110-portfolio/     # Основная разработка (тестовая среда)
│   ├── src/
│   ├── public/
│   ├── dist/                # Локальный билд (не в git)
│   └── ...
│
└── dizel0110.github.io/     # Production репозиторий для GitHub Pages
    ├── src/
    ├── public/
    ├── .github/workflows/   # GitHub Actions для авто-деплоя
    ├── dist/                # Локальный билд (не в git)
    └── ...
```

### Зачем две папки?

| Папка | Назначение |
|-------|------------|
| `dizel0110-portfolio` | Локальная разработка, тестирование функций |
| `dizel0110.github.io` | Production код → публикуется на https://dizel0110.github.io/ |

---

## 🔄 Процесс работы

### 1. Разработка

```bash
# Перейдите в рабочую папку
cd d:\ai\github\dizel0110.github.io

# Запустите dev-сервер
npm run dev
# → http://localhost:5173
```

### 2. Внесение изменений

Редактируйте файлы в `src/`:
- `src/App.tsx` — главный компонент (футер, хедер)
- `src/components/` — отдельные секции
- `src/index.css` — стили

### 3. Коммит и Пуш

```bash
git add .
git commit -m "Описание изменений"
git push origin main
```

### 4. Автоматический Деплой

После `git push`:
1. GitHub запускает **Actions** (workflow `.github/workflows/deploy.yml`)
2. Сборка: `npm ci` → `npm run build`
3. Создаётся артефакт из папки `dist/`
4. GitHub Pages публикует содержимое `dist/`
5. Через ~1-2 минуты сайт обновлён на **https://dizel0110.github.io/**

---

## 🏗️ Что происходит при деплое

```
git push → GitHub → Actions (deploy.yml)
                    ↓
              npm run build
                    ↓
              dist/ папка
                    ↓
         actions/upload-pages-artifact
                    ↓
         actions/deploy-pages
                    ↓
         GitHub Pages (dizel0110.github.io)
```

### Содержимое `dist/index.html`

```html
<!-- БИЛД (публикуется) -->
<script src="/assets/index-FodNrc5S.js"></script>
<link href="/assets/index-pZ5Tp1Zv.css" rel="stylesheet">
```

**НЕ** путать с исходным `index.html`:
```html
<!-- ИСХОДНИК (не публикуется) -->
<script src="/src/main.tsx"></script>
```

---

## 📦 Что в git, а что нет

### ✅ Коммитить в git

| Файлы/Папки | Почему |
|-------------|--------|
| `src/` | Исходный код |
| `public/` | Статические файлы |
| `.github/workflows/` | CI/CD конфигурация |
| `package.json` | Зависимости и скрипты |
| `vite.config.ts` | Настройки сборщика |
| `tsconfig.json` | Настройки TypeScript |
| `.gitignore` | Исключения из git |
| `README.md`, `DEVELOPMENT.md` | Документация |

### ❌ НЕ коммитить в git

| Файлы/Папки | Почему |
|-------------|--------|
| `dist/` | Результат сборки (создаётся Actions) |
| `node_modules/` | Зависимости (устанавливаются через `npm ci`) |
| `assets/` | Локальные билд-файлы (не нужны в репо) |
| `.env`, `*.local` | Переменные окружения |
| `.venv/` | Python окружение |

---

## 🛠️ Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера (Vite) |
| `npm run build` | Сборка production версии в `dist/` |
| `npm run preview` | Просмотр билда локально |
| `npm run lint` | Проверка кода ESLint |
| `git status` | Статус изменений |
| `git push` | Отправка изменений на GitHub |

---

## 🔍 Проверка деплоя

### 1. Статус GitHub Actions

Откройте: https://github.com/dizel0110/dizel0110.github.io/actions

- ✅ Зелёная галочка — деплой успешен
- 🔴 Красный крестик — ошибка сборки

### 2. Проверка сайта

```bash
curl https://dizel0110.github.io/
```

Должен вернуться HTML с ссылками на `/assets/index-*.js`

### 3. Кэш браузера

Если сайт не обновился:
- `Ctrl + Shift + R` (Windows) — жёсткая перезагрузка
- Очистите кэш браузера

---

## ⚠️ Частые проблемы

### Сайт показывает 404

**Причина:** GitHub Pages ещё не переключился на Actions.

**Решение:** 
1. Проверьте https://github.com/dizel0110/dizel0110.github.io/actions
2. Дождитесь успешного завершения workflow
3. GitHub автоматически переключит источник

### Сайт показывает пустую страницу

**Причина:** В `dist/index.html` неправильные пути к JS/CSS.

**Решение:**
1. Проверьте `vite.config.ts` — `base: '/'` для `dizel0110.github.io`
2. Запустите `npm run build` локально
3. Проверьте `dist/index.html`

### Workflow не запускается

**Причина:** Ошибка в `.github/workflows/deploy.yml`.

**Решение:**
1. Проверьте синтаксис YAML
2. Убедитесь, что `environment: github-pages` указан
3. Проверьте права доступа в Settings → Actions

---

## 📝 Чеклист перед пушем

- [ ] Изменения протестированы локально (`npm run dev`)
- [ ] `npm run build` выполняется без ошибок
- [ ] Все изменения закоммичены
- [ ] В коммите только исходники (нет `dist/`, `node_modules/`)
- [ ] Push в ветку `main`

---

## 🔗 Ссылки

- **Репозиторий:** https://github.com/dizel0110/dizel0110.github.io
- **GitHub Actions:** https://github.com/dizel0110/dizel0110.github.io/actions
- **Сайт:** https://dizel0110.github.io/
- **Настройки Pages:** https://github.com/dizel0110/dizel0110.github.io/settings/pages
