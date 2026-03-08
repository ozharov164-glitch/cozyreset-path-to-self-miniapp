# Как исправить 404 на Vercel (один раз)

Сейчас **https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app** отдаёт 404 (DEPLOYMENT_NOT_FOUND). Сделай одно из двух.

---

## Вариант А: Redeploy в текущем проекте (если проект уже есть)

1. Открой **https://vercel.com/ozharov164-9998s-projects/path-to-self-miniapp**.
2. Вкладка **Deployments**. Если есть хотя бы один деплой (любой статус) — нажми у него **⋯** (три точки) → **Redeploy** → **Redeploy** ещё раз. Дождись статуса **Ready**.
3. Если деплоев нет — перейди к варианту Б.

---

## Вариант Б: Новый проект из GitHub (гарантированно работает)

1. Открой **https://vercel.com** → **Add New…** → **Project**.
2. **Import Git Repository** → выбери **GitHub** → найди **ozharov164-glitch/cozyreset-path-to-self-miniapp** → **Import**.
3. **Configure Project:**  
   - **Project Name:** оставь `path-to-self-miniapp` (или как хочешь).  
   - **Environment Variables:** добавь **VITE_BOT_BACKEND_URL** = `http://217.114.11.97:8080`.  
4. Нажми **Deploy**. Дождись окончания сборки (статус **Ready**).
5. Если имя проекта другое — в настройках проекта посмотри **Domains** и скопируй Production URL (например `https://path-to-self-miniapp-xxx.vercel.app`).  
6. **Важно для бота:** в боте используется URL **https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app**. Если после варианта Б у тебя другой URL — его нужно прописать в настройках бота (на сервере в `.env`: `MINI_APP_PATH_TO_SELF_URL=твой_новый_url`) и перезапустить бота, либо переименовать проект в Vercel в `path-to-self-miniapp` и привязать домен команды.

После успешного деплоя открой в браузере Production URL — должна открыться Mini App (не 404).
