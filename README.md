# 🌱 Путь к Себе — Telegram Mini App

Mini App «Сад Внутреннего Я» для бота ВключиСебя AI. Прохождение объёмных тестов (тревога, настроение, самооценка, выгорание, границы, смысл жизни, прогресс терапии), сохранение результатов и история.

## Стек

- React 18 + TypeScript + Vite
- @react-three/fiber + @react-three/drei + three.js (3D — по дизайн-спеку)
- Tailwind CSS v4 + Framer Motion
- TanStack Query + Zod + Zustand (localStorage)
- Recharts, Telegram WebApp SDK

## Авторизация (приоритет)

1. `Telegram.WebApp.initDataUnsafe` + при необходимости полный `initData`
2. `app_save_token` из hash-параметра URL (`#s=TOKEN` или `#token=TOKEN`)
3. `POST /mini-app/init` → в ответе `app_save_token` → сохраняем в Zustand + localStorage

Все последующие запросы к API — с заголовком или телом, содержащим `app_save_token`. При 401 — автоматический повтор init (без показа ошибки пользователю).

## Переменные окружения

- `VITE_BOT_BACKEND_URL` — URL бэкенда бота (например `https://your-server.com` или `http://217.114.11.97:8080`). Без слэша в конце.

## Команды

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Эндпоинты бэкенда (для реализации на стороне бота)

Бэкенд должен предоставлять следующие роуты. Авторизация: по `app_save_token` в теле (или в заголовке), получение `user_id` через существующую логику (например `get_user_id_from_app_token`). CORS для origin Mini App.

### POST /mini-app/init

Уже существует в боте. Тело: `{ "initData": "<Telegram WebApp initData>" }`. Ответ: JSON с данными пользователя и полем `app_save_token`. Mini App сохраняет токен и использует его во всех запросах ниже.

### POST /mini-app/save-test-result

Сохранение результата прохождения теста.

**Тело (JSON):**

```json
{
  "testId": "anxiety",
  "testTitle": "Тревога и беспокойство",
  "answers": [3, 4, 2, 5, 1, ...],
  "dimensions": { "anxiety": 3.2, "somatic": 2.8 },
  "completedAt": "2026-03-08T20:00:00.000Z"
}
```

- `testId` (string) — идентификатор теста (anxiety, mood-energy, self-esteem, burnout, boundaries, meaning, progress).
- `testTitle` (string) — название теста для отображения.
- `answers` (number[]) — массив ответов по шкале 1–5 (порядок = порядку вопросов).
- `dimensions` (object, опционально) — сводные баллы по шкалам/измерениям.
- `completedAt` (string) — ISO 8601 дата/время завершения.

**Ответ (JSON):**

```json
{ "id": "uuid-or-unique-id" }
```

- `id` — уникальный идентификатор сохранённого результата (для последующего запроса GET и списка истории).

**Ошибки:** 401 — невалидный/просроченный токен; 400 — невалидное тело.

---

### POST /mini-app/test-history

Получение списка сохранённых результатов текущего пользователя.

**Тело (JSON):** `{}` или любое пустое тело. Авторизация по токену (в теле или заголовке, по договорённости с бэкендом).

**Ответ (JSON):**

```json
{
  "items": [
    {
      "id": "uuid-1",
      "testId": "anxiety",
      "testTitle": "Тревога и беспокойство",
      "completedAt": "2026-03-08T20:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "testId": "burnout",
      "testTitle": "Эмоциональное выгорание",
      "completedAt": "2026-03-07T18:30:00.000Z"
    }
  ]
}
```

- `items` — массив объектов, отсортированный по дате (новые сверху).
- В каждом элементе: `id`, `testId`, `testTitle`, `completedAt` (ISO 8601).

**Ошибки:** 401 — невалидный токен.

---

### GET /mini-app/test-result/{id}

Получение одного сохранённого результата по идентификатору. Пользователь может видеть только свои результаты (проверка по `user_id` по токену или по сохранённому результату).

**Параметры пути:** `id` — идентификатор результата (из ответа save-test-result или из списка history).

**Ответ (JSON):**

```json
{
  "id": "uuid-1",
  "testId": "anxiety",
  "testTitle": "Тревога и беспокойство",
  "answers": [3, 4, 2, 5, 1, ...],
  "dimensions": { "anxiety": 3.2 },
  "completedAt": "2026-03-08T20:00:00.000Z"
}
```

- Поля те же, что при сохранении; `answers` — полный массив ответов.

**Ошибки:** 401 — не авторизован; 404 — результат не найден или принадлежит другому пользователю.

---

## Деплой на Vercel

1. Подключи репозиторий к Vercel.
2. В настройках проекта задай переменную окружения `VITE_BOT_BACKEND_URL` (URL бэкенда бота).
3. Build command: `npm run build`, Output directory: `dist`.
4. После деплоя используй выданный URL как ссылку для Web App в боте (WebAppInfo).

## После сохранения результата

В приложении показывается текст: «Результат сохранён ✅ Перейди в бота» и кнопка «Открыть бота», вызывающая `Telegram.WebApp.openTelegramLink('https://t.me/CozyReset_bot')`. Не используется `sendData` и не используется `?start=param` как основной поток связи с ботом.
