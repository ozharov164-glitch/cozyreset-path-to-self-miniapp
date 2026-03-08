# Vercel Personal (без team) — обход блокировки Hobby

Если хочешь использовать Vercel бесплатно (без Pro), создай проект **в личном аккаунте**, а не в команде:

1. Зайди на **https://vercel.com** и переключись на **личный** аккаунт (не team ozharov164-9998s-projects).
2. **Add New…** → **Project** → **Import** репозитория **ozharov164-glitch/cozyreset-path-to-self-miniapp**.
3. **Framework:** Vite, **Build Command:** `npm run build`, **Output:** `dist`.
4. **Environment Variable:** `VITE_BOT_BACKEND_URL` = `http://217.114.11.97:8080`.
5. **Deploy.** В личном аккаунте проверка «team member» не применяется — деплой должен пройти.
6. Скопируй Production URL (например `https://path-to-self-miniapp-xxx.vercel.app`) и укажи его в боте (см. ИНТЕГРАЦИЯ_ВЫПОЛНЕНА.md).

Для автоматического создания проекта через API нужен **VERCEL_TOKEN** (пришли, если есть).
