# Подключение GitHub к Vercel (один раз)

Уже сделано через API:
- Переменная **VITE_BOT_BACKEND_URL** в проекте Vercel установлена в `http://217.114.11.97:8080`.

Чтобы деплои проходили без ошибки «Git author must have access», нужно один раз связать аккаунт и репозиторий.

---

## Шаг 1. Подключить GitHub к Vercel (Login Connection)

1. Зайди в **Vercel**: https://vercel.com  
2. Открой настройки: **Account Settings** (или команды **ozharov164-9998s-projects** → **Settings**).  
3. Раздел **Git** или **Login Connections** → **Connect** напротив **GitHub**.  
4. Разреши доступ к аккаунту **ozharov164-glitch** и при необходимости к репозиторию **cozyreset-path-to-self-miniapp**.

Если GitHub уже подключён — этот шаг можно пропустить.

---

## Шаг 2. Привязать репозиторий к проекту

1. В Vercel открой проект **path-to-self-miniapp**:  
   https://vercel.com/ozharov164-9998s-projects/path-to-self-miniapp  
2. Перейди в **Settings** → **Git**.  
3. Если проект ещё не связан с Git: нажми **Connect Git Repository** и выбери **ozharov164-glitch/cozyreset-path-to-self-miniapp**, ветку **main**.  
4. Если репозиторий уже подключён — можно сразу перейти к шагу 3.

---

## Шаг 3. Убедиться, что автор коммита в команде

Ошибка «Git author … must have access to the team» значит, что автор последнего коммита не считается участником команды Vercel.

- Либо добавь свой **GitHub-аккаунт** (или email, которым подписываются коммиты) в команду Vercel:  
  **Team Settings** → **Members** → **Invite** (email или привязка GitHub).  
- Либо после подключения репо (шаг 2) делай деплой через **Redeploy** в Vercel по последнему коммиту — иногда после связки с GitHub проверка автора проходит.

---

## Шаг 4. Запустить деплой

После шагов 1–3 можно:

- Нажать **Redeploy** у последнего деплоя в Vercel (Deployments → … → Redeploy),  
  **или**
- Сделать любой **push в main** — если репо подключён, Vercel задеплоит сам,  
  **или**
- Из папки проекта:  
  `VERCEL_TOKEN=твой_токен ./deploy-vercel.sh`

Production URL: **https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app**

---

## Автодеплой через GitHub Actions

В репозитории добавлен workflow `.github/workflows/deploy-vercel.yml`: при push в `main` он собирает проект и деплоит в Vercel.

Нужно один раз добавить секрет в GitHub:
- Репозиторий **ozharov164-glitch/cozyreset-path-to-self-miniapp** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
- Имя: **VERCEL_TOKEN**, значение: твой Vercel Token (https://vercel.com/account/tokens)

После этого каждый push в `main` будет запускать деплой (если автор коммита в команде Vercel — сборка пройдёт).
