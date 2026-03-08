#!/usr/bin/env bash
# Обновление VITE_BOT_BACKEND_URL в Vercel и деплой Mini App «Путь к Себе».
# Использование: VERCEL_TOKEN=твой_токен ./deploy-vercel.sh
# Токен: https://vercel.com/account/tokens

set -e
BACKEND_URL="${VITE_BOT_BACKEND_URL:-http://217.114.11.97:8080}"
TEAM_ID="team_qR1Va0kQceCraMDJKYvewJVu"
PROJECT_ID="prj_PrCetGsazLNNHuYIO1Rq4bbaLMg8"
API="https://api.vercel.com"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Задай VERCEL_TOKEN: VERCEL_TOKEN=твой_токен $0"
  exit 1
fi

echo "=== 1. Обновление VITE_BOT_BACKEND_URL в Vercel ==="
ENVS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "$API/v9/projects/$PROJECT_ID/env?teamId=$TEAM_ID")
ENV_ID=$(echo "$ENVS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
# Ищем id переменной с ключом VITE_BOT_BACKEND_URL (в ответе есть key и id)
ENV_ID=$(echo "$ENVS" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    envs = d.get('envs', d) if isinstance(d.get('envs'), list) else (d if isinstance(d, list) else [])
    for e in envs:
        if e.get('key') == 'VITE_BOT_BACKEND_URL':
            print(e['id'])
            break
except Exception:
    pass
" 2>/dev/null || true)

if [ -n "$ENV_ID" ]; then
  curl -s -X PATCH \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"value\":\"$BACKEND_URL\",\"target\":[\"production\",\"preview\"]}" \
    "$API/v9/projects/$PROJECT_ID/env/$ENV_ID?teamId=$TEAM_ID" > /dev/null && echo "Env VITE_BOT_BACKEND_URL обновлён." || echo "PATCH env: проверь токен и проект."
else
  echo "Создание переменной VITE_BOT_BACKEND_URL..."
  curl -s -X POST \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"VITE_BOT_BACKEND_URL\",\"value\":\"$BACKEND_URL\",\"target\":[\"production\",\"preview\"]}" \
    "$API/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" > /dev/null && echo "Env создан." || echo "POST env: проверь токен."
fi

echo "=== 2. Сборка и деплой на Vercel ==="
npm run build
npx vercel deploy --prod --yes --token "$VERCEL_TOKEN" --scope ozharov164-9998s-projects

echo "Готово. Production: https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app"
