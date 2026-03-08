# Отчёт для Грока — деплой на Vercel (Mini App «Путь к Себе»)

Используй этот файл как источник правды по состоянию деплоя. Репозиторий: **https://github.com/ozharov164-glitch/cozyreset-path-to-self-miniapp**.

---

## Что было сделано (по шагам)

### 1. Подготовка проекта к Vercel

- В корне проекта создан **`vercel.json`** с настройками:
  - `buildCommand`: `npm run build`
  - `outputDirectory`: `dist`
  - `framework`: `vite`
  - `cleanUrls`: true
  - `trailingSlash`: false
- **README.md** обновлён: пошаговая инструкция по деплою на Vercel, раздел «Эндпоинты бэкенда» с точными JSON-примерами, раздел «Production URL».
- Выполнены коммит и push в GitHub с сообщением: `chore: prepare for Vercel deployment + vercel.json + updated README`.

### 2. Деплой через Vercel CLI с токеном пользователя

- Использован **Vercel Personal Access Token** (передан пользователем).
- Выполнена команда:  
  `npx vercel --prod --yes --token=... --scope ozharov164-9998s-projects`
- **Scope** взят из ответа API при первом запуске: `ozharov164-9998s-projects` (team).

### 3. Результат первого запуска CLI

- Проект на Vercel **создан**: имя **path-to-self-miniapp**, team **ozharov164-9998s-projects**.
- Локально создана папка **`.vercel`** (она в `.gitignore`, в репозиторий не попала).
- При попытке связать репозиторий с GitHub Vercel вернул ошибку:  
  **«You need to add a Login Connection to your GitHub account first»** (400).  
  То есть в аккаунте Vercel не настроено подключение к GitHub (или нет доступа к этому репо).
- Файлы были загружены на Vercel, деплой запущен. При сборке на стороне Vercel возникла ошибка (локально у CLI тоже была EPERM при записи в кэш — возможна связь с окружением/sandbox).

### 4. Повторный запуск CLI (с полными правами)

- Команда запущена снова с тем же токеном и scope.
- Ошибка от Vercel:  
  **«Git author dmitriidekhanov@MacBook-Air-od-Dmitrij.local must have access to the team ozharov164-9998's projects on Vercel to create deployments.»**  
  То есть деплой из CLI привязан к локальному Git author, а у этого автора нет доступа к team в Vercel — сборки с таким контекстом блокируются.

### 5. Работа через Vercel API

- По **REST API Vercel** (Bearer-токен пользователя) выполнено:
  1. **GET проект**  
     `GET https://api.vercel.com/v9/projects/path-to-self-miniapp?teamId=team_qR1Va0kQceCraMDJKYvewJVu`  
     Подтверждено: проект есть, настройки (buildCommand, outputDirectory, framework) совпадают с `vercel.json`.
  2. **Добавлена переменная окружения**  
     `POST .../v10/projects/prj_PrCetGsazLNNHuYIO1Rq4bbaLMg8/env?teamId=team_qR1Va0kQceCraMDJKYvewJVu`  
     - **Key:** `VITE_BOT_BACKEND_URL`  
     - **Value:** `https://placeholder.backend` (временная заглушка)  
     - **Target:** production, preview  
     Переменная успешно создана (ответ API без ошибок).

### 6. Состояние деплоев по данным API

- У проекта есть деплои; последние из них в статусе **readyState: "ERROR"**.
- **Production alias** проекта (из ответа API):  
  **path-to-self-miniapp-ozharov164-9998s-projects.vercel.app**
- Итоговый **Production URL** для бота:  
  **https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app**

### 7. Обновление репозитория

- В **README.md** в разделе «Production URL» прописан актуальный адрес:  
  `https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app`
- Выполнены коммит и push: `docs: set Production URL for Vercel`.

---

## Текущее состояние (для Грока)

| Элемент | Статус |
|--------|--------|
| Проект на Vercel | Создан: **path-to-self-miniapp**, team **ozharov164-9998s-projects** |
| vercel.json | В репо, настройки build/output/framework заданы |
| Env на Vercel | Добавлена **VITE_BOT_BACKEND_URL** = `https://placeholder.backend` (нужно заменить на реальный URL бэкенда вручную) |
| Связка Git (Vercel ↔ GitHub) | Не настроена: при деплое через CLI была ошибка «add a Login Connection to your GitHub account first» |
| Деплои | Последние в статусе **ERROR** (ограничение по Git author при деплое через CLI) |
| Production URL | **https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app** (указан в README) |

---

## Что нужно сделать дальше (рекомендации для Грока)

1. **Подключить репозиторий к Vercel через веб-интерфейс**  
   - Пользователь заходит на https://vercel.com → команда **ozharov164-9998s-projects** → **Add New** → **Project**.  
   - Импортирует **ozharov164-glitch/cozyreset-path-to-self-miniapp** (если ещё не импортирован).  
   - При необходимости: **Account Settings** → **Login Connections** → подключить GitHub и дать Vercel доступ к этому репо.  
   - В настройках проекта проверить: **Build Command** = `npm run build`, **Output Directory** = `dist`, **Framework** = Vite (часто подтягивается из `vercel.json`).

2. **Заменить значение VITE_BOT_BACKEND_URL**  
   - В Vercel: проект **path-to-self-miniapp** → **Settings** → **Environment Variables**.  
   - Найти **VITE_BOT_BACKEND_URL**, заменить `https://placeholder.backend` на реальный URL бэкенда бота (без слэша в конце).  
   - Применить для Production (и при необходимости для Preview).

3. **Запустить успешный деплой**  
   - Либо нажать **Redeploy** у последнего деплоя (после связки с Git и исправления env).  
   - Либо сделать новый push в ветку `main` после подключения репо — тогда Vercel сам соберёт и задеплоит.  
   Цель: деплой в статусе **READY**, а не ERROR.

4. **Проверить Production URL**  
   - После успешного деплоя открыть в браузере:  
     **https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app**  
   - Убедиться, что Mini App загружается (возможна белая страница до настройки бэкенда — это ок, если сборка и раздача статики работают).

5. **Передать пользователю**  
   - Финальный Production URL для вставки в бота (Web App URL):  
     **https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app**  
   - Напоминание заменить в Vercel `VITE_BOT_BACKEND_URL` на реальный URL бэкенда.

---

## Полезные данные для API/скриптов

- **Team ID:** `team_qR1Va0kQceCraMDJKYvewJVu`
- **Project ID:** `prj_PrCetGsazLNNHuYIO1Rq4bbaLMg8`
- **Project name:** `path-to-self-miniapp`
- **Production hostname (alias):** `path-to-self-miniapp-ozharov164-9998s-projects.vercel.app`

Токен Vercel пользователь передавал в чат; для дальнейшей автоматизации его нужно хранить в секретах (например GitHub Actions или env), не в коде и не в отчётах.
