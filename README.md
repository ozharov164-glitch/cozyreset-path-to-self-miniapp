# 🌱 Путь к Себе — Telegram Mini App

Mini App **«Сад Внутреннего Я»** для бота CozyReset (ВключиСебя AI). Объёмные тесты (тревога, настроение, самооценка, выгорание, границы, смысл жизни, прогресс терапии), 3D-сцена, сохранение результатов и история.

---

## Стек

- React 18 + TypeScript + Vite
- @react-three/fiber + @react-three/drei + three.js (3D-сад, bloom, частицы)
- Tailwind CSS v4 + Framer Motion
- TanStack Query + Zustand (localStorage) + Recharts + Zod
- Telegram WebApp SDK

---

## Команды

```bash
npm install
npm run dev
npm run build
npm run preview
```

---

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `VITE_BOT_BACKEND_URL` | URL бэкенда бота (например `https://your-server.com` или `http://217.114.11.97:8080`). **Без слэша в конце.** |

---

## Деплой на Vercel (пошаговая инструкция для пользователя)

1. Зайди на **[vercel.com](https://vercel.com)** и войди через GitHub.
2. Нажми **Add New** → **Project**.
3. Импортируй репозиторий **cozyreset-path-to-self-miniapp** (если не виден — настрой доступ к GitHub-аккаунту в Vercel).
4. В настройках проекта:
   - **Framework Preset:** Vite (определится автоматически при наличии `vercel.json` / `vite.config.ts`).
   - **Build Command:** `npm run build` (или оставь по умолчанию).
   - **Output Directory:** `dist`.
   - **Environment Variables:** добавь переменную:
     - **Name:** `VITE_BOT_BACKEND_URL`
     - **Value:** полный URL бэкенда бота (без слэша в конце), например `https://api.example.com`.
5. Нажми **Deploy**. Дождись окончания сборки.
6. После успешного деплоя скопируй **Production URL** (например `https://cozyreset-path-to-self-miniapp-xxx.vercel.app`).
7. Укажи этот URL в боте как **Web App URL** для кнопки/команды, открывающей Mini App.
8. При следующих push в ветку `main` Vercel будет автоматически пересобирать и деплоить проект.

---

## Production URL

**Production URL:** https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app

Укажи этот URL в настройках бота (Web App / WebAppInfo) как ссылку на Mini App. После подключения репозитория к GitHub в Vercel и успешного redeploy приложение будет доступно по этому адресу.

---

## Авторизация в Mini App

1. Токен из **store** (Zustand + localStorage).
2. Токен из **hash** URL: `#s=TOKEN` или `#token=TOKEN`.
3. **POST /mini-app/init** с `initData` из Telegram → в ответе `app_save_token` → сохраняем и используем во всех запросах.

При **401** приложение выполняет один автоматический re-init без показа ошибки пользователю.

---

## Эндпоинты бэкенда с точными JSON-примерами запросов/ответов

Бэкенд бота должен реализовать эти роуты. Авторизация: по полю `token` (значение `app_save_token`) в теле запроса (POST) или в query-параметре `token` (GET). CORS: разрешить origin Vercel и при необходимости `https://web.telegram.org`.

---

### POST /mini-app/save-test-result

Сохранение результата прохождения теста. В теле передаётся также `token` (app_save_token).

**Пример запроса (Request body):**

```json
{
  "token": "app_save_token_значение_из_init",
  "testId": "anxiety",
  "testTitle": "Тревога и беспокойство",
  "answers": [3, 7, 2, 5, 9, 4, 6, 1, 8, 5, 4, 3, 7, 2, 6, 9, 4, 5, 8, 3, 6, 7],
  "dimensions": { "anxiety": 5.2, "somatic": 4.1 },
  "completedAt": "2026-03-10T14:30:00.000Z"
}
```

- `testId` — один из: `anxiety`, `mood-energy`, `self-esteem`, `burnout`, `boundaries`, `meaning`, `progress`.
- `answers` — массив чисел от 1 до 10 (порядок = порядку вопросов в тесте).
- `dimensions` — опционально; сводные баллы по шкалам.

**Пример ответа (Response 200):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Ошибки:** `401` — невалидный/просроченный токен; `400` — невалидное тело.

---

### POST /mini-app/test-history

Список сохранённых результатов текущего пользователя. В теле передаётся `token` (app_save_token).

**Пример запроса (Request body):**

```json
{
  "token": "app_save_token_значение_из_init"
}
```

**Пример ответа (Response 200):**

```json
{
  "items": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "testId": "anxiety",
      "testTitle": "Тревога и беспокойство",
      "completedAt": "2026-03-10T14:30:00.000Z"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "testId": "burnout",
      "testTitle": "Эмоциональное выгорание",
      "completedAt": "2026-03-09T12:00:00.000Z"
    }
  ]
}
```

- `items` — массив, отсортированный по дате (новые сверху).

**Ошибки:** `401` — невалидный токен.

---

### GET /mini-app/test-result/{id}

Получение одного сохранённого результата по `id`. Пользователь видит только свои результаты.

**Пример запроса:**  
`GET /mini-app/test-result/a1b2c3d4-e5f6-7890-abcd-ef1234567890?token=app_save_token_значение_из_init`

**Пример ответа (Response 200):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "testId": "anxiety",
  "testTitle": "Тревога и беспокойство",
  "answers": [3, 7, 2, 5, 9, 4, 6, 1, 8, 5, 4, 3, 7, 2, 6, 9, 4, 5, 8, 3, 6, 7],
  "dimensions": { "anxiety": 5.2, "somatic": 4.1 },
  "completedAt": "2026-03-10T14:30:00.000Z"
}
```

**Ошибки:** `401` — не авторизован; `404` — результат не найден или принадлежит другому пользователю.

---

## После сохранения результата в Mini App

Пользователю показывается текст **«Результат сохранён ✅ Перейди в бота»** и кнопка **«Открыть бота»**, вызывающая `Telegram.WebApp.openTelegramLink('https://t.me/CozyReset_bot')`. Не используется `sendData` и не `?start=...` как основной поток связи с ботом.
