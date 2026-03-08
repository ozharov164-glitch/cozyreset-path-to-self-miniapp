config.json — URL бэкенда для Mini App.
Сейчас используется Cloudflare Tunnel (HTTPS). Если туннель перезапустится и URL изменится — замените backendUrl в config.json на новый и задеплойте приложение.
Для постоянного URL: настройте nginx+certbot на сервере (см. scripts/setup-https-nginx.sh) и укажите backendUrl: "https://ваш-домен".
