# Как подключить Vercel к GitHub (простая инструкция)

Один раз связать Vercel с GitHub — дальше каждый push в репозиторий будет автоматически деплоить приложение.

---

## Вариант А: проект уже есть в Vercel (path-to-self-miniapp)

Если проект **path-to-self-miniapp** уже создан в Vercel, нужно только привязать к нему репозиторий.

### Шаг 1. Открой проект в Vercel

1. Зайди на сайт **https://vercel.com** и войди в аккаунт.
2. Вверху выбери команду **ozharov164-9998s-projects** (или свою команду).
3. В списке проектов найди **path-to-self-miniapp** и нажми на него.  
   Или открой сразу: **https://vercel.com/ozharov164-9998s-projects/path-to-self-miniapp**

### Шаг 2. Открой настройки Git

1. В проекте сверху нажми вкладку **Settings** (Настройки).
2. В левом меню выбери пункт **Git**.

### Шаг 3. Подключи репозиторий

1. Если видишь кнопку **Connect Git Repository** — нажми её.
2. Появится выбор: **GitHub** / GitLab / Bitbucket. Выбери **GitHub**.
3. Если Vercel спросит доступ к GitHub — нажми **Authorize** / **Установить** и разреши доступ к аккаунту **ozharov164-glitch** (и к репозиторию **cozyreset-path-to-self-miniapp**, если спросит).
4. В списке репозиториев найди **ozharov164-glitch/cozyreset-path-to-self-miniapp** и нажми **Connect** / **Подключить**.
5. Ветку оставь **main**, при необходимости нажми **Save** / **Deploy**.

После этого проект будет связан с GitHub: каждый **push в main** будет запускать новый деплой.

---

## Вариант Б: создаёшь новый проект из GitHub

Если проекта в Vercel ещё нет или хочешь создать связку с нуля:

### Шаг 1. Импорт из GitHub

1. Зайди на **https://vercel.com** и войди в аккаунт.
2. На главной нажми **Add New…** → **Project** (или **Import Project**).
3. Увидишь список репозиториев из GitHub. Если GitHub не подключён — нажми **Import Git Repository** и выбери **Continue with GitHub**, войди в GitHub и разреши доступ.
4. Найди репозиторий **cozyreset-path-to-self-miniapp** и нажми **Import** напротив него.

### Шаг 2. Настройки проекта

1. Имя проекта можно оставить **path-to-self-miniapp**.
2. В **Environment Variables** (Переменные окружения) проверь или добавь:
   - **Name:** `VITE_BOT_BACKEND_URL`
   - **Value:** `http://217.114.11.97:8080`
3. Нажми **Deploy**. Vercel соберёт проект и задеплоит его. Дальше каждый push в **main** будет автоматически вызывать новый деплой.

---

## Где в Vercel искать «Git» и «Connect»?

- **Главная Vercel** → твой проект → вкладка **Settings** → в левой колонке пункт **Git**.
- Если кнопки **Connect Git Repository** нет, а написано что-то вроде «No Git repository connected» — рядом обычно есть **Connect** или **Link**; нажимай и выбирай **GitHub**, затем репозиторий **ozharov164-glitch/cozyreset-path-to-self-miniapp**.

---

## Что уже сделано

- В проекте **path-to-self-miniapp** переменная **VITE_BOT_BACKEND_URL** уже установлена в `http://217.114.11.97:8080` (через API).

---

## Итог

| Действие | Где |
|----------|-----|
| Войти в Vercel | https://vercel.com |
| Открыть проект | Команда → **path-to-self-miniapp** |
| Включить Git | **Settings** → **Git** → **Connect Git Repository** |
| Выбрать репо | **GitHub** → **ozharov164-glitch/cozyreset-path-to-self-miniapp** → **Connect** |

После подключения адрес приложения: **https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app**
